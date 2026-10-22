import type { DataSource } from "typeorm";

/**
 * Default vendor-team permission matrix (owner / manager / staff / viewer).
 * vendorMembership() denies everything a role is not granted here, so without
 * these rows not even a vendor owner can reach the vendor dashboard APIs.
 * Keys must stay within PERMISSIONS in libs/guards/src/permissions.ts.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: [
    "products.read",
    "products.write",
    "products.publish",
    "orders.read",
    "orders.fulfill",
    "orders.refund",
    "inventory.write",
    "vendor.profile.write",
    "payouts.read",
    "bank.read",
    "bank.write",
    "analytics.read",
    "team.read",
    "team.write",
  ],
  manager: [
    "products.read",
    "products.write",
    "products.publish",
    "orders.read",
    "orders.fulfill",
    "orders.refund",
    "inventory.write",
    "vendor.profile.write",
    "payouts.read",
    "bank.read",
    "analytics.read",
    "team.read",
  ],
  staff: ["products.read", "orders.read", "orders.fulfill", "inventory.write", "team.read"],
  viewer: ["products.read", "orders.read", "payouts.read", "analytics.read", "team.read"],
};

/**
 * Seeds the matrix only when the table is empty: once a super_admin has edited
 * it (PUT /admin/role-permissions/:role), a re-seed must not re-grant what they
 * removed. Returns the number of rows inserted.
 */
export async function seedRolePermissions(ds: DataSource): Promise<number> {
  const rows = (await ds.query(`SELECT COUNT(*)::int AS count FROM "role_permissions"`)) as Array<{
    count: number;
  }>;
  if ((rows[0]?.count ?? 0) > 0) return 0;

  let inserted = 0;
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permission of perms) {
      await ds.query(
        `INSERT INTO "role_permissions" ("role", "permission") VALUES ($1, $2)
         ON CONFLICT ("role", "permission") DO NOTHING`,
        [role, permission],
      );
      inserted += 1;
    }
  }
  return inserted;
}
