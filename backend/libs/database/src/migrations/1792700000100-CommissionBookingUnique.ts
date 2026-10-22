import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * A booking accrues at most ONE commission row.
 *
 * Booking completion is deliberately re-firable (a retry after a failed money
 * step, or an admin "mark completed" racing the auto-complete job), so two
 * accruals for the same booking can run concurrently. Under READ COMMITTED a
 * find-then-insert check lets both through; this partial unique index makes
 * the database reject the second row, and the booking payment gateway's
 * `INSERT ... ON CONFLICT ("booking_id") WHERE "booking_id" IS NOT NULL DO
 * NOTHING` relies on it as the conflict target.
 *
 * Declared on the Commission entity with the same name and predicate so the
 * entity metadata and the schema agree.
 */
export class CommissionBookingUnique1792700000100 implements MigrationInterface {
  name = "CommissionBookingUnique1792700000100";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uq_commissions_booking" ON "commissions" ("booking_id") WHERE "booking_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_commissions_booking"`);
  }
}
