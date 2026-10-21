---
name: project_elysia_strips_unknown_body_props
description: Elysia strips request-body fields not listed in the route t.Object DTO before they reach the controller/service
metadata: 
  node_type: memory
  type: project
  originSessionId: 9f1bc011-708f-4c84-9377-5843149dbaca
---

An Elysia route's `body: t.Object({...})` schema doesn't just validate — it also **removes** any body property not declared in the schema, so the field never reaches the controller/handler.

**Why:** bit the attribute color-hex feature — `color_hex` existed on the entity, the migration, and `AttributeService.addValue/updateValue`, and the admin UIs sent it, yet swatches stayed blank. Root cause: the `/admin/attributes/:id/values` POST/PATCH DTOs (`attribute-admin.routes.ts`) omitted `color_hex`, so Elysia dropped it before the service saw it.

**How to apply:** when a new field must flow through a write endpoint, adding it to the entity + service + frontend is NOT enough — add it to the route's `body` `t.Object` too. To allow clearing, use `t.Optional(t.Union([t.String(), t.Null()]))` (t.Optional alone rejects null — see [[project_elysia_optional_rejects_null]]).
