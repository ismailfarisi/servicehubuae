/**
 * Online (card) payments are off until MyFatoorah lands in M2. Mirrors the
 * backend `ONLINE_PAYMENTS_ENABLED` flag (config.payments.onlineEnabled); the
 * vendor dashboard reads the same NEXT_PUBLIC_ variable. While off, only
 * pay_at_venue offerings can be booked.
 */
export const ONLINE_PAYMENTS_ENABLED =
	process.env.NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED === "true";

/**
 * booking-service rejects holds/creates for non pay_at_venue offerings with
 * 422 "online_payment_unavailable" (in `message` or `error`) while online
 * payments are off.
 */
export function isOnlinePaymentUnavailableError(err: unknown): boolean {
	const response = (
		err as {
			response?: { status?: number; data?: { message?: unknown; error?: unknown } };
		}
	)?.response;
	if (!response || (response.status !== 422 && response.status !== 503)) return false;
	return (
		response.data?.message === "online_payment_unavailable" ||
		response.data?.error === "online_payment_unavailable"
	);
}
