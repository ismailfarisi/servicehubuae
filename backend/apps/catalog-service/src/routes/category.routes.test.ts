import { describe, expect, it } from "bun:test";
import { limitTreeDepth } from "./category.routes.ts";

const tree = [
  {
    id: "beauty",
    children: [{ id: "hair", children: [{ id: "colour", children: [] }] }],
  },
  { id: "cleaning", children: [] },
];

describe("limitTreeDepth", () => {
  it("returns the tree untouched without a depth", () => {
    expect(limitTreeDepth(tree)).toBe(tree);
  });

  it("depth=1 keeps roots only, depth=2 keeps one child level", () => {
    expect(limitTreeDepth(tree, 1).map((n) => n.children)).toEqual([[], []]);
    const two = limitTreeDepth(tree, 2);
    expect(two[0]?.children?.[0]?.children).toEqual([]);
  });

  it("does not mutate the (cached) input tree", () => {
    limitTreeDepth(tree, 1);
    expect(tree[0]?.children).toHaveLength(1);
  });
});
