---
name: project_errorhandler_httperror_only
description: Global errorHandler only honors HttpError instances; plain Error with .statusCode collapses to 500
metadata: 
  node_type: memory
  type: project
  originSessionId: e6284df2-8085-41ce-bc8a-d696075551fb
---

The shared `errorHandler` in `backend/libs/plugins/src/index.ts` maps status codes by `error instanceof HttpError` only. A plain `new Error(msg)` with an attached `.statusCode = 503/429` property is **ignored** — it falls through to the generic branch and returns **500 "Internal server error"** (and any attached `.details` is dropped). This silently mislabeled the AI-enhance disabled/quota/no-key rejections as 500.

**Why:** the handler reads `error.statusCode`/`error.code`/`error.details` only off the `HttpError` class, never off arbitrary Errors.

**How to apply:** throw an `HttpError` subclass from `@mypickuae/plugins` — `BadRequestError`(400), `NotFoundError`(404), `ForbiddenError`(403), `TooManyRequestsError`(429, takes optional `details`), `ServiceUnavailableError`(503). Never `const e = new Error(); e.statusCode = X`. `HttpError` carries optional `details` surfaced in the response (added v0.1.25, #231). Related: [[project_public_route_three_places]].
