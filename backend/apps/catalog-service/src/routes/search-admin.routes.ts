import { jwtAuth, requireRole } from "@mypickuae/guards";
import { Elysia } from "elysia";
import { container } from "../container.ts";

export const searchAdminRoutes = new Elysia({ prefix: "/admin/search" })
  .use(container)
  .use(jwtAuth)
  .use(requireRole("admin", "super_admin"))

  // Full upsert + prune of the service_offerings Typesense collection. Runs on
  // the nightly reconcile worker; responds immediately with the job id.
  .post("/services/reindex", async ({ user, set, enqueueServiceReindex }) => {
    const jobId = await enqueueServiceReindex((user as { id?: string } | null)?.id ?? null);
    set.status = 202;
    return {
      statusCode: 202,
      data: { jobId },
      timestamp: new Date().toISOString(),
    };
  });
