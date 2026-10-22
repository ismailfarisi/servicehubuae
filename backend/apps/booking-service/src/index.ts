import { config } from "@servicehubuae/config";
import { ensureDatabase } from "@servicehubuae/database";
import { permissionMatrix } from "@servicehubuae/guards";
import { app } from "./app.ts";

await ensureDatabase();
await permissionMatrix.load();
permissionMatrix.startPolling();

app.listen(config.port.booking);

console.log(`[booking-service] running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
