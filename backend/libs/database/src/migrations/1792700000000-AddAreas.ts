import type { MigrationInterface, QueryRunner } from "typeorm";

// `areas`: the UAE localities customers search by (replaces the old
// delivery_zones table, minus its unused `boundary` column). Matches
// entities/area.entity.ts exactly.
//
// No foreign keys from service_areas.area_id / vendor_locations.area_id yet:
// both columns predate this table and booking-service's live-DB integration
// tests insert arbitrary area UUIDs into them. Add the FKs once those fixtures
// create real `areas` rows.
export class AddAreas1792700000000 implements MigrationInterface {
  name = "AddAreas1792700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "emirate" character varying(50) NOT NULL, "country_code" character(2) NOT NULL DEFAULT 'AE', "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5110493f6342f34c978c084d0d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_areas_slug" ON "areas" ("slug") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_areas_slug"`);
    await queryRunner.query(`DROP TABLE "areas"`);
  }
}
