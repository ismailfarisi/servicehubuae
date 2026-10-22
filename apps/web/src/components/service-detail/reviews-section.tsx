"use client";

import type { ServiceReviewPage } from "@/lib/booking/types";
import { BadgeCheck, MessageSquareReply } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Stars } from "./stars";

const STARS = [5, 4, 3, 2, 1] as const;

/** Rating summary with a star breakdown, then the latest approved reviews. */
export function ReviewsSection({
	reviews,
}: { reviews: ServiceReviewPage | null }) {
	const t = useTranslations("service.detail.reviews");
	const locale = useLocale();
	const count = reviews?.rating_count ?? 0;
	const avg = reviews?.rating_avg ?? 0;
	const date = new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "numeric",
	});

	return (
		<section id="reviews" className="scroll-mt-24">
			<h2 className="font-display text-2xl font-bold tracking-tight text-nl-cacao md:text-3xl">
				{t("title")}
			</h2>

			{count === 0 ? (
				<p className="mt-4 rounded-2xl border border-dashed border-nl-cacao/15 bg-nl-linen p-6 text-sm text-nl-russet">
					{t("empty")}
				</p>
			) : (
				<div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
					<div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm lg:self-start">
						<p className="font-display text-5xl font-bold text-nl-cacao tabular-nums">
							{avg.toFixed(1)}
						</p>
						<Stars
							rating={avg}
							size={18}
							label={t("starsLabel", { rating: avg.toFixed(1) })}
						/>
						<p className="mt-2 text-sm text-nl-russet">
							{t("basedOn", { count })}
						</p>
						<ul className="mt-4 space-y-1.5">
							{STARS.map((s) => {
								const n = reviews?.distribution?.[String(s) as "1"] ?? 0;
								const pct = count > 0 ? Math.round((n / count) * 100) : 0;
								return (
									<li
										key={s}
										className="flex items-center gap-2 text-xs text-nl-russet"
									>
										<span className="w-3 tabular-nums">{s}</span>
										<span className="h-2 flex-1 overflow-hidden rounded-full bg-nl-pearl">
											<span
												className="block h-full rounded-full bg-amber-400"
												style={{ width: `${pct}%` }}
											/>
										</span>
										<span className="w-6 text-end tabular-nums">{n}</span>
									</li>
								);
							})}
						</ul>
					</div>

					<div>
						<ul className="grid gap-4 md:grid-cols-2">
							{reviews?.items.map((r) => (
								<li
									key={r.id}
									className="flex flex-col rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm"
								>
									<div className="flex items-center justify-between gap-3">
										<Stars
											rating={r.rating}
											size={14}
											label={t("starsLabel", { rating: r.rating })}
										/>
										<time
											dateTime={r.created_at}
											className="text-xs text-nl-russet"
										>
											{date.format(new Date(r.created_at))}
										</time>
									</div>
									{r.title && (
										<p className="mt-3 font-semibold text-nl-cacao">
											{r.title}
										</p>
									)}
									{r.body && (
										<p className="mt-1 text-sm leading-relaxed text-nl-cacao/90">
											{r.body}
										</p>
									)}
									{r.vendor_reply && (
										<div className="mt-3 rounded-xl bg-nl-pearl p-3 text-sm text-nl-cacao/90">
											<p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-nl-cacao">
												<MessageSquareReply
													aria-hidden="true"
													className="h-3.5 w-3.5"
												/>
												{t("vendorReply")}
											</p>
											<p>{r.vendor_reply}</p>
										</div>
									)}
									<div className="mt-auto flex items-center gap-2 pt-4 text-sm">
										<span
											aria-hidden="true"
											className="flex h-8 w-8 items-center justify-center rounded-full bg-nl-pearl text-xs font-semibold text-nl-amber-text"
										>
											{r.reviewer_name[0]}
										</span>
										<span className="font-medium text-nl-cacao">
											{r.reviewer_name}
										</span>
										<span className="inline-flex items-center gap-1 text-xs text-emerald-700">
											<BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
											{t("verifiedBooking")}
										</span>
									</div>
								</li>
							))}
						</ul>
						{reviews && reviews.total > reviews.items.length && (
							<p className="mt-4 text-sm text-nl-russet">
								{t("showing", {
									shown: reviews.items.length,
									total: reviews.total,
								})}
							</p>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
