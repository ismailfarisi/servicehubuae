import { CreateCategoryBody, ReorderCategoriesBody, UpdateCategoryBody } from "@mypickuae/dto";
import { jwtAuth, requireRole } from "@mypickuae/guards";
import { auditPlugin } from "@mypickuae/plugins";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";

export const categoryAdminRoutes = new Elysia({ prefix: "/admin/categories" })
  .use(container)
  .use(jwtAuth)
  .use(requireRole("admin", "super_admin"))
  .use(auditPlugin)

  .get("/tree", async ({ categoryController }) => {
    const data = await categoryController.getTree({ includeInactive: true });
    return { statusCode: 200, data, timestamp: new Date().toISOString() };
  })

  .post(
    "/",
    async ({ body, categoryController, set }) => {
      const data = await categoryController.create(body);
      set.status = 201;
      return { statusCode: 201, data, timestamp: new Date().toISOString() };
    },
    { body: CreateCategoryBody },
  )

  .get(
    "/",
    async ({ query, categoryController }) => {
      const data = await categoryController.listForAdmin(query.page, query.limit, query.search);
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric({ minimum: 1 })),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
        search: t.Optional(t.String()),
      }),
    },
  )

  .patch(
    "/reorder",
    async ({ body, categoryController }) => {
      await categoryController.reorder(body.items);
      return {
        statusCode: 200,
        message: "Categories reordered",
        timestamp: new Date().toISOString(),
      };
    },
    { body: ReorderCategoriesBody },
  )

  .patch(
    "/:id",
    async ({ params, body, categoryController }) => {
      const data = await categoryController.update(params.id, body);
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      body: UpdateCategoryBody,
    },
  )

  .delete(
    "/:id",
    async ({ params, categoryController }) => {
      await categoryController.remove(params.id);
      return { statusCode: 200, message: "Category deleted", timestamp: new Date().toISOString() };
    },
    { params: t.Object({ id: t.String({ format: "uuid" }) }) },
  );
