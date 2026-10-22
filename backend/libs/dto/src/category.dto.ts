import { type Static, Type } from "@sinclair/typebox";

// Nullable fields use Type.Optional(Type.Union([X, Type.Null()])) because
// Type.Optional alone rejects an explicit null (which the admin editor sends to
// clear a field).
const NullableString = Type.Optional(Type.Union([Type.String(), Type.Null()]));

export const CategoryTranslationInput = Type.Object({
  locale: Type.String({ minLength: 2, maxLength: 10 }),
  name: Type.String(),
  description: NullableString,
});
export type CategoryTranslationInput = Static<typeof CategoryTranslationInput>;

export const CreateCategoryBody = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 200 }),
  parent_id: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
  description: NullableString,
  icon_url: NullableString,
  image_url: NullableString,
  banner_url: NullableString,
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  commission_rate: Type.Optional(
    Type.Union([Type.Number({ minimum: 0, maximum: 100 }), Type.Null()]),
  ),
  meta_title: NullableString,
  meta_description: NullableString,
  meta_keywords: NullableString,
  translations: Type.Optional(Type.Array(CategoryTranslationInput)),
});
export type CreateCategoryBody = Static<typeof CreateCategoryBody>;

export const UpdateCategoryBody = Type.Partial(CreateCategoryBody);
export type UpdateCategoryBody = Static<typeof UpdateCategoryBody>;

export const ReorderCategoriesBody = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      sort_order: Type.Number({ minimum: 0 }),
    }),
    { minItems: 1 },
  ),
});
export type ReorderCategoriesBody = Static<typeof ReorderCategoriesBody>;
