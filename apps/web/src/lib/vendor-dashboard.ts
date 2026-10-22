/**
 * Vendor dashboard (apps/vendor-dashboard) base URL. Set
 * NEXT_PUBLIC_VENDOR_DASHBOARD_URL per environment; defaults to the local dev
 * port.
 */
export const VENDOR_DASHBOARD_URL = (
	process.env.NEXT_PUBLIC_VENDOR_DASHBOARD_URL || "http://localhost:4001"
).replace(/\/+$/, "");

/**
 * Where "Become a vendor" links go. The vendor dashboard has no separate
 * register route: its /login page carries the "Register interest" form for
 * new vendors alongside sign-in for existing ones.
 */
export const VENDOR_REGISTER_URL = `${VENDOR_DASHBOARD_URL}/login`;
