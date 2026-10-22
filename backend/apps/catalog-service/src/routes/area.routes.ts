import { CreateAreaBody, UpdateAreaBody } from "@mypickuae/dto";
import { jwtAuth, requireRole } from "@mypickuae/guards";
import { auditPlugin } from "@mypickuae/plugins";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";

const ok = (data: unknown, statusCode = 200) => ({
  statusCode,
  data,
  timestamp: new Date().toISOString(),
});

// Public: the storefront's area picker and search filter.
export const areaRoutes = new Elysia({ prefix: "/areas" })
  .use(container)
  .get("/", async ({ areaService, set }) => {
    set.headers["cache-control"] = "public, max-age=300";
    return ok(await areaService.listPublic());
  });

export const areaAdminRoutes = new Elysia({ prefix: "/admin/areas" })
  .use(container)
  .use(jwtAuth)
  .use(requireRole("admin", "super_admin"))
  .use(auditPlugin)

  .get("/", async ({ areaService }) => ok(await areaService.listAdmin()))

  .post(
    "/",
    async ({ body, areaService, set }) => {
      set.status = 201;
      return ok(await areaService.create(body), 201);
    },
    { body: CreateAreaBody },
  )

  .patch(
    "/:id",
    async ({ params, body, areaService }) => ok(await areaService.update(params.id, body)),
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      body: UpdateAreaBody,
    },
  )

  .delete(
    "/:id",
    async ({ params, areaService }) => {
      await areaService.remove(params.id);
      return { statusCode: 200, message: "Area deleted", timestamp: new Date().toISOString() };
    },
    { params: t.Object({ id: t.String({ format: "uuid" }) }) },
  );
