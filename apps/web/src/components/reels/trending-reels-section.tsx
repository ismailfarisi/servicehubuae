"use client";

import { getFeed } from "@/lib/api/reels";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScrollRail } from "@/components/layout/scroll-rail";

interface Props {
	title: string;
	subtitle: string;
	/** Reels pre-loaded from the layout API; if empty, fetches client-side. */
	serverReels: any[];
}

export function TrendingReelsSection({ title, subtitle, serverReels }: Props) {
	const [reels, setReels] = useState<any[]>(serverReels);

	useEffect(() => {
		if (serverReels.length > 0) return;
		let cancelled = false;
		getFeed({ context: "home", tab: "for_you", limit: 6 })
			.then((d) => {
				if (!cancelled) setReels(d.reels);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [serverReels]);

	if (reels.length === 0) return null;

	return (
		<section
			data-section="trending-reels"
			className="relative left-[calc(50%-50vw)] w-screen rtl:left-auto rtl:right-[calc(50%-50vw)] bg-nl-cacao text-nl-linen py-12 md:py-[72px]"
		>
			<div className="max-w-[1400px] mx-auto px-4 md:px-12">
				<div className="flex items-end justify-between mb-8 md:mb-10">
					<div>
						<p className="text-sm font-semibold text-nl-pearl/75">
							{subtitle}
						</p>
						<h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2">
							{title}
						</h2>
					</div>
					<Link
						href="/reels"
						className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
					>
						View all reels
						<ArrowRight className="h-4 w-4 rtl:rotate-180" />
					</Link>
				</div>
			</div>

			<ScrollRail className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-4 md:px-12 scroll-ps-4 md:scroll-ps-12 max-w-[1400px] mx-auto">
				{reels.map((reel: any) => (
					<Link
						key={reel.id}
						href={`/en/reels/${reel.id}`}
						className="relative flex-none w-[160px] md:w-[200px] aspect-[9/16] snap-start overflow-hidden rounded-2xl bg-black/30"
					>
						{reel.thumbnail_url ? (
							<img src={reel.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
						) : null}
						{reel.caption ? (
							<span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white">
								{reel.caption}
							</span>
						) : null}
					</Link>
				))}
			</ScrollRail>

			<div className="max-w-[1400px] mx-auto px-4 md:px-12">
				<Link
					href="/reels"
					className="md:hidden mt-6 flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
				>
					View all reels
					<ArrowRight className="h-4 w-4 rtl:rotate-180" />
				</Link>
			</div>
		</section>
	);
}
