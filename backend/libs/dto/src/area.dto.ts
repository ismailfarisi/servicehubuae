import { type Static, Type } from "@sinclair/typebox";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export const AreaEmirate = Type.Union(EMIRATES.map((e) => Type.Literal(e)));
export type AreaEmirate = Static<typeof AreaEmirate>;

const Slug = Type.String({ minLength: 1, maxLength: 255, pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" });

export const CreateAreaBody = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  // Derived from `name` when omitted.
  slug: Type.Optional(Slug),
  city: Type.String({ minLength: 1, maxLength: 100 }),
  emirate: AreaEmirate,
  country_code: Type.Optional(Type.String({ minLength: 2, maxLength: 2 })),
  is_active: Type.Optional(Type.Boolean()),
  sort_order: Type.Optional(Type.Integer({ minimum: 0 })),
});
export type CreateAreaBody = Static<typeof CreateAreaBody>;

export const UpdateAreaBody = Type.Partial(CreateAreaBody);
export type UpdateAreaBody = Static<typeof UpdateAreaBody>;
