import { redirect } from "next/navigation";
import { VENDOR_REGISTER_URL } from "@/lib/vendor-dashboard";

/**
 * Stable storefront path for "become a vendor" calls to action (CMS banners
 * link here). The vendor dashboard URL differs per environment, so it is
 * resolved from env at request time instead of being stored in layouts.
 */
export default function BecomeAVendorPage(): never {
  redirect(VENDOR_REGISTER_URL);
}
