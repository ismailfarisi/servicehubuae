import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
	title: "About ServiceHubUAE — The UAE's Services Marketplace",
	description:
		"ServiceHubUAE is a UAE services marketplace: browse 440+ services, compare trusted independent vendors side by side, then book a time slot or request quotations.",
};

export default function AboutPage() {
	return (
		<StaticPageLayout
			eyebrow="Our story"
			title="Every service your home and life need, in one place."
			intro="ServiceHubUAE brings the UAE's independent service businesses — cleaners, technicians, salons, trainers, movers and more — into one marketplace where you can compare them honestly and book with confidence."
		>
			<StaticSection heading="Why we exist">
				<p>
					Finding a good AC technician, a reliable cleaner or a mover you
					can trust usually means a string of phone calls, half-answered
					WhatsApp messages and quotes that are hard to compare. We think
					it should feel as simple as choosing a time that suits you.
				</p>
				<p>
					ServiceHubUAE puts services, prices and vendors side by side. For
					everyday jobs you pick a vendor and book a slot; for bigger jobs
					you describe what you need, receive quotations from vendors and
					chat with them before you decide.
				</p>
			</StaticSection>

			<StaticSection heading="What we promise">
				<ul className="list-disc ps-5 space-y-2">
					<li>
						<strong className="text-nl-cacao">Vetted vendors.</strong>{" "}
						Every vendor goes through onboarding and licence checks before
						their services go live, and listings that breach our standards
						are removed.
					</li>
					<li>
						<strong className="text-nl-cacao">Clear choices.</strong>{" "}
						Compare up to three eligible vendors on price, reviews and
						availability before you book.
					</li>
					<li>
						<strong className="text-nl-cacao">Arabic and English.</strong>{" "}
						Search, booking and support work in both languages, with
						right-to-left layouts for Arabic.
					</li>
					<li>
						<strong className="text-nl-cacao">Simple payment.</strong>{" "}
						Pay the vendor at the time of service today, with secure
						online card payment coming soon.
					</li>
				</ul>
			</StaticSection>

			<StaticSection heading="At a glance">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 not-prose">
					{[
						{ n: "440+", l: "services" },
						{ n: "Up to 3", l: "vendors compared side by side" },
						{ n: "2", l: "ways to book: slot or quotation" },
						{ n: "7", l: "emirates in our service areas" },
					].map((stat) => (
						<div key={stat.l} className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm">
							<div className="font-display font-bold tracking-tight text-3xl md:text-4xl text-nl-amber-text">
								{stat.n}
							</div>
							<div className="text-sm font-medium text-nl-russet mt-1.5">
								{stat.l}
							</div>
						</div>
					))}
				</div>
			</StaticSection>

			<StaticSection heading="Where we are">
				<p>
					ServiceHubUAE is headquartered in Dubai and built for customers and
					vendors across the United Arab Emirates. The team brings
					together operators, engineers and vendor partnership specialists
					who know the UAE services market first-hand.
				</p>
			</StaticSection>
		</StaticPageLayout>
	);
}
