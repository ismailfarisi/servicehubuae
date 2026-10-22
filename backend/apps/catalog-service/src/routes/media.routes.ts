import { jwtAuth } from "@servicehubuae/guards";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";

// Generic asset uploads. Responses are returned bare (no envelope) — the
// dashboards' s3-upload-client reads `data.uploadUrl` / `data.url` straight
// off the response body, same as before the fork.
export const mediaRoutes = new Elysia({ prefix: "/media" })
  .use(container)
  .use(jwtAuth)

  // POST /media/presign — signed S3 PUT for any registered asset type
  .post(
    "/presign",
    ({ body, user, mediaController }) =>
      // biome-ignore lint/style/noNonNullAssertion: jwtAuth guarantees user is populated
      mediaController.generatePresignedUrl(user!.role, body, user!),
    {
      body: t.Object({
        asset_type: t.String({ minLength: 1 }),
        filename: t.String({ minLength: 1 }),
        content_type: t.String({ minLength: 1 }),
        vendor_id: t.Optional(t.String()),
      }),
    },
  )

  // POST /media/process-asset — resize/convert an uploaded asset
  .post(
    "/process-asset",
    ({ body, user, mediaController }) =>
      // biome-ignore lint/style/noNonNullAssertion: jwtAuth guarantees user is populated
      mediaController.processAsset(user!.role, body),
    {
      body: t.Object({
        asset_type: t.String({ minLength: 1 }),
        key: t.String({ minLength: 1 }),
      }),
    },
  )

  // GET /media/kyc/:key/signed-url — admin only
  .get(
    "/kyc/:key/signed-url",
    ({ params, user, mediaController }) => {
      const decodedKey = decodeURIComponent(params.key);
      // biome-ignore lint/style/noNonNullAssertion: jwtAuth guarantees user is populated
      return mediaController.getKycSignedUrl(user!.role, decodedKey);
    },
    { params: t.Object({ key: t.String({ minLength: 1 }) }) },
  );
