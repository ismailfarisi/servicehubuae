import { describe, expect, it } from "vitest";
import { buildBreadcrumbJsonLd } from "./breadcrumb-jsonld";

describe("buildBreadcrumbJsonLd", () => {
	it("emits absolute ListItem.item URLs", () => {
		const jsonLd = buildBreadcrumbJsonLd("en", [
			{ name: "Lipstick", path: "/c/lipstick" },
		]);

		expect(jsonLd.itemListElement).toEqual([
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://www.mypickuae.com/en",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Lipstick",
				item: "https://www.mypickuae.com/en/c/lipstick",
			},
		]);
	});

	// schema.org requires ListItem.item to be an absolute URL. Relative values
	// are why the storefront's breadcrumbs were being discarded by Google.
	it("never emits a relative item URL", () => {
		const jsonLd = buildBreadcrumbJsonLd("ar", [
			{ name: "Makeup", path: "/c/makeup" },
			{ name: "A Product" },
		]);

		for (const entry of jsonLd.itemListElement) {
			if ("item" in entry) {
				expect(entry.item).toMatch(/^https:\/\//);
			}
		}
	});

	it("prefixes the rendering locale, not a fixed one", () => {
		const jsonLd = buildBreadcrumbJsonLd("ar", []);
		expect(jsonLd.itemListElement[0].item).toBe("https://www.mypickuae.com/ar");
	});

	// The final crumb is the current page. schema.org permits omitting `item`
	// on it, and doing so is preferable to a self-referencing link.
	it("omits item on a crumb that has no path", () => {
		const jsonLd = buildBreadcrumbJsonLd("en", [{ name: "A Product" }]);

		expect(jsonLd.itemListElement[1]).toEqual({
			"@type": "ListItem",
			position: 2,
			name: "A Product",
		});
		expect(jsonLd.itemListElement[1]).not.toHaveProperty("item");
	});

	it("numbers positions sequentially from 1 with no gaps", () => {
		const jsonLd = buildBreadcrumbJsonLd("en", [
			{ name: "Makeup", path: "/c/makeup" },
			{ name: "Lips", path: "/c/lips" },
			{ name: "A Product" },
		]);

		expect(jsonLd.itemListElement.map((e) => e.position)).toEqual([1, 2, 3, 4]);
	});

	it("localises the home crumb label when one is supplied", () => {
		const jsonLd = buildBreadcrumbJsonLd("ar", [], "الرئيسية");
		expect(jsonLd.itemListElement[0].name).toBe("الرئيسية");
	});

	it("is a well-formed BreadcrumbList", () => {
		const jsonLd = buildBreadcrumbJsonLd("en", []);
		expect(jsonLd["@context"]).toBe("https://schema.org");
		expect(jsonLd["@type"]).toBe("BreadcrumbList");
	});
});
