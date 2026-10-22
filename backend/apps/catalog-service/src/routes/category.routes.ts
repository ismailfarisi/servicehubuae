import { Elysia, t } from "elysia";
import { container } from "../container.ts";

interface TreeNode {
  children?: TreeNode[];
}

/**
 * Trim a category tree to `depth` levels (1 = roots only). The cached tree is
 * shared across callers, so this copies nodes instead of mutating them.
 */
export function limitTreeDepth<T extends TreeNode>(nodes: T[], depth?: number): T[] {
  if (!depth || depth < 1) return nodes;
  return nodes.map((node) => ({
    ...node,
    children: depth > 1 ? limitTreeDepth((node.children ?? []) as T[], depth - 1) : [],
  }));
}

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .use(container)

  .get(
    "/tree",
    async ({ query, categoryController }) => {
      const tree = await categoryController.getTree({ vendorId: query.vendor_id });
      const data = limitTreeDepth(tree, query.depth);
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        vendor_id: t.Optional(t.String({ format: "uuid" })),
        depth: t.Optional(t.Numeric({ minimum: 1, maximum: 4 })),
      }),
    },
  )

  .get(
    "/:slug",
    async ({ params, categoryController }) => {
      const data = await categoryController.getBySlug(params.slug);
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    { params: t.Object({ slug: t.String() }) },
  );
