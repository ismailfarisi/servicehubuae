import { jwtAuth } from "@servicehubuae/guards";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";

export const feedRoutes = new Elysia({ prefix: "/reels/feed" })
  .use(container)
  .use(jwtAuth)
  .get(
    "/",
    async ({ query, user, feedService }: any) => {
      const limit = Math.min(Number(query.limit ?? 20), 50);
      const userId = user?.id ?? null;
      const language = query.language ?? user?.preferredLanguage ?? "en";
      const country = query.country ?? "AE";

      const respond = async (result: { reels: any[]; nextCursor: string | null }) => {
        return {
          statusCode: 200,
          ...result,
          timestamp: new Date().toISOString(),
        };
      };

      if (query.context === "home") {
        return respond(
          await feedService.getHomeFeed({
            tab: (query.tab ?? "for_you") as any,
            language,
            country,
            userId,
            cursor: query.cursor,
            limit,
          }),
        );
      }
      if (query.context === "vendor") {
        return respond(
          await feedService.getVendorFeed(query.vendorId, {
            userId,
            cursor: query.cursor,
            limit,
          }),
        );
      }
      if (query.context === "user") {
        return respond(
          await feedService.getUserFeed(query.userId, {
            cursor: query.cursor,
            limit,
          }),
        );
      }
      return {
        statusCode: 400,
        error: "unknown_context",
        timestamp: new Date().toISOString(),
      };
    },
    {
      query: t.Object({
        context: t.Union([t.Literal("home"), t.Literal("vendor"), t.Literal("user")]),
        tab: t.Optional(
          t.Union([t.Literal("for_you"), t.Literal("latest"), t.Literal("following")]),
        ),
        vendorId: t.Optional(t.String({ format: "uuid" })),
        userId: t.Optional(t.String({ format: "uuid" })),
        language: t.Optional(t.String()),
        country: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
    },
  );
