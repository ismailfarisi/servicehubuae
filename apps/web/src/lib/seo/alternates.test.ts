import { describe, expect, it } from "vitest";
import { routing } from "../../../i18n/routing";
import { absoluteUrl, buildAlternates } from "./alternates";
import { LOCALES } from "./config";

describe("seo alternates", () => {
	it("sources locales from the routing config and nothing else", () => {
		expect(LOCALES).toEqual(routing.locales);
		expect(LOCALES).toEqual(["en", "ar"]);
	});

	it("builds an absolute, locale-prefixed url", () => {
		expect(absoluteUrl("en", "/service/foo")).toBe(
			"https://www.mypickuae.com/en/service/foo",
		);
		expect(absoluteUrl("ar", "/service/foo")).toBe(
			"https://www.mypickuae.com/ar/service/foo",
		);
	});

	it("treats the bare root path as the locale home", () => {
		expect(absoluteUrl("en", "/")).toBe("https://www.mypickuae.com/en");
	});

	it("leaves a plain ASCII slug unchanged", () => {
		expect(absoluteUrl("en", "/service/foo-bar")).toBe(
			"https://www.mypickuae.com/en/service/foo-bar",
		);
	});

	it("percent-encodes a space in a slug", () => {
		expect(absoluteUrl("en", "/service/foo bar")).toBe(
			"https://www.mypickuae.com/en/service/foo%20bar",
		);
	});

	it("percent-encodes non-ASCII characters in a slug", () => {
		expect(absoluteUrl("en", "/service/منتج")).toBe(
			"https://www.mypickuae.com/en/service/%D9%85%D9%86%D8%AA%D8%AC",
		);
	});

	it("builds reciprocal hreflang alternates with x-default on en", () => {
		expect(buildAlternates("en", "/service/foo")).toEqual({
			canonical: "https://www.mypickuae.com/en/service/foo",
			languages: {
				en: "https://www.mypickuae.com/en/service/foo",
				ar: "https://www.mypickuae.com/ar/service/foo",
				"x-default": "https://www.mypickuae.com/en/service/foo",
			},
		});
	});

	it("self-references the canonical to the rendering locale, not en", () => {
		expect(buildAlternates("ar", "/service/foo")).toEqual({
			canonical: "https://www.mypickuae.com/ar/service/foo",
			languages: {
				en: "https://www.mypickuae.com/en/service/foo",
				ar: "https://www.mypickuae.com/ar/service/foo",
				"x-default": "https://www.mypickuae.com/en/service/foo",
			},
		});
	});

	it("passes a query string through unencoded", () => {
		expect(absoluteUrl("ar", "/services?category=home-maintenance")).toBe(
			"https://www.mypickuae.com/ar/services?category=home-maintenance",
		);
	});
});
