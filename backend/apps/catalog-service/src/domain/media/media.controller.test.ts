import { beforeEach, describe, expect, test } from "bun:test";
import type { AuthUser } from "@servicehubuae/guards";
import { MediaController } from "./media.controller.ts";

class FakeMedia {
  calls: unknown[] = [];
  processCalls: unknown[] = [];
  async generatePresignedUrlForAsset(input: unknown) {
    this.calls.push(input);
    return { uploadUrl: "u", key: "k", publicUrl: "p", expiresAt: new Date() };
  }
  async processAssetImage(input: unknown) {
    this.processCalls.push(input);
    return { url: "https://cdn.example/asset.webp" };
  }
  async getKycSignedUrl() {
    return { url: "u", expiresAt: new Date() };
  }
}

class FakeVendorLookup {
  // Maps user.id -> vendor.id (or null)
  map: Record<string, string | null> = {
    "user-self": "v-42",
    "user-no-vendor": null,
  };
  async findVendorIdByUserId(userId: string) {
    return this.map[userId] ?? null;
  }
}

function makeController(media = new FakeMedia(), lookup = new FakeVendorLookup()) {
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast to real service type
  return new MediaController(media as any, lookup);
}

describe("MediaController.getKycSignedUrl", () => {
  test("rejects non-admin roles", async () => {
    const ctl = makeController();
    await expect(ctl.getKycSignedUrl("vendor", "private/kyc/v/x.pdf")).rejects.toThrow(/admin/i);
    await expect(ctl.getKycSignedUrl("customer", "private/kyc/v/x.pdf")).rejects.toThrow(/admin/i);
  });

  test("allows admin and super_admin", async () => {
    const ctl = makeController();
    await expect(ctl.getKycSignedUrl("admin", "private/kyc/v/x.pdf")).resolves.toBeDefined();
    await expect(ctl.getKycSignedUrl("super_admin", "private/kyc/v/x.pdf")).resolves.toBeDefined();
  });
});

describe("MediaController.generatePresignedUrl", () => {
  let media: FakeMedia;
  let ctl: MediaController;

  beforeEach(() => {
    media = new FakeMedia();
    ctl = makeController(media);
  });

  const guestUser: AuthUser = { id: "u", email: "e", role: "guest" };
  const adminUser: AuthUser = { id: "admin-1", email: "a", role: "admin" };
  // Vendor owners carry role="customer" + vm JWT claim
  const vendorUser: AuthUser = { id: "user-self", email: "v", role: "customer" };
  const noVendorUser: AuthUser = { id: "user-no-vendor", email: "n", role: "customer" };

  test("rejects unauthenticated callers", async () => {
    await expect(
      ctl.generatePresignedUrl(
        "guest",
        { asset_type: "category_image", filename: "x.png", content_type: "image/png" },
        guestUser,
      ),
    ).rejects.toThrow(/permission|forbidden/i);
  });

  test("rejects unknown asset types", async () => {
    await expect(
      ctl.generatePresignedUrl(
        "admin",
        { asset_type: "nope", filename: "x.png", content_type: "image/png" },
        adminUser,
      ),
    ).rejects.toThrow(/Unknown asset type/);
  });

  test("forwards filename + content type for non-vendor-scoped assets", async () => {
    await ctl.generatePresignedUrl(
      "admin",
      { asset_type: "category_image", filename: "cat.png", content_type: "image/png" },
      adminUser,
    );
    expect(media.calls[0]).toMatchObject({
      assetType: "category_image",
      filename: "cat.png",
      contentType: "image/png",
    });
  });

  test("derives vendorId from the DB lookup for vendor self-upload of vendor_logo", async () => {
    await ctl.generatePresignedUrl(
      "customer",
      { asset_type: "vendor_logo", filename: "logo.png", content_type: "image/png" },
      vendorUser,
    );
    expect((media.calls[0] as Record<string, unknown>).vendorId).toBe("v-42");
  });

  test("rejects a vendor-scoped upload from a user with no vendor membership", async () => {
    await expect(
      ctl.generatePresignedUrl(
        "customer",
        { asset_type: "vendor_logo", filename: "logo.png", content_type: "image/png" },
        noVendorUser,
      ),
    ).rejects.toThrow(/No vendor record/);
  });

  test("rejects vendor uploading another vendor's KYC", async () => {
    await expect(
      ctl.generatePresignedUrl(
        "customer",
        {
          asset_type: "kyc_document",
          filename: "x.pdf",
          content_type: "application/pdf",
          vendor_id: "v-other",
        },
        vendorUser,
      ),
    ).rejects.toThrow(/another vendor|forbidden/i);
  });

  test("admin must supply vendor_id when uploading vendor_logo", async () => {
    await expect(
      ctl.generatePresignedUrl(
        "admin",
        { asset_type: "vendor_logo", filename: "logo.png", content_type: "image/png" },
        adminUser,
      ),
    ).rejects.toThrow(/vendor_id/i);
  });

  test("admin uses body.vendor_id for vendor-scoped uploads", async () => {
    await ctl.generatePresignedUrl(
      "admin",
      {
        asset_type: "vendor_banner",
        filename: "b.png",
        content_type: "image/png",
        vendor_id: "v-99",
      },
      adminUser,
    );
    expect((media.calls[0] as Record<string, unknown>).vendorId).toBe("v-99");
  });

  test("vendor applicants without a vendor row can upload licence documents under their own user id", async () => {
    await ctl.generatePresignedUrl(
      "customer",
      {
        asset_type: "kyc_application_document",
        filename: "licence.pdf",
        content_type: "application/pdf",
        vendor_id: "v-99",
      },
      noVendorUser,
    );
    const call = media.calls[0] as Record<string, unknown>;
    expect(call.userId).toBe("user-no-vendor");
    expect(call.vendorId).toBeUndefined();
  });
});

describe("MediaController.processAsset", () => {
  test("rejects guests and unknown asset types, forwards valid requests", async () => {
    const media = new FakeMedia();
    const ctl = makeController(media);
    await expect(
      ctl.processAsset("guest", { asset_type: "vendor_logo", key: "k" }),
    ).rejects.toThrow(/permission/i);
    await expect(ctl.processAsset("admin", { asset_type: "nope", key: "k" })).rejects.toThrow(
      /Unknown asset_type/,
    );
    const res = await ctl.processAsset("admin", { asset_type: "category_icon", key: "raw/x.png" });
    expect(res.url).toContain("asset.webp");
    expect(media.processCalls[0]).toEqual({ assetType: "category_icon", key: "raw/x.png" });
  });
});
