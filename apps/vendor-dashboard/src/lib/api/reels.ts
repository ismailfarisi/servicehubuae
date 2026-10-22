import { api } from "../api";

export interface ReelUploadResponse {
	uploadUrl: string;
	assetId: string;
	reelId: string;
}

export interface MyReelSummary {
	id: string;
	user_id: string;
	video_asset_id: string;
	video_playback_url: string;
	video_duration_seconds: number;
	thumbnail_url: string;
	caption: string | null;
	language_code: string;
	is_sponsored_disclosed: boolean;
	status: "draft" | "pending_review" | "approved" | "rejected" | "removed";
	rejection_reason: string | null;
	published_at: string | null;
	created_at: string;
}

export async function requestReelUpload(): Promise<ReelUploadResponse> {
	const { data } = await api.post("/reels/uploads");
	return data.data as ReelUploadResponse;
}

export async function getMyReels(
	params: {
		assetId?: string;
		cursor?: string;
		limit?: number;
	} = {},
): Promise<{ items: MyReelSummary[]; nextCursor: string | null }> {
	const { data } = await api.get("/me/reels", {
		params: {
			asset_id: params.assetId,
			cursor: params.cursor,
			limit: params.limit,
		},
	});
	return { items: data.items ?? [], nextCursor: data.nextCursor ?? null };
}

export async function getReel(reelId: string): Promise<MyReelSummary> {
	const { data } = await api.get(`/reels/${reelId}`);
	return data.data as MyReelSummary;
}

export async function updateReelMetadata(
	reelId: string,
	payload: {
		caption?: string;
		language_code?: string;
		thumbnail_url?: string;
		is_sponsored_disclosed?: boolean;
	},
): Promise<MyReelSummary> {
	const { data } = await api.patch(`/reels/${reelId}`, payload);
	return data.data as MyReelSummary;
}

export async function publishReel(reelId: string): Promise<MyReelSummary> {
	const { data } = await api.post(`/reels/${reelId}/publish`);
	return data.data as MyReelSummary;
}

export async function deleteReel(reelId: string): Promise<void> {
	await api.delete(`/reels/${reelId}`);
}
