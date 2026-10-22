import { config } from "@mypickuae/config";
import { ensureDatabase } from "@mypickuae/database";
import { permissionMatrix } from "@mypickuae/guards";
import { app } from "./app.ts";
import { createServiceReconcileWorker } from "./domain/service-search/service-search-reindex.service.ts";
import { createServiceSearchSyncWorker } from "./domain/service-search/service-search-sync.job.ts";
import { ServiceSearchAdapter } from "./domain/service-search/service-search.adapter.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen({
  port: config.port.catalog,
  idleTimeout: 255,
});

console.log(`[catalog-service] running at http://${app.server?.hostname}:${app.server?.port}`);

const serviceSearchAdapter = new ServiceSearchAdapter();
try {
  await serviceSearchAdapter.ensureCollection();
} catch (err) {
  // A Typesense outage (or a transient retrieve() timeout when the collection
  // already exists, which then makes create() come back 409 already-exists)
  // must never take the whole catalog-service process down — this call only
  // exists to create the collection on first boot. The incremental sync worker
  // below does NOT self-heal this: indexOffering upserts straight into the
  // collection and never calls ensureCollection, so with removeOnFail: true
  // those jobs fail once and drop. The recovery path is the nightly reconcile
  // (createServiceReconcileWorker -> reindexAll, which does call
  // ensureCollection) at 03:15 Asia/Dubai, or POST /admin/search/services/reindex.
  console.error("[catalog-service] ensureCollection failed at boot:", (err as Error).message);
}

// Consumes the `service-search-sync` queue that this service's offering writes
// and booking-service's branch/service-area edits (service-search-notify.ts)
// both produce to.
const serviceSearchWorker = createServiceSearchSyncWorker(serviceSearchAdapter);
serviceSearchWorker.on("failed", (job, err) => {
  console.error(`Service search sync job ${job?.id} failed:`, err.message);
});

const serviceReconcileWorker = createServiceReconcileWorker();
serviceReconcileWorker.on("failed", (job, err) => {
  console.error(`Service search reconcile job ${job?.id} failed:`, err.message);
});

export type App = typeof app;
