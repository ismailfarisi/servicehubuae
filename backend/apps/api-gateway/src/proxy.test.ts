import { describe, expect, test } from "bun:test";
import { resolveUpstream } from "./proxy.ts";

function targetOf(path: string): string | undefined {
  return resolveUpstream(path)?.target;
}

describe("resolveUpstream", () => {
  test("resolves /auth and /auth/login to auth service", () => {
    const result = resolveUpstream("/auth/login");
    expect(result).not.toBeNull();
    expect(result!.target).toContain("3001");
    expect(result!.upstreamPath).toBe("/auth/login");
    expect(targetOf("/auth")).toContain("3001");
    expect(targetOf("/admin/users/abc")).toContain("3001");
  });

  test("resolves catalog prefixes to catalog service (3002)", () => {
    for (const path of [
      "/categories/tree",
      "/categories/hair",
      "/admin/categories",
      "/services",
      "/services/suggest",
      "/services/by-id/abc-123",
      "/services/glow-facial",
      "/admin/service-offerings/abc/approve",
      "/vendor/services",
      "/vendor/services/abc",
      "/areas",
      "/admin/areas/abc",
      "/media/presign",
      "/me/recent-searches",
      "/admin/search/services/reindex",
    ]) {
      const result = resolveUpstream(path);
      expect(result).not.toBeNull();
      expect(result!.target).toContain("3002");
      expect(result!.upstreamPath).toBe(path);
    }
  });

  test("resolves /services/:slug/availability to booking service", () => {
    const result = resolveUpstream("/services/glow-facial/availability");
    expect(result).not.toBeNull();
    expect(result!.target).toContain("3009");
    expect(result!.upstreamPath).toBe("/services/glow-facial/availability");
  });

  test("resolves booking prefixes to booking service (3009)", () => {
    for (const path of [
      "/booking/eligible",
      "/bookings/hold",
      "/bookings/abc",
      "/me/bookings",
      "/admin/bookings/dashboard",
      "/vendor/booking/dashboard",
      "/manage/blocks",
      "/calendar/staff/abc/feed.ics",
    ]) {
      expect(targetOf(path)).toContain("3009");
    }
  });

  test("resolves vendor prefixes to vendor service (3004)", () => {
    for (const path of [
      "/vendors",
      "/vendors/abc-123/members",
      "/admin/vendors",
      "/vendor/reels-program/opt-in",
      "/vendor-members/invites/accept",
      "/admin/role-permissions",
      "/me/follows/vendors/recent",
      "/webhooks/stripe/connect",
    ]) {
      expect(targetOf(path)).toContain("3004");
    }
  });

  test("resolves notification, cms, reels and integration prefixes", () => {
    expect(targetOf("/notifications")).toContain("3005");
    expect(targetOf("/webhooks/whatsapp")).toContain("3005");
    expect(targetOf("/layouts/home")).toContain("3006");
    expect(targetOf("/support/tickets")).toContain("3006");
    expect(targetOf("/reels/feed")).toContain("3007");
    expect(targetOf("/admin/reels/analytics")).toContain("3007");
    expect(targetOf("/vendor/reels/analytics")).toContain("3007");
    expect(targetOf("/users/abc/follow")).toContain("3007");
    expect(targetOf("/vendor/integrations")).toContain("3008");
    expect(targetOf("/integrations/inbound/abc")).toContain("3008");
  });

  test("returns null for removed product/order-era routes", () => {
    for (const path of [
      "/products",
      "/products/123",
      "/orders",
      "/cart",
      "/checkout/initiate",
      "/brands",
      "/collections",
      "/gift/boxes",
      "/wishlist",
      "/reviews",
      "/shipping/delivery-zones",
      "/webhooks/tamara",
      "/webhooks/stripe",
      "/admin/orders",
      "/admin/payouts",
      "/admin/coupons",
      "/admin/flash-deals",
      "/admin/sales-channels",
      "/vendor/dashboard",
      "/vendors/me/payouts",
      "/search/trending",
      "/bulk/jobs",
      "/admin/affiliates",
      "/me/affiliate",
      "/a/AFF-ABC12345",
      "/ref/CODE",
      "/me/referrals",
    ]) {
      // /vendors/me/payouts now falls through to vendor-service (/vendors).
      if (path.startsWith("/vendors")) {
        expect(targetOf(path)).toContain("3004");
        continue;
      }
      expect(resolveUpstream(path)).toBeNull();
    }
  });

  test("returns null for unknown paths", () => {
    expect(resolveUpstream("/unknown")).toBeNull();
    expect(resolveUpstream("/")).toBeNull();
    expect(resolveUpstream("/api/something")).toBeNull();
  });

  test("does not match partial prefix (e.g. /authorize, /servicesextra)", () => {
    expect(resolveUpstream("/authorize")).toBeNull();
    expect(resolveUpstream("/servicesextra")).toBeNull();
  });

  test("preserves full path as upstreamPath", () => {
    const result = resolveUpstream("/vendors/abc-123/bank-accounts");
    expect(result).not.toBeNull();
    expect(result!.upstreamPath).toBe("/vendors/abc-123/bank-accounts");
  });
});
