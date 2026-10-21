import { config } from "@mypickuae/config";
import { ensureDatabase } from "@mypickuae/database";
import { permissionMatrix } from "@mypickuae/guards";
import { app } from "./app.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen({
  port: config.port.gateway,
  idleTimeout: 255,
});

console.log(`[api-gateway] running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
