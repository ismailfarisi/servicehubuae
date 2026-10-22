// booking-dashboard.service.ts
//
// Read-only KPI tiles for the vendor dashboard (GET /vendor/booking/dashboard)
// and the admin dashboard (GET /admin/bookings/dashboard). One SQL round trip
// each, over bookings, booking_status_history, commissions,
// service_offerings, service_reviews, vendors and users.
//
// Time windows are Asia/Dubai calendar days:
//   - "today"     = the current Dubai calendar day.
//   - "upcoming"  = from now to the end of the 7th Dubai day (today + 6).
//   - "30d"       = the current Dubai day plus the 29 before it.
// "Completed" / "cancelled" in a window means the booking TRANSITIONED to that
// status inside the window (booking_status_history; both are terminal states,
// so there is exactly one such row per booking). Money is fils.
import {
  BookingStatus,
  ServiceOfferingStatus,
  ServiceReviewStatus,
  UserRole,
  VendorStatus,
} from "@mypickuae/database";

export const DASHBOARD_TIME_ZONE = "Asia/Dubai";

/** `AppDataSource.query`, injected so tests can fake it. */
export type DashboardQuery = (sql: string, params?: unknown[]) => Promise<any[]>;

export interface VendorBookingDashboard {
  bookings_today: number;
  upcoming_7d: number;
  completed_30d: number;
  cancelled_30d: number;
  revenue_30d_fils: number;
  commission_30d_fils: number;
  published_services: number;
  pending_review_services: number;
  rating_avg: number | null;
  rating_count: number;
}

export interface AdminBookingDashboard {
  bookings_today: number;
  bookings_30d: number;
  completed_30d: number;
  gmv_30d_fils: number;
  commission_30d_fils: number;
  active_vendors: number;
  pending_service_approvals: number;
  customers_total: number;
}

// Statuses that count as a real appointment on the calendar (excludes the
// unpaid pending_payment, the abandoned expired, and cancelled).
const SCHEDULED_STATUSES = [
  BookingStatus.confirmed,
  BookingStatus.rescheduled,
  BookingStatus.completed,
  BookingStatus.no_show,
];
// Still ahead of the customer.
const UPCOMING_STATUSES = [BookingStatus.confirmed, BookingStatus.rescheduled];
// Placed bookings (anything that got past checkout).
const NOT_PLACED_STATUSES = [BookingStatus.pending_payment, BookingStatus.expired];

// Window bounds computed in SQL from the injected "now" ($1) so every tile in
// one response shares the same clock and the Dubai day boundary is exact.
const BOUNDS_CTE = `
  bounds AS (
    SELECT
      $1::timestamptz AS now_at,
      (date_trunc('day', $1::timestamptz AT TIME ZONE '${DASHBOARD_TIME_ZONE}') AT TIME ZONE '${DASHBOARD_TIME_ZONE}') AS today_start
  ),
  win AS (
    SELECT
      now_at,
      today_start,
      today_start + interval '1 day' AS today_end,
      today_start + interval '7 days' AS upcoming_end,
      today_start - interval '29 days' AS window_start
    FROM bounds
  )`;

