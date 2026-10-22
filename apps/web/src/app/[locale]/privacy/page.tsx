import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
	title: "Privacy Policy — MyPickUAE",
	description:
		"How MyPickUAE collects, uses, shares and protects your personal data when you browse, book and request quotations for services, in line with UAE Federal Decree-Law No. 45 of 2021.",
};

const LAST_UPDATED = "22 October 2026";

export default function PrivacyPage() {
	return (
		<StaticPageLayout
			eyebrow="Legal"
			title="Privacy Policy"
			intro={`How we collect, use and protect your data — written in plain language. Last updated ${LAST_UPDATED}.`}
		>
			<StaticSection heading="1. Who we are">
				<p>
					MyPickUAE FZ-LLC (&ldquo;MyPickUAE&rdquo;, &ldquo;we&rdquo;,
					&ldquo;us&rdquo;) is registered in Dubai, United Arab Emirates,
					and operates the mypickuae.com services marketplace and mobile
					apps. We are the data controller for personal data processed in
					connection with your account, bookings and quotation requests.
					The vendor you book is responsible for the personal data they
					receive to deliver your service.
				</p>
			</StaticSection>

			<StaticSection heading="2. What we collect">
				<ul className="list-disc ps-5 space-y-2">
					<li>
						<strong className="text-nl-cacao">Account data</strong> —
						name, email, mobile number, password hash, language
						preference and saved addresses.
					</li>
					<li>
						<strong className="text-nl-cacao">Booking data</strong> —
						the service you book, the vendor, the service address and
						area, your preferred date and time, notes or photos you add
						for the vendor, and the price and booking status.
					</li>
					<li>
						<strong className="text-nl-cacao">Quotation data</strong> —
						the job description and attachments you send when requesting
						quotations, the quotations you receive, and your chat
						messages with vendors.
					</li>
					<li>
						<strong className="text-nl-cacao">Payment data</strong> —
						whether a booking is paid at the venue or online and, for
						online payments, the payment status and reference. Card
						details are entered on our payment processor&rsquo;s secure
						page and are never stored on our servers.
					</li>
					<li>
						<strong className="text-nl-cacao">Usage data</strong> —
						pages viewed, search terms, device and browser, IP
						address, approximate location.
					</li>
					<li>
						<strong className="text-nl-cacao">Communications</strong>{" "}
						— support tickets, reviews you publish, and reels or other
						content you post.
					</li>
				</ul>
			</StaticSection>

			<StaticSection heading="3. Why we use it">
				<ul className="list-disc ps-5 space-y-2">
					<li>
						To arrange bookings and quotations: checking availability,
						passing your request to the vendor, and handling
						rescheduling, cancellations and refunds.
					</li>
					<li>
						To run your account: login, saved addresses, favourites and
						recent searches.
					</li>
					<li>
						To personalise the marketplace — relevant services, vendors
						near your area and what to show on the home page.
					</li>
					<li>
						To send service messages (booking confirmations, reminders,
						quotation updates, verification codes) and, with your
						consent, marketing emails and push notifications.
					</li>
					<li>
						To prevent fraud and abuse, and to comply with UAE consumer
						protection and tax law.
					</li>
				</ul>
			</StaticSection>

			<StaticSection heading="4. Sharing">
				<p>
					We share personal data only where necessary, with categories
					of recipients including: the vendor you book or request a
					quotation from (your name, contact number, service address,
					preferred time and notes, so they can deliver the service);
					our payment processor, MyFatoorah, when you pay online;
					messaging providers that deliver our email, SMS and WhatsApp
					messages; cloud infrastructure, analytics and crash reporting
					providers; and authorities where required by law.
				</p>
				<p>
					We do not sell your personal data. Vendors receive only the
					data needed to deliver and support the service you booked with
					them, and may use it only for that purpose.
				</p>
			</StaticSection>

			<StaticSection heading="5. International transfers">
				<p>
					Some of our service providers may process personal data outside
					the UAE. Such transfers rely on adequacy decisions or
					appropriate contractual safeguards as recognised under UAE
					Federal Decree-Law No. 45 of 2021 on the Protection of Personal
					Data.
				</p>
			</StaticSection>

			<StaticSection heading="6. How long we keep it">
				<p>
					Account data is kept while your account is open and for 24
					months after closure, except where longer retention is
					required by tax, accounting or fraud-prevention law (up to
					seven years for invoices and payment records). Marketing data
					is kept until you withdraw consent.
				</p>
			</StaticSection>

			<StaticSection heading="7. Your rights">
				<p>
					You have the right to access, correct, delete, restrict or
					port your personal data, and to withdraw consent at any time.
					Email{" "}
					<a
						href="mailto:info@mypickuae.com"
						className="font-medium text-nl-amber-text hover:underline"
					>
						info@mypickuae.com
					</a>{" "}
					with your request — we respond within 30 days.
				</p>
				<p>
					You also have the right to complain to the UAE Data Office if
					you believe your rights have been breached.
				</p>
			</StaticSection>

			<StaticSection heading="8. Cookies">
				<p>
					We use strictly-necessary cookies to keep you signed in and
					your booking in progress safe. Analytics and marketing cookies
					are loaded only after you accept them in the consent banner.
					You can change your choice any time in account settings.
				</p>
			</StaticSection>

			<StaticSection heading="9. Children">
				<p>
					MyPickUAE is intended for users aged 18 and over. We do not
					knowingly collect data from children. If you believe a minor
					has created an account, email{" "}
					<a
						href="mailto:info@mypickuae.com"
						className="font-medium text-nl-amber-text hover:underline"
					>
						info@mypickuae.com
					</a>{" "}
					and we will remove it.
				</p>
			</StaticSection>

			<StaticSection heading="10. Changes">
				<p>
					When we update this policy, we change the date at the top and,
					for material changes, notify you by email. Continuing to use
					MyPickUAE after the effective date means you accept the
					updated policy.
				</p>
			</StaticSection>
		</StaticPageLayout>
	);
}
