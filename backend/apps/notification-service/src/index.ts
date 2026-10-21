import { config } from "@mypickuae/config";
import { ensureDatabase } from "@mypickuae/database";
import { permissionMatrix } from "@mypickuae/guards";
import { app } from "./app.ts";
import { PartitionMaintenanceService } from "./services/partition-maintenance.service.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen(config.port.notification);

console.log(`[notification-service] running at http://${app.server?.hostname}:${app.server?.port}`);

// Start partition maintenance job (creates future partitions, drops old ones)
const partitionMaintenance = new PartitionMaintenanceService();
partitionMaintenance.start();

export type App = typeof app;
