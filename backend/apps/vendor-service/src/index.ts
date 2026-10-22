import { config } from "@servicehubuae/config";
import { ensureDatabase } from "@servicehubuae/database";
import { permissionMatrix } from "@servicehubuae/guards";
import { app } from "./app.ts";
import { ExpirePendingInvitesJob } from "./jobs/expire-pending-invites.job.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen(config.port.vendor);

console.log(`[vendor-service] running at http://${app.server?.hostname}:${app.server?.port}`);

if (config.bullmq?.redisUrl) {
  const expireInvitesJob = new ExpirePendingInvitesJob(config.bullmq.redisUrl);
  expireInvitesJob.start();
}

export type App = typeof app;
