import type { AuthUser } from "@servicehubuae/guards";
import { BadRequestError, ForbiddenError } from "@servicehubuae/plugins";
import { ASSET_TYPE_CONFIG, type MediaService, isAssetType } from "@servicehubuae/utils";
import type { IVendorLookup } from "./vendor-lookup.service.ts";

type MediaPort = Pick<
  MediaService,
  "generatePresignedUrlForAsset" | "processAssetImage" | "getKycSignedUrl"
>;

const UPLOAD_ROLES = ["vendor", "customer", "admin", "super_admin"];
const ADMIN_ROLES = ["admin", "super_admin"];

/**
 * Generic asset uploads (logos, banners, category art, KYC documents, avatars,
 * service media). The upload itself goes browser -> S3 via a presigned PUT;
 * this controller only signs the request and post-processes the stored key.
 */
export class MediaController {
  constructor(
    private readonly mediaService: MediaPort,
    private readonly vendorLookup: IVendorLookup,
  ) {}

  async generatePresignedUrl(
    userRole: string,
    body: {
      asset_type: string;
      filename: string;
      content_type: string;
      vendor_id?: string;
    },
    user: AuthUser,
  ) {
    if (!UPLOAD_ROLES.includes(userRole)) {
      throw new ForbiddenError("Insufficient permissions to upload media");
    }

    if (!isAssetType(body.asset_type)) {
      throw new BadRequestError(`Unknown asset type: ${body.asset_type}`);
    }

    const assetType = body.asset_type;
    const cfg = ASSET_TYPE_CONFIG[assetType];
    let vendorId: string | undefined;

    if (cfg.requiresVendorId) {
      if (!ADMIN_ROLES.includes(userRole)) {
        // Derive the vendor id from the authenticated user — never trust body.vendor_id
        const derived = await this.vendorLookup.findVendorIdByUserId(user.id);
        if (!derived) {
          throw new ForbiddenError("No vendor record for this user");
        }
        if (body.vendor_id && body.vendor_id !== derived) {
          throw new ForbiddenError("Cannot upload on behalf of another vendor");
        }
        vendorId = derived;
      } else {
        // admin / super_admin must supply vendor_id explicitly
        if (!body.vendor_id) {
          throw new BadRequestError("vendor_id is required for vendor-scoped asset types");
        }
        vendorId = body.vendor_id;
      }
    }

    return this.mediaService.generatePresignedUrlForAsset({
      assetType,
      filename: body.filename,
      contentType: body.content_type,
      vendorId,
      // User-scoped assets always go under the caller's own prefix.
      ...(cfg.requiresUserId ? { userId: user.id } : {}),
    });
  }

  async processAsset(
    userRole: string,
    body: { asset_type: string; key: string },
  ): Promise<{ url: string }> {
    if (!UPLOAD_ROLES.includes(userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    if (!isAssetType(body.asset_type)) {
      throw new BadRequestError(`Unknown asset_type: ${body.asset_type}`);
    }

    return this.mediaService.processAssetImage({
      assetType: body.asset_type,
      key: body.key,
    });
  }

  async getKycSignedUrl(userRole: string, key: string): Promise<{ url: string; expiresAt: Date }> {
    if (!ADMIN_ROLES.includes(userRole)) {
      throw new ForbiddenError("Only admins can view KYC documents");
    }

    return this.mediaService.getKycSignedUrl(key);
  }
}
