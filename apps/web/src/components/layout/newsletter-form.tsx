"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const SUBSCRIBED_FLAG = "servicehubuae:newsletter-subscribed";

export function NewsletterForm() {
	const user = useAuthStore((s) => s.user);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<
		"idle" | "submitting" | "just-subscribed" | "already-subscribed" | "error"
	>("idle");

	// Prefill from the logged-in account (store is hydrated by the app shell's
	// useMe(); if not yet hydrated, the field simply starts empty).
	useEffect(() => {
		if (user?.email) setEmail(user.email);
	}, [user?.email]);

	// Decide whether to hide the form: guests via localStorage (per-browser),
	// logged-in via GET /newsletter/status (cross-device). The status endpoint
	// returns { subscribed:false } for anonymous callers, so this is safe to
	// always call.
	useEffect(() => {
		let cancelled = false;
		if (localStorage.getItem(SUBSCRIBED_FLAG) === "true") {
			setStatus("already-subscribed");
			return;
		}
		(async () => {
			try {
				const { data } = await api.get("/newsletter/status");
				if (!cancelled && data?.data?.subscribed) setStatus("already-subscribed");
			} catch {
				// Non-fatal: leave the form visible.
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (status === "submitting") return;
		setStatus("submitting");
		try {
			const locale = localStorage.getItem("servicehubuae-locale") || "en";
			await api.post("/newsletter/subscribe", { email, locale, source: "homepage" });
			localStorage.setItem(SUBSCRIBED_FLAG, "true");
			setStatus("just-subscribed");
		} catch {
			setStatus("error");
		}
	}

	if (status === "just-subscribed" || status === "already-subscribed") {
		return (
			<div
				className="w-full"
				{...(status === "just-subscribed"
					? { role: "status", "aria-live": "polite" as const }
					: {})}
				data-state="newsletter-subscribed"
			>
				<div className="flex items-center gap-3 rounded-xl border border-nl-amber/20 bg-nl-pearl px-4 py-3.5">
					<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nl-amber text-white">
						<Check className="h-4 w-4" strokeWidth={2} />
					</span>
					<span className="font-display font-semibold text-base md:text-lg text-nl-cacao">
						You're subscribed — welcome to the edit.
					</span>
				</div>
				<p className="mt-4 text-sm text-nl-russet">
					Check your inbox for a confirmation.
				</p>
			</div>
		);
	}

	return (
		<form className="w-full" onSubmit={handleSubmit} aria-label="Newsletter signup">
			<div className="flex flex-col sm:flex-row gap-2.5">
				<input
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="your@email.com"
					aria-label="Email address"
					className="flex-1 min-w-0 min-h-[44px] rounded-lg border border-nl-cacao/15 bg-nl-linen px-4 py-3 text-base text-nl-cacao placeholder:text-nl-russet/70 outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
				/>
				<button
					type="submit"
					disabled={status === "submitting"}
					className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{status === "submitting" ? "Subscribing…" : "Subscribe"}
					<ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
				</button>
			</div>
			{status === "error" && (
				<p className="mt-3 text-sm text-red-700" role="alert">
					Something went wrong. Please try again.
				</p>
			)}
			<div className="flex flex-wrap gap-4 md:gap-5 mt-4 text-sm text-nl-russet">
				<span className="inline-flex items-center gap-1.5">
					<Check className="h-4 w-4 text-nl-amber" strokeWidth={2} />
					No spam
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Check className="h-4 w-4 text-nl-amber" strokeWidth={2} />
					Unsubscribe anytime
				</span>
			</div>
		</form>
	);
}
