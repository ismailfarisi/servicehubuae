import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
	title: "Terms of Service — ServiceHubUAE",
	description:
		"The terms that govern your use of ServiceHubUAE — bookings, quotations, payment, cancellations, vendor responsibilities, reviews and dispute resolution.",
};

const LAST_UPDATED = "22 October 2026";

export default function TermsPage() {
	return (
		<StaticPageLayout
			eyebrow="Legal"
			title="Terms of Service"
			intro={`The rules that govern your use of ServiceHubUAE. Please read them — opening an account means you accept these terms. Last updated ${LAST_UPDATED}.`}
		>
			<StaticSection heading="1. Who you contract with">
				<p>
					ServiceHubUAE is operated by ServiceHubUAE FZ-LLC, registered in Dubai,
					United Arab Emirates. ServiceHubUAE is a marketplace that connects
					customers with independent service vendors. When you book a
					service or accept a quotation, your contract for that service
					is with the <em>vendor</em> who provides it; ServiceHubUAE
					operates the platform, facilitates booking and payment, and
					provides customer support and dispute assistance.
				</p>
			</StaticSection>

			<StaticSection heading="2. Accounts">
				<p>
					You must be at least 18 years old and able to enter a binding
					contract under UAE law to open an account and make bookings.
					Accounts are personal — you may not transfer them or share
					credentials, and you are responsible for activity on your
					account. Keep your contact details and service addresses
					accurate so vendors can reach you.
				</p>
			</StaticSection>

			<StaticSection heading="3. Bookings & quotations">
				<p>
					<strong className="text-nl-cacao">Quick Services</strong> are
					booked directly: you choose a vendor, a date and an available
					time slot, and we send you a booking confirmation once the
					booking is complete (for online payments, once payment
					succeeds). We may decline or cancel a booking for
					availability or fraud reasons; any online payment is then
					refunded in full.
				</p>
				<p>
					<strong className="text-nl-cacao">Quotation Services</strong>{" "}
					start with a request: you describe the job and up to three
					vendors may send you a quotation and chat with you about it. A
					quotation is an offer from the vendor; a booking is made only
					when you accept it. Vendors may revise a quotation if the job
					turns out to differ materially from your description, and you
					are free to decline.
				</p>
			</StaticSection>

			<StaticSection heading="4. Pricing">
				<p>
					Prices are in AED and include 5% VAT where applicable. The
					price shown when you confirm a booking, or in the quotation
					you accept, is the price for the service as described.
					Additional work, parts or materials requested on the day are
					agreed directly with the vendor before they are carried out.
					Other display currencies are indicative only.
				</p>
			</StaticSection>

			<StaticSection heading="5. Payment">
				<p>
					At present, bookings are paid to the vendor at the time of
					service (&ldquo;pay at venue&rdquo;). Where online payment is
					available, you can pay by card or Apple Pay through our
					payment processor&rsquo;s secure page when you book; card
					details are held by the payment processor and are never
					stored by ServiceHubUAE.
				</p>
			</StaticSection>

			<StaticSection heading="6. Cancellations, rescheduling and refunds">
				<p>
					Each vendor sets a cancellation policy, which is shown before
					you confirm a booking. You may cancel or reschedule within the
					terms of that policy; late cancellations and no-shows may
					incur the charge the policy describes. If a vendor cancels or
					fails to attend, you will not be charged and any online
					payment is refunded in full.
				</p>
				<p>
					Refunds for online payments are made to the original payment
					method in line with the vendor&rsquo;s cancellation policy.
					If you are unhappy with a completed service, contact support
					and we will work with you and the vendor to resolve it.
				</p>
			</StaticSection>

			<StaticSection heading="7. Vendor responsibilities">
				<p>
					Vendors must hold the trade licences and permits their
					services require, carry insurance where required by law, keep
					their listings, prices and availability accurate, honour
					confirmed bookings, and ensure their staff are qualified and
					behave professionally and safely in customers&rsquo; homes
					and premises. Vendors that breach these standards or their
					ServiceHubUAE vendor agreement may have listings removed or be
					offboarded.
				</p>
			</StaticSection>

			<StaticSection heading="8. Reviews and user content">
				<p>
					Reviews, photos, messages and reels you publish on ServiceHubUAE
					must be your own, truthful, based on a genuine experience, and
					free of unlawful or offensive content. Vendors may not offer
					incentives for reviews or post reviews of their own services.
					You grant ServiceHubUAE a non-exclusive, royalty-free, worldwide
					licence to display, reproduce and promote your content in
					connection with the marketplace.
				</p>
				<p>
					We may moderate, edit or remove content that breaches these
					terms or our community guidelines.
				</p>
			</StaticSection>

			<StaticSection heading="9. Acceptable use">
				<p>
					You may not misuse the platform: no fraudulent or fake
					bookings, no harassment of vendors, their staff or our support
					team, no arranging to take a booking found on ServiceHubUAE
					off-platform to avoid our terms, and no scraping, reverse
					engineering or interfering with the service. We may suspend or
					close accounts that do, and cancel pending bookings.
				</p>
			</StaticSection>

			<StaticSection heading="10. Intellectual property">
				<p>
					ServiceHubUAE, the ServiceHubUAE logo, and the platform design are
					owned by ServiceHubUAE FZ-LLC. Vendor names, logos and listing
					photography belong to the respective vendors and rights
					holders. You may not scrape, mirror, or reuse any of this
					content without written permission.
				</p>
			</StaticSection>

			<StaticSection heading="11. Liability">
				<p>
					Vendors are responsible for the services they provide. Where
					permitted by UAE law, ServiceHubUAE&rsquo;s aggregate liability
					for any claim relating to a booking is capped at the value of
					that booking. We are not liable for indirect or consequential
					losses, or for vendor performance beyond what is expressly
					stated in these terms.
				</p>
			</StaticSection>

			<StaticSection heading="12. Governing law">
				<p>
					These terms are governed by the laws of the United Arab
					Emirates. Disputes are subject to the exclusive jurisdiction
					of the Dubai Courts, without prejudice to any non-waivable
					consumer rights in your emirate of residence.
				</p>
			</StaticSection>

			<StaticSection heading="13. Changes">
				<p>
					We may update these terms from time to time. The current
					version is always on this page, with the date updated. For
					material changes we will email you at least 14 days before
					they take effect.
				</p>
			</StaticSection>

			<StaticSection heading="14. Contact">
				<p>
					Questions on these terms:{" "}
					<a
						href="mailto:info@servicehubuae.com"
						className="font-medium text-nl-amber-text hover:underline"
					>
						info@servicehubuae.com
					</a>
					.
				</p>
			</StaticSection>
		</StaticPageLayout>
	);
}
