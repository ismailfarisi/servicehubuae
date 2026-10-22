import { describe, expect, it } from "vitest";
import { type NavData, normalizeNavData, normalizeNavHref } from "../navigation";

describe("normalizeNavHref", () => {
	it("maps category pages onto the filtered service listing", () => {
		expect(normalizeNavHref("/c/cleaning")).toBe("/services?category=cleaning");
		expect(normalizeNavHref("/en/c/home-maintenance")).toBe(
			"/en/services?category=home-maintenance",
		);
	});

	it("maps search onto the service listing, keeping the query", () => {
		expect(normalizeNavHref("/search?q=ac")).toBe("/services?q=ac");
		expect(normalizeNavHref("/ar/search")).toBe("/ar/services");
	});

	it("leaves other links alone", () => {
		expect(normalizeNavHref("/services")).toBe("/services");
		expect(normalizeNavHref("/en/service/deep-clean")).toBe("/en/service/deep-clean");
		expect(normalizeNavHref("https://example.com/c/x")).toBe("https://example.com/c/x");
	});
});

describe("normalizeNavData", () => {
	it("rewrites tab links and drops brand lists", () => {
		const data: NavData = {
			version: 1,
			generated_at: "2026-10-22T00:00:00.000Z",
			tabs: [
				{
					id: "t1",
					kind: "category",
					label: "Cleaning",
					href: "/c/cleaning",
					subcategories: [{ label: "Deep cleaning", href: "/c/deep-cleaning" }],
					brand_list: {
						title: "Brands",
						see_all_href: "/brands",
						brands: [{ id: "b1", name: "Old brand", href: "/brand/old" }],
					},
					promo_tiles: [
						{ image_url: "x", title: "Brand", cta_text: "Go", href: "/brand/old" },
						{ image_url: "y", title: "Offer", cta_text: "Go", href: "/c/cleaning" },
					],
				},
			],
		};

		const [tab] = normalizeNavData(data).tabs;
		expect(tab.href).toBe("/services?category=cleaning");
		expect(tab.subcategories[0].href).toBe("/services?category=deep-cleaning");
		expect(tab.brand_list.brands).toEqual([]);
		expect(tab.brand_list.see_all_href).toBe("/services");
		expect(tab.promo_tiles.map((p) => p.href)).toEqual(["/services?category=cleaning"]);
	});
});
