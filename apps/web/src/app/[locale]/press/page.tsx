import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
	title: "Press & Media — MyPickUAE",
	description:
		"Press contacts, brand assets and the MyPickUAE story for journalists, partners and creators covering the UAE services market.",
};

const FACTS = [
	{ k: "Headquarters", v: "Dubai, United Arab Emirates" },
	{ k: "Market", v: "United Arab Emirates" },
	{
		k: "Services",
		v: "440+ services across home maintenance, cleaning, beauty & wellness, pest control & pets, fit-out and business services",
	},
	{ k: "Ways to book", v: "Instant slot booking · Quotations from up to 3 vendors" },
	{ k: "Languages", v: "Arabic · English" },
	{ k: "Marketplace model", v: "Multi-vendor services marketplace" },
];

export default function PressPage() {
	return (
		<StaticPageLayout
			eyebrow="Press"
			title="Press, partnerships, and the MyPickUAE story."
			intro="For interviews, brand assets or partnership enquiries, our press team is one email away."
		>
			<StaticSection heading="The short version">
				<p>
					MyPickUAE is a UAE-based services marketplace. Customers browse
					a catalogue of everyday and specialist services, compare
					independent vendors side by side, and either book a time slot
					straight away or request quotations and chat with vendors before
					choosing. Vendors manage their listings, availability, bookings
					and quotations in one dashboard.
				</p>
			</StaticSection>

			<StaticSection heading="Fact sheet">
				<div className="not-prose overflow-hidden rounded-2xl border border-nl-cacao/10 divide-y divide-nl-cacao/10 bg-nl-linen shadow-sm">
					{FACTS.map((f) => (
						<div
							key={f.k}
							className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 px-5 py-4 text-sm"
						>
							<dt className="text-xs font-medium text-nl-russet self-center">
								{f.k}
							</dt>
							<dd className="text-nl-cacao">{f.v}</dd>
						</div>
					))}
				</div>
			</StaticSection>

			<StaticSection heading="Media contacts">
				<p>
					Press, interviews and commentary on the UAE services market,
					plus vendor partnerships and creator collaborations:{" "}
					<a
						href="mailto:info@mypickuae.com"
						className="font-medium text-nl-amber-text hover:underline"
					>
						info@mypickuae.com
					</a>
				</p>
			</StaticSection>

			<StaticSection heading="Brand assets">
				<p>
					Logo lockups, product screenshots and approved photography are
					available on request. Please email{" "}
					<a
						href="mailto:info@mypickuae.com"
						className="font-medium text-nl-amber-text hover:underline"
					>
						info@mypickuae.com
					</a>{" "}
					with your outlet and intended use and we&rsquo;ll send a kit
					within one business day.
				</p>
			</StaticSection>
		</StaticPageLayout>
	);
}
