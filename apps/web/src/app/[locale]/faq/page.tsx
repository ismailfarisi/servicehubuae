import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";
import { VENDOR_REGISTER_URL } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
	title: "Frequently Asked Questions — MyPickUAE",
	description:
		"Answers to the most common MyPickUAE questions: booking services, changes and cancellations, payments, vendors and account.",
};

const FAQ_GROUPS: Array<{
	heading: string;
	items: Array<{ q: string; a: React.ReactNode }>;
}> = [
	{
		heading: "Booking a service",
		items: [
			{
				q: "How does booking work?",
				a: (
					<>
						Browse or search{" "}
						<a href="services" className="font-medium text-nl-amber-text hover:underline">
							Services
						</a>
						, compare vendors on price, rating and availability, then pick
						a time slot. Your slot is held while you confirm, and the
						booking appears under{" "}
						<a
							href="account/bookings"
							className="font-medium text-nl-amber-text hover:underline"
						>
							My bookings
						</a>{" "}
						as soon as it is placed.
					</>
				),
			},
			{
				q: "Can the vendor come to me?",
				a: (
					<>
						Many services are offered as home visits. Choose &ldquo;They
						come to me&rdquo; and your area when browsing, and you will
						only see vendors who cover it.
					</>
				),
			},
			{
				q: "What if I need a quotation instead of a fixed price?",
				a: (
					<>
						Larger jobs such as fit-out or maintenance contracts are
						quoted: you send one request and receive quotations from up
						to three vendors, then chat with them before you decide.
					</>
				),
			},
		],
	},
	{
		heading: "Changes & cancellations",
		items: [
			{
				q: "Can I reschedule or cancel?",
				a: (
					<>
						Yes, from the booking&rsquo;s page under My bookings. Each
						vendor sets its own reschedule and cancellation window, shown
						before you book; changes inside the window may not be
						possible or may carry a fee.
					</>
				),
			},
			{
				q: "What happens if the vendor cancels?",
				a: (
					<>
						You are notified straight away and anything you have paid
						online is refunded in full to the original payment method.
					</>
				),
			},
		],
	},
	{
		heading: "Payments",
		items: [
			{
				q: "How do I pay?",
				a: (
					<>
						Right now bookings are paid at the venue (or to the vendor on
						a home visit). Secure online card payment is coming soon; the
						payment options for each service are shown before you book.
					</>
				),
			},
			{
				q: "Are my card details safe?",
				a: (
					<>
						Online payments are handled by a PCI-DSS compliant payment
						provider. Card details are never stored on MyPickUAE&rsquo;s
						servers.
					</>
				),
			},
			{
				q: "What currency am I charged in?",
				a: (
					<>
						All prices are in AED. You can change the display currency in
						the top bar, but the charge is always in AED.
					</>
				),
			},
		],
	},
	{
		heading: "Account & vendors",
		items: [
			{
				q: "Do I need an account to book?",
				a: (
					<>
						You can browse as a guest, but booking requires an account so
						we can send confirmations and reminders and let you manage
						your bookings.
					</>
				),
			},
			{
				q: "How do I become a vendor on MyPickUAE?",
				a: (
					<>
						Register your interest on the{" "}
						<a
							href={VENDOR_REGISTER_URL}
							className="font-medium text-nl-amber-text hover:underline"
						>
							vendor dashboard
						</a>
						. Our team reviews your trade licence and services and gets
						back to you within three business days.
					</>
				),
			},
		],
	},
];

export default function FaqPage() {
	return (
		<StaticPageLayout
			eyebrow="Help"
			title="Frequently asked questions."
			intro="Most answers live here. If yours doesn't, customer care is one click away on the Contact page."
		>
			{FAQ_GROUPS.map((group) => (
				<StaticSection key={group.heading} heading={group.heading}>
					<div className="not-prose divide-y divide-nl-cacao/10 rounded-2xl border border-nl-cacao/10 bg-nl-linen px-5 md:px-6 shadow-sm">
						{group.items.map((item) => (
							<details key={item.q} className="group py-4">
								<summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-nl-cacao font-medium text-[15px] md:text-base">
									<span>{item.q}</span>
									<span
										aria-hidden
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nl-pearl text-nl-amber-text transition-transform group-open:rotate-45 text-xl leading-none"
									>
										+
									</span>
								</summary>
								<div className="mt-3 text-nl-russet text-sm md:text-[15px] leading-relaxed">
									{item.a}
								</div>
							</details>
						))}
					</div>
				</StaticSection>
			))}
		</StaticPageLayout>
	);
}
