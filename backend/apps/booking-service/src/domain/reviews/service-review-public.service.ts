// service-review-public.service.ts
//
// Storefront read of a service offering's reviews (GET /booking/services/:id/reviews).
// Reviews carry no service_offering_id of their own, so they are reached
// through their booking. Same visibility filter catalog-service's
// loadRatings uses for the search-index rating (approved, not deleted), so
// the count on the detail page matches the count on the service cards.
//
// Reviewers are shown as "First L." — the storefront never exposes a
// customer's full surname, email or id.

type RawQuery = (sql: string, params?: unknown[]) => Promise<any[]>;

export interface PublicServiceReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  vendor_reply: string | null;
  created_at: string;
  reviewer_name: string;
}

export interface PublicServiceReviewPage {
  items: PublicServiceReview[];
  total: number;
  page: number;
  limit: number;
  rating_avg: number | null;
  rating_count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const APPROVED = "approved";

const OFFERING_REVIEWS_WHERE = `
 WHERE b.service_offering_id = $1
   AND r.status::text = $2
   AND r.deleted_at IS NULL
   AND b.deleted_at IS NULL`;

export function shortReviewerName(first: string | null, last: string | null): string {
  const f = first?.trim();
  const l = last?.trim();
  if (!f) return "Verified customer";
  return l ? `${f} ${l[0]?.toUpperCase()}.` : f;
}

export class ServiceReviewPublicService {
  constructor(private readonly query: RawQuery) {}

  async listForOffering(
    offeringId: string,
    opts: { page?: number; limit?: number },
  ): Promise<PublicServiceReviewPage> {
    const limit = Math.min(Math.max(Math.trunc(opts.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
    const page = Math.max(Math.trunc(opts.page ?? 1), 1);

    const [rows, grouped] = await Promise.all([
      this.query(
        `SELECT r.id, r.rating, r.title, r.body, r.vendor_reply, r.created_at,
                u.first_name, u.last_name
           FROM service_reviews r
           JOIN bookings b ON b.id = r.booking_id
           LEFT JOIN users u ON u.id = r.customer_user_id
          ${OFFERING_REVIEWS_WHERE}
          ORDER BY r.created_at DESC
          LIMIT $3 OFFSET $4`,
        [offeringId, APPROVED, limit, (page - 1) * limit],
      ),
      this.query(
        `SELECT r.rating, COUNT(*)::int AS count
           FROM service_reviews r
           JOIN bookings b ON b.id = r.booking_id
          ${OFFERING_REVIEWS_WHERE}
          GROUP BY r.rating`,
        [offeringId, APPROVED],
      ),
    ]);

    const distribution: PublicServiceReviewPage["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let count = 0;
    let sum = 0;
    for (const g of grouped) {
      const stars = Number(g.rating);
      const n = Number(g.count);
      if (stars >= 1 && stars <= 5) distribution[stars as 1 | 2 | 3 | 4 | 5] = n;
      count += n;
      sum += stars * n;
    }

    return {
      items: rows.map((r) => ({
        id: r.id,
        rating: Number(r.rating),
        title: r.title ?? null,
        body: r.body ?? null,
        vendor_reply: r.vendor_reply ?? null,
        created_at: new Date(r.created_at).toISOString(),
        reviewer_name: shortReviewerName(r.first_name, r.last_name),
      })),
      total: count,
      page,
      limit,
      rating_avg: count > 0 ? Math.round((sum / count) * 100) / 100 : null,
      rating_count: count,
      distribution,
    };
  }
}
