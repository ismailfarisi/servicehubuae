import type { Metadata } from "next";
import {
	StaticPageLayout,
	StaticSection,
} from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
	title: "Contact MyPickUAE",
	description:
		"Reach MyPickUAE customer care, vendor support, press and partnerships — channels, hours and response times.",
};

const PHONE = "+971 50 301 9357";
const EMAILS = ["info@mypickuae.com", "help@mypickuae.com"];

export default function ContactPage() {
	return (
		<StaticPageLayout
			eyebrow="Contact"
			title="Talk to a human at MyPickUAE."
			intro="Customer care answers in Arabic and English, seven days a week."
		>
			<StaticSection heading="Get in touch">
				<div className="rounded-2xl border border-nl-cacao/10 p-6 bg-nl-linen shadow-sm not-prose">
					<p className="text-base font-semibold">
						<a
							href={`tel:${PHONE.replace(/\s/g, "")}`}
							className="text-nl-cacao hover:underline"
						>
							{PHONE}
						</a>
					</p>
					{EMAILS.map((email) => (
						<p key={email} className="text-sm mt-1.5">
							<a
								href={`mailto:${email}`}
								className="font-medium text-nl-amber-text hover:underline"
							>
								{email}
							</a>
						</p>
					))}
				</div>
			</StaticSection>
		</StaticPageLayout>
	);
}
