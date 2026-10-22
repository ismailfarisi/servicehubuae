import { AppDataSource } from "@servicehubuae/database";
import { reelLinkedToVendorSql } from "../shared/reel-vendor-link.ts";

export interface DiscoveryCard {
  id: string;
  video_playback_url: string;
  thumbnail_url: string;
  video_duration_seconds: number;
  language_code: string;
  caption: string | null;
  published_at: string | null;
  created_at: string;
  creator: { id: string; name: string };
  engagement: { views: number; likes: number; saves: number; shares: number };
  is_shortlisted: boolean;
}

export type MineSort = "recent" | "most_viewed";
const MINE_SORT_SQL: Record<MineSort, string> = {
  recent: "r.published_at DESC NULLS LAST, r.created_at DESC",
  most_viewed: "r.view_count DESC",
};

export interface MineParams {
  vendorId: string;
  sort?: MineSort;
  limit?: number;
  offset?: number;
}

interface RawCardRow {
  id: string;
  video_playback_url: string;
  thumbnail_url: string;
  video_duration_seconds: number;
  language_code: string;
  caption: string | null;
  published_at: string | null;
  created_at: string;
  creator_id: string;
  creator_name: string;
  view_count: number;
  like_count: number;
  save_count: number;
  share_count: number;
  is_shortlisted: boolean;
}

const CARD_COLUMNS = `
  r.id, r.video_playback_url, r.thumbnail_url, r.video_duration_seconds,
  r.language_code, r.caption,
  r.published_at::text AS published_at, r.created_at::text AS created_at,
  u.id AS creator_id,
  COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''), u.email) AS creator_name,
  r.view_count, r.like_count, r.save_count, r.share_count`;

export class DiscoveryService {
  /** The vendor's own UGC gallery: approved reels linked to the vendor
   *  (licence grant, delivered collab or team upload — reelLinkedToVendorSql). */
  async mine(params: MineParams): Promise<{ items: DiscoveryCard[]; asOf: string }> {
    const sort = MINE_SORT_SQL[params.sort ?? "recent"] ?? MINE_SORT_SQL.recent;
    const limit = Math.min(60, Math.max(1, Math.trunc(Number(params.limit)) || 24));
    const offset = Math.max(0, Math.trunc(Number(params.offset)) || 0);

    // $1 vendor_id, $2 limit, $3 offset
    const sql = `
      SELECT ${CARD_COLUMNS},
             (sl.id IS NOT NULL) AS is_shortlisted
        FROM reels r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN reel_vendor_shortlists sl
               ON sl.reel_id = r.id AND sl.vendor_id = $1 AND sl.deleted_at IS NULL
       WHERE r.status = 'approved' AND r.deleted_at IS NULL
         AND ${reelLinkedToVendorSql("r", "$1")}
       ORDER BY ${sort}
       LIMIT $2 OFFSET $3;
    `;
    const rows: RawCardRow[] = await AppDataSource.query(sql, [params.vendorId, limit, offset]);
    return { items: rows.map((r) => this.toCard(r)), asOf: new Date().toISOString() };
  }

  async browse(params: {
    vendorId: string;
    sort?: "ranking" | "recent";
    creatorId?: string | null;
    keyword?: string | null;
    language?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<{ items: DiscoveryCard[]; asOf: string }> {
    const limit = Math.min(60, Math.max(1, Math.trunc(Number(params.limit)) || 24));
    const offset = Math.max(0, Math.trunc(Number(params.offset)) || 0);
    const order =
      params.sort === "recent"
        ? "r.published_at DESC NULLS LAST, r.created_at DESC"
        : "r.ranking_score DESC, r.published_at DESC NULLS LAST";

    const args: unknown[] = [params.vendorId, limit, offset];
    const filters: string[] = [];
    if (params.creatorId) {
      args.push(params.creatorId);
      filters.push(`AND r.user_id = $${args.length}`);
    }
    if (params.keyword) {
      // Escape ILIKE metacharacters so a keyword like "30%" or "SPF_50" is a literal substring.
      const escaped = params.keyword.replace(/[\\%_]/g, (m) => `\\${m}`);
      args.push(`%${escaped}%`);
      filters.push(`AND r.caption ILIKE $${args.length} ESCAPE '\\'`);
    }
    if (params.language) {
      args.push(params.language);
      filters.push(`AND r.language_code = $${args.length}`);
    }

    const sql = `
      SELECT ${CARD_COLUMNS},
             (sl.id IS NOT NULL) AS is_shortlisted
        FROM reels r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN reel_vendor_shortlists sl
               ON sl.reel_id = r.id AND sl.vendor_id = $1 AND sl.deleted_at IS NULL
       WHERE r.status = 'approved' AND r.deleted_at IS NULL
       ${filters.join("\n       ")}
       ORDER BY ${order}
       LIMIT $2 OFFSET $3;
    `;
    const rows: RawCardRow[] = await AppDataSource.query(sql, args);
    return { items: rows.map((r) => this.toCard(r)), asOf: new Date().toISOString() };
  }

  /** Hydrate an explicit, caller-supplied set of reel_ids (the vendor's
   *  shortlist) into full cards, order preserved. */
  async cardsByIds(_vendorId: string, reelIds: string[]): Promise<DiscoveryCard[]> {
    if (reelIds.length === 0) return [];
    const sql = `
      SELECT ${CARD_COLUMNS},
             TRUE AS is_shortlisted
        FROM reels r
        JOIN users u ON u.id = r.user_id
       WHERE r.id = ANY($1::uuid[]) AND r.deleted_at IS NULL AND r.status = 'approved';
    `;
    const rows: RawCardRow[] = await AppDataSource.query(sql, [reelIds]);
    const byId = new Map(rows.map((r) => [r.id, this.toCard(r)]));
    return reelIds.map((id) => byId.get(id)).filter((c): c is DiscoveryCard => Boolean(c));
  }

  private toCard(r: RawCardRow): DiscoveryCard {
    return {
      id: r.id,
      video_playback_url: r.video_playback_url,
      thumbnail_url: r.thumbnail_url,
      video_duration_seconds: Number(r.video_duration_seconds),
      language_code: r.language_code,
      caption: r.caption,
      published_at: r.published_at,
      created_at: r.created_at,
      creator: { id: r.creator_id, name: r.creator_name },
      engagement: {
        views: Number(r.view_count ?? 0),
        likes: Number(r.like_count ?? 0),
        saves: Number(r.save_count ?? 0),
        shares: Number(r.share_count ?? 0),
      },
      is_shortlisted: Boolean(r.is_shortlisted),
    };
  }
}
