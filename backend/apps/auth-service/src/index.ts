import { config } from "@mypickuae/config";
import { ensureDatabase } from "@mypickuae/database";
import { permissionMatrix } from "@mypickuae/guards";
import { app } from "./app.ts";
import { TokenCleanupService } from "./services/token-cleanup.service.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen(config.port.auth);

console.log(`[auth-service] running at http://${app.server?.hostname}:${app.server?.port}`);

// Start the expired/used token cleanup job (runs every 24h)
const tokenCleanup = new TokenCleanupService();
tokenCleanup.start();

export type App = typeof app;
