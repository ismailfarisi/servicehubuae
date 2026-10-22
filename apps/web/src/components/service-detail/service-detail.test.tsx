import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServiceListItem, ServiceOffering, ServiceReviewPage } from "../../lib/booking/types";
import { QuickFacts } from "./quick-facts";
import { ReviewsSection } from "./reviews-section";

// Interpolate params into the key so assertions see the values the customer
// sees (same precedent as service-card.test.tsx).
vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: () => (key: string, params?: Record<string, unknown>) =>
		params ? `${key} ${JSON.stringify(params)}` : key,
}));

const offering = {
	id: "o1",
	location_mode: "home_visit",
	payment_mode: "pay_at_venue",
	cancellation_window_hours: 24,
	auto_approve: true,
} as ServiceOffering;

const indexed = {
	id: "o1",
	area_ids: ["a1", "a2", "a3", "a4", "a5", "a6"],
	area_names: ["Deira", "Mirdif", "Al Qusais", "Al Nahda", "Al Majaz", "Muwaileh"],
	home_visit_area_ids: ["a1", "a2", "a3", "a4", "a5", "a6"],
	premises_area_ids: [],
} as unknown as ServiceListItem;

describe("QuickFacts", () => {
	it("shows home-visit areas, capped with a +N more", () => {
		render(<QuickFacts offering={offering} indexed={indexed} />);
		expect(screen.getByText("homeVisit")).toBeTruthy();
		expect(
			screen.getByText('Deira, Mirdif, Al Qusais, Al Nahda moreAreas {"count":2}'),
		).toBeTruthy();
		expect(screen.queryByText("atPremises")).toBeNull();
	});

	it("covers payment, free cancellation and instant confirmation", () => {
		render(<QuickFacts offering={offering} indexed={indexed} />);
		expect(screen.getByText("payAtVenue")).toBeTruthy();
		expect(screen.getByText('freeCancellation {"hours":24}')).toBeTruthy();
		expect(screen.getByText("instantConfirm")).toBeTruthy();
	});

	it("says the vendor confirms when bookings are not auto-approved", () => {
		render(<QuickFacts offering={{ ...offering, auto_approve: false }} indexed={null} />);
		expect(screen.getByText("vendorConfirms")).toBeTruthy();
	});
});

const page: ServiceReviewPage = {
	items: [
		{
			id: "r1",
			rating: 5,
			title: "Spot on",
			body: "Great job.",
			vendor_reply: "Thank you!",
			created_at: "2026-05-02T10:00:00.000Z",
			reviewer_name: "Fatima A.",
		},
	],
	total: 4,
	page: 1,
	limit: 6,
	rating_avg: 4.75,
	rating_count: 4,
	distribution: { "1": 0, "2": 0, "3": 0, "4": 1, "5": 3 },
};

describe("ReviewsSection", () => {
	it("shows the empty state when there are no reviews", () => {
		render(<ReviewsSection reviews={null} />);
		expect(screen.getByText("empty")).toBeTruthy();
	});

	it("shows the average, the review and the vendor reply", () => {
		render(<ReviewsSection reviews={page} />);
		expect(screen.getByText("4.8")).toBeTruthy();
		expect(screen.getByText("Spot on")).toBeTruthy();
		expect(screen.getByText("Fatima A.")).toBeTruthy();
		expect(screen.getByText("Thank you!")).toBeTruthy();
		expect(screen.getByText('showing {"shown":1,"total":4}')).toBeTruthy();
	});
});
