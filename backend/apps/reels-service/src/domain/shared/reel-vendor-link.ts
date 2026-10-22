/**
 * How a reel belongs to a vendor now that products (and reel product tags)
 * are gone. Reels have no `vendor_id` column; a reel is linked to a vendor
 * when any of these hold:
 *
 *  1. the vendor holds an unrevoked licence grant on it;
 *  2. it was delivered for one of the vendor's collab opportunities
 *     (application delivered or completed);
 *  3. it was uploaded by an active member of the vendor's team.
 *
 * M1/M5 may add a direct reel <-> service link; extend this predicate then.
 *
 * `reelAlias` is the SQL alias of the `reels` row; `vendorParam` is the
 * placeholder for the vendor id in the caller's dialect (`$1` for raw
 * queries, `:vendorId` for TypeORM query builders). It is repeated, which
 * both styles allow.
 */
export function reelLinkedToVendorSql(reelAlias: string, vendorParam: string): string {
  return `(
    EXISTS (
      SELECT 1 FROM reel_license_grants rvl_g
       WHERE rvl_g.reel_id = ${reelAlias}.id
         AND rvl_g.vendor_id = ${vendorParam}
         AND rvl_g.revoked_at IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM collab_applications rvl_ca
        JOIN collab_opportunities rvl_co ON rvl_co.id = rvl_ca.opportunity_id
       WHERE rvl_ca.delivered_reel_id = ${reelAlias}.id
         AND rvl_co.vendor_id = ${vendorParam}
         AND rvl_ca.status IN ('delivered', 'completed')
    )
    OR EXISTS (
      SELECT 1 FROM vendor_members rvl_vm
       WHERE rvl_vm.user_id = ${reelAlias}.user_id
         AND rvl_vm.vendor_id = ${vendorParam}
         AND rvl_vm.status = 'active'
         AND rvl_vm.deleted_at IS NULL
    )
  )`;
}
