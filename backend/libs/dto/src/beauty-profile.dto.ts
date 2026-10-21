import { type Static, Type } from "@sinclair/typebox";

export const UpdateBeautyProfileBody = Type.Object({
  skin_type: Type.Optional(
    Type.Union([
      Type.Literal("oily"),
      Type.Literal("dry"),
      Type.Literal("combination"),
      Type.Literal("normal"),
      Type.Literal("sensitive"),
      Type.Null(),
    ]),
  ),
  skin_concerns: Type.Optional(
    Type.Union([
      Type.Array(
        Type.Union([
          Type.Literal("acne"),
          Type.Literal("aging"),
          Type.Literal("dark_spots"),
          Type.Literal("dryness"),
          Type.Literal("redness"),
          Type.Literal("dullness"),
          Type.Literal("pores"),
          Type.Literal("sensitivity"),
        ]),
      ),
      Type.Null(),
    ]),
  ),
  skin_tone_depth: Type.Optional(
    Type.Union([
      Type.Literal("fair"),
      Type.Literal("light"),
      Type.Literal("medium"),
      Type.Literal("tan"),
      Type.Literal("deep"),
      Type.Null(),
    ]),
  ),
  undertone: Type.Optional(
    Type.Union([Type.Literal("warm"), Type.Literal("cool"), Type.Literal("neutral"), Type.Null()]),
  ),
  hair_type: Type.Optional(
    Type.Union([
      Type.Literal("straight"),
      Type.Literal("wavy"),
      Type.Literal("curly"),
      Type.Literal("coily"),
      Type.Null(),
    ]),
  ),
  fragrance_families: Type.Optional(
    Type.Union([
      Type.Array(
        Type.Union([
          Type.Literal("floral"),
          Type.Literal("fresh"),
          Type.Literal("woody"),
          Type.Literal("oriental"),
          Type.Literal("fruity"),
          Type.Literal("gourmand"),
        ]),
      ),
      Type.Null(),
    ]),
  ),
  completed: Type.Optional(Type.Boolean()),
});
export type UpdateBeautyProfileBody = Static<typeof UpdateBeautyProfileBody>;
