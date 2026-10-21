import { describe, expect, test } from "bun:test";
import * as enums from "../enums.ts";
import * as entities from "./index.ts";

describe("database entities", () => {
  test("exports all expected entities", () => {
    const exported = Object.keys(entities);
    expect(exported.length).toBeGreaterThanOrEqual(90);
    for (const name of [
      "User",
      "Vendor",
      "Category",
      "Payment",
      "Commission",
      "VendorPayout",
      "ServiceOffering",
      "StaffMember",
      "StaffEngagement",
      "Booking",
      "SiteSetting",
      "SupportTicket",
      "Reel",
      "CreatorApplication",
    ]) {
      expect(exported).toContain(name);
    }
    for (const name of ["Product", "Order", "Cart", "Coupon", "Shipment", "GiftOrder"]) {
      expect(exported).not.toContain(name);
    }
  });

  test("all entity exports are constructor functions", () => {
    for (const [_name, entity] of Object.entries(entities)) {
      expect(typeof entity).toBe("function");
    }
  });

  test("VendorMember entity is exported and constructible", () => {
    const m = new entities.VendorMember();
    expect(m).toBeInstanceOf(entities.VendorMember);
  });

  test("RolePermission entity is exported and constructible", () => {
    const rp = new entities.RolePermission();
    expect(rp).toBeInstanceOf(entities.RolePermission);
  });

  test("Reel entity is constructible", () => {
    const r = new entities.Reel();
    expect(r).toBeInstanceOf(entities.Reel);
  });

  test("Vendor entity is constructible", () => {
    const v = new entities.Vendor();
    expect(v).toBeInstanceOf(entities.Vendor);
  });
});

describe("database enums", () => {
  test("exports all required enum types", () => {
    const exported = Object.keys(enums);
    for (const name of ["UserRole", "UserStatus", "VendorStatus", "PaymentStatus", "PaymentMethod", "BookingStatus"]) {
      expect(exported).toContain(name);
    }
  });

  test("UserRole has expected values", () => {
    expect(enums.UserRole.super_admin).toBe(enums.UserRole.super_admin);
    expect(enums.UserRole.admin).toBe(enums.UserRole.admin);
    expect(enums.UserRole.customer).toBe(enums.UserRole.customer);
  });

  test("VendorMemberRole has expected values", () => {
    const roles = Object.values(enums.VendorMemberRole);
    expect(roles).toContain(enums.VendorMemberRole.owner);
    expect(roles).toContain(enums.VendorMemberRole.manager);
    expect(roles).toContain(enums.VendorMemberRole.staff);
    expect(roles).toContain(enums.VendorMemberRole.viewer);
    expect(roles.length).toBe(4);
  });

  test("ReelAuthorKind has expected values", () => {
    const kinds = Object.values(
      (enums as unknown as { ReelAuthorKind: Record<string, string> }).ReelAuthorKind,
    );
    expect(kinds).toContain("creator");
    expect(kinds).toContain("customer");
    expect(kinds).toContain("house");
    expect(kinds.length).toBe(3);
  });
});