function toInt(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export class BookingDashboardService {
  constructor(private readonly query: DashboardQuery) {}

  async vendorDashboard(vendorId: string, now: Date = new Date()): Promise<VendorBookingDashboard> {
    const rows = await this.query(
      `WITH ${BOUNDS_CTE}
       SELECT
         (SELECT COUNT(*) FROM bookings b
            WHERE b.vendor_id = $2 AND b.deleted_at IS NULL
              AND b.status::text = ANY($3::text[])
              AND b.starts_at >= win.today_start AND b.starts_at < win.today_end) AS bookings_today,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.vendor_id = $2 AND b.deleted_at IS NULL
              AND b.status::text = ANY($4::text[])
              AND b.starts_at >= win.now_at AND b.starts_at < win.upcoming_end) AS upcoming_7d,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.vendor_id = $2 AND b.deleted_at IS NULL AND b.status::text = $5
              AND EXISTS (SELECT 1 FROM booking_status_history h
                          WHERE h.booking_id = b.id AND h.to_status = $5
                            AND h.created_at >= win.window_start)) AS completed_30d,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.vendor_id = $2 AND b.deleted_at IS NULL AND b.status::text = $6
              AND EXISTS (SELECT 1 FROM booking_status_history h
                          WHERE h.booking_id = b.id AND h.to_status = $6
                            AND h.created_at >= win.window_start)) AS cancelled_30d,
         (SELECT COALESCE(SUM(b.price_fils), 0) FROM bookings b
            WHERE b.vendor_id = $2 AND b.deleted_at IS NULL AND b.status::text = $5
              AND EXISTS (SELECT 1 FROM booking_status_history h
                          WHERE h.booking_id = b.id AND h.to_status = $5
                            AND h.created_at >= win.window_start)) AS revenue_30d_fils,
         (SELECT COALESCE(SUM(c.commission_amount), 0) FROM commissions c
            WHERE c.vendor_id = $2 AND c.deleted_at IS NULL AND c.status::text <> 'cancelled'
              AND c.created_at >= win.window_start) AS commission_30d_fils,
         (SELECT COUNT(*) FROM service_offerings o
            WHERE o.vendor_id = $2 AND o.deleted_at IS NULL AND o.status::text = $7) AS published_services,
         (SELECT COUNT(*) FROM service_offerings o
            WHERE o.vendor_id = $2 AND o.deleted_at IS NULL AND o.status::text = $8) AS pending_review_services,
         (SELECT AVG(r.rating)::numeric FROM service_reviews r
            WHERE r.vendor_id = $2 AND r.deleted_at IS NULL AND r.status::text = $9) AS rating_avg,
         (SELECT COUNT(*) FROM service_reviews r
            WHERE r.vendor_id = $2 AND r.deleted_at IS NULL AND r.status::text = $9) AS rating_count
       FROM win`,
      [
        now,
        vendorId,
        SCHEDULED_STATUSES,
        UPCOMING_STATUSES,
        BookingStatus.completed,
        BookingStatus.cancelled,
        ServiceOfferingStatus.published,
        ServiceOfferingStatus.pending_review,
        ServiceReviewStatus.approved,
      ],
    );
    const row = rows[0] ?? {};
    const ratingCount = toInt(row.rating_count);
    const ratingAvg =
      ratingCount > 0 && row.rating_avg !== null && row.rating_avg !== undefined
        ? Math.round(Number(row.rating_avg) * 100) / 100
        : null;
    return {
      bookings_today: toInt(row.bookings_today),
      upcoming_7d: toInt(row.upcoming_7d),
      completed_30d: toInt(row.completed_30d),
      cancelled_30d: toInt(row.cancelled_30d),
      revenue_30d_fils: toInt(row.revenue_30d_fils),
      commission_30d_fils: toInt(row.commission_30d_fils),
      published_services: toInt(row.published_services),
      pending_review_services: toInt(row.pending_review_services),
      rating_avg: ratingAvg,
      rating_count: ratingCount,
    };
  }

  async adminDashboard(now: Date = new Date()): Promise<AdminBookingDashboard> {
    const rows = await this.query(
      `WITH ${BOUNDS_CTE}
       SELECT
         (SELECT COUNT(*) FROM bookings b
            WHERE b.deleted_at IS NULL
              AND b.status::text = ANY($2::text[])
              AND b.starts_at >= win.today_start AND b.starts_at < win.today_end) AS bookings_today,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.deleted_at IS NULL
              AND NOT (b.status::text = ANY($3::text[]))
              AND b.created_at >= win.window_start) AS bookings_30d,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.deleted_at IS NULL AND b.status::text = $4
              AND EXISTS (SELECT 1 FROM booking_status_history h
                          WHERE h.booking_id = b.id AND h.to_status = $4
                            AND h.created_at >= win.window_start)) AS completed_30d,
         (SELECT COALESCE(SUM(b.price_fils), 0) FROM bookings b
            WHERE b.deleted_at IS NULL AND b.status::text = $4
              AND EXISTS (SELECT 1 FROM booking_status_history h
                          WHERE h.booking_id = b.id AND h.to_status = $4
                            AND h.created_at >= win.window_start)) AS gmv_30d_fils,
         (SELECT COALESCE(SUM(c.commission_amount), 0) FROM commissions c
            WHERE c.deleted_at IS NULL AND c.status::text <> 'cancelled'
              AND c.created_at >= win.window_start) AS commission_30d_fils,
         (SELECT COUNT(*) FROM vendors v
            WHERE v.deleted_at IS NULL AND v.status::text = $5) AS active_vendors,
         (SELECT COUNT(*) FROM service_offerings o
            WHERE o.deleted_at IS NULL AND o.status::text = $6) AS pending_service_approvals,
         (SELECT COUNT(*) FROM users u
            WHERE u.deleted_at IS NULL AND u.role::text = $7) AS customers_total
       FROM win`,
      [
        now,
        SCHEDULED_STATUSES,
        NOT_PLACED_STATUSES,
        BookingStatus.completed,
        VendorStatus.approved,
        ServiceOfferingStatus.pending_review,
        UserRole.customer,
      ],
    );
    const row = rows[0] ?? {};
    return {
      bookings_today: toInt(row.bookings_today),
      bookings_30d: toInt(row.bookings_30d),
      completed_30d: toInt(row.completed_30d),
      gmv_30d_fils: toInt(row.gmv_30d_fils),
      commission_30d_fils: toInt(row.commission_30d_fils),
      active_vendors: toInt(row.active_vendors),
      pending_service_approvals: toInt(row.pending_service_approvals),
      customers_total: toInt(row.customers_total),
    };
  }
}
