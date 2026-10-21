import { config } from "@mypickuae/config";
import "./container.ts";
import { permissionMatrix } from "@mypickuae/guards";
import { app } from "./app.ts";
import {
  createRetentionDeleteWorker,
  getRetentionDeleteQueue,
  scheduleRetentionDeleteCron,
} from "./domain/retention/retention-delete.cron.ts";
import {
  createScrubPiiWorker,
  getScrubPiiQueue,
  scheduleScrubPiiCron,
} from "./domain/retention/scrub-pii.cron.ts";

const _retentionDeleteQueue = getRetentionDeleteQueue();
const _retentionDeleteWorker = createRetentionDeleteWorker();
await scheduleRetentionDeleteCron(_retentionDeleteQueue);

const _scrubPiiQueue = getScrubPiiQueue();
const _scrubPiiWorker = createScrubPiiWorker();
await scheduleScrubPiiCron(_scrubPiiQueue);

await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen(config.port.integration);

// biome-ignore lint/suspicious/noConsole: bootstrap log
console.log(`[integration-service] running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
