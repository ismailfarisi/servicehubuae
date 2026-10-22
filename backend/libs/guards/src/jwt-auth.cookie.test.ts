import { describe, expect, test } from "bun:test";
import { extractAccessToken } from "./jwt-auth.ts";

const cookies = {
  vendor_access_token: { value: "vendor-token" },
  admin_access_token: { value: "admin-token" },
};

describe("extractAccessToken", () => {
  test("prefers the bearer token", () => {
    expect(extractAccessToken("bearer-token", cookies, "admin")).toBe("bearer-token");
  });

  test("uses the cookie of the app named in X-Client-App", () => {
    expect(extractAccessToken(undefined, cookies, "admin")).toBe("admin-token");
    expect(extractAccessToken(undefined, cookies, "vendor")).toBe("vendor-token");
  });

  test("ignores another app's cookie when the request names its app", () => {
    expect(
      extractAccessToken(undefined, { vendor_access_token: { value: "vendor-token" } }, "admin"),
    ).toBeUndefined();
  });

  test("still accepts the legacy unprefixed cookie", () => {
    expect(extractAccessToken(undefined, { access_token: { value: "legacy" } }, "admin")).toBe(
      "legacy",
    );
  });

  test("falls back to any app cookie when no app is named", () => {
    expect(extractAccessToken(undefined, { vendor_access_token: { value: "v" } }, null)).toBe("v");
  });
});
