import { api, ensureGuestSessionToken } from "../api";

export interface ReelUploadResponse {
	uploadUrl: string;
	assetId: string;
	reelId: string;
}

export async function requestReelUpload(): Promise<ReelUploadResponse> {
	const res = await api.post("/reels/uploads");
	return res.data.data as ReelUploadResponse;
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
	status: "draft" | "pending_review" | "approved" | "rejected" | "removed";
	rejection_reason: string | null;
	published_at: string | null;
	created_at: string;
}

export interface GetMyReelsParams {
	assetId?: string;
	cursor?: string;
	limit?: number;
}

export async function getMyReels(
	params: GetMyReelsParams = {},
): Promise<{ items: MyReelSummary[]; nextCursor: string | null }> {
	const res = await api.get("/me/reels", {
		params: {
			asset_id: params.assetId,
			cursor: params.cursor,
			limit: params.limit,
		},
	});
	return {
		items: res.data.items ?? [],
		nextCursor: res.data.nextCursor ?? null,
	};
}

export async function getReel(reelId: string) {
	const res = await api.get(`/reels/${reelId}`);
	return res.data.data;
}

export async function publishReel(reelId: string) {
	const res = await api.post(`/reels/${reelId}/publish`);
	return res.data.data;
}

export interface UpdateReelMetadataPayload {
	caption?: string;
	language_code?: string;
	thumbnail_url?: string;
	is_sponsored_disclosed?: boolean;
}

export async function updateReelMetadata(
	reelId: string,
	data: UpdateReelMetadataPayload,
) {
	const res = await api.patch(`/reels/${reelId}`, data);
	return res.data.data;
}

export async function deleteReel(reelId: string) {
	await api.delete(`/reels/${reelId}`);
}

export interface GetFeedParams {
	context: "home" | "vendor" | "user";
	tab?: "for_you" | "latest" | "following";
	vendorId?: string;
	userId?: string;
	language?: string;
	cursor?: string;
	limit?: number;
}

export async function getFeed(params: GetFeedParams) {
	const res = await api.get("/reels/feed", { params });
	// biome-ignore lint/suspicious/noExplicitAny: API response shape — FeedReel DTO pending
	return res.data as { reels: any[]; nextCursor: string | null };
}

export interface RecordViewPayload {
	watchDurationSeconds: number;
	completionPercentage: number;
	deviceType?: string;
}

export async function recordView(reelId: string, payload: RecordViewPayload) {
	// Wait for the guest-session bootstrap before posting — without an identity
	// the backend silently no-ops the increment.
	await ensureGuestSessionToken();
	await api.post(`/reels/${reelId}/views`, payload);
}

export async function toggleLike(reelId: string) {
	const res = await api.post(`/reels/${reelId}/like`);
	return res.data.data as { action: "liked" | "unliked" };
}

export async function toggleSave(reelId: string) {
	const res = await api.post(`/reels/${reelId}/save`);
	return res.data.data as { action: "saved" | "unsaved" };
}

export async function recordShare(reelId: string) {
	const res = await api.post(`/reels/${reelId}/share`);
	return res.data.data as { shareCount: number; shareableUrl: string };
}

export async function toggleFollow(userId: string) {
	const res = await api.post(`/users/${userId}/follow`);
	return res.data.data as { action: "followed" | "unfollowed" };
}

export async function getSavedReels(cursor?: string) {
	const res = await api.get("/me/reels/saved", { params: { cursor } });
	// biome-ignore lint/suspicious/noExplicitAny: API response shape — Reel item DTO pending
	return res.data as { items: any[]; nextCursor: string | null };
}

export async function getWatchHistory(cursor?: string) {
	const res = await api.get("/me/reels/watch-history", { params: { cursor } });
	// biome-ignore lint/suspicious/noExplicitAny: API response shape — WatchHistory item DTO pending
	return res.data as { items: any[]; nextCursor: string | null };
}

export interface UserProfile {
	id: string;
	displayName: string;
	avatarUrl?: string | null;
	followerCount: number;
	followingCount: number;
	publishedReelCount: number;
	isSelf: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
	const res = await api.get(`/users/${userId}`);
	return res.data.data as UserProfile;
}
