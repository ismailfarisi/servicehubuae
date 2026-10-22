/**
 * The single commission ceiling, shared by every path that produces a
 * commission amount (booking commission snapshotting in booking-service today;
 * quotation payments in M4). It lives in `@mypickuae/utils` so a second caller
 * can never drift back to an uncapped formula.
 *
 * The invariant it enforces is that a vendor's earning on a line can never go
 * NEGATIVE:
 *
 *     vendor_earning = netExVat - commission - round(commission * 0.05)  >= 0
 *
 * Without it, a `fixed` commission at or above the item's net stored
 * `earning = -round(0.05 * commission)`. That is not merely odd bookkeeping:
 * a negative earning subtracts from `items_net` in `computePayoutTotals` (so
 * one such line reduces every OTHER line's payout), and it breaks the
 * identity the reversal clawbacks telescope on,
 * `stored vendor_earning === recompute(line_total)`.
 *
 * `floor(net / 1.05)` is the largest commission whose own 5% tax still fits
 * inside the net: 1.05c <= net, and round(0.05c) <= 0.05c + 0.5 keeps
 * c + tax <= net over the integers.
 *
 * Integer fils in, integer fils out — no float ever reaches a stored column.
 */
export function maxCommissionForNet(netExVat: number): number {
  return Math.floor(netExVat / 1.05);
}
