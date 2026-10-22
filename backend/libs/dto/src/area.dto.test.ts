import { describe, expect, test } from "bun:test";
import { Value } from "@sinclair/typebox/value";
import { CreateAreaBody, UpdateAreaBody } from "./area.dto.ts";
import { CreateCategoryBody, UpdateCategoryBody } from "./category.dto.ts";

describe("CreateAreaBody", () => {
  test("accepts a minimal area", () => {
    expect(
      Value.Check(CreateAreaBody, { name: "Dubai Marina", city: "Dubai", emirate: "Dubai" }),
    ).toBe(true);
  });

  test("rejects an unknown emirate and a malformed slug", () => {
    expect(Value.Check(CreateAreaBody, { name: "X", city: "X", emirate: "Muscat" })).toBe(false);
    expect(
      Value.Check(CreateAreaBody, { name: "X", city: "Dubai", emirate: "Dubai", slug: "Bad Slug" }),
    ).toBe(false);
  });

  test("UpdateAreaBody is fully partial", () => {
    expect(Value.Check(UpdateAreaBody, {})).toBe(true);
    expect(Value.Check(UpdateAreaBody, { is_active: false })).toBe(true);
  });
});

describe("CreateCategoryBody", () => {
  test("accepts explicit nulls on nullable fields", () => {
    expect(Value.Check(CreateCategoryBody, { name: "Home Cleaning", image_url: null })).toBe(true);
  });

  test("rejects commission above 100", () => {
    expect(Value.Check(UpdateCategoryBody, { commission_rate: 101 })).toBe(false);
  });
});
