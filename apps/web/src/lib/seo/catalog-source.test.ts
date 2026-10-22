import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategories, getVendors } from "./catalog-source";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
	vi.resetAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getCategories", () => {
	it("flattens the category tree into service-listing category landings", async () => {
		mockedGet.mockResolvedValueOnce({
			data: {
				data: [
					{
						slug: "home-maintenance",
						children: [
							{ slug: "ac-repair", children: [{ slug: "ac-duct-cleaning" }] },
							{ slug: "plumbing", children: [] },
						],
					},
				],
			},
		});

		const entries = await getCategories();

		expect(entries.map((e) => e.path)).toEqual([
			"/services?category=home-maintenance",
			"/services?category=ac-repair",
			"/services?category=ac-duct-cleaning",
			"/services?category=plumbing",
		]);
	});

	it("uses the public categories/tree route", async () => {
		mockedGet.mockResolvedValueOnce({ data: { data: [] } });

		await getCategories();

		expect(mockedGet.mock.calls[0][0]).toContain("/categories/tree");
	});

	it("throws instead of returning an empty list when the API fails", async () => {
		mockedGet.mockRejectedValueOnce(new Error("boom"));

		await expect(getCategories()).rejects.toThrow(/sitemap upstream failed/);
	});
});

describe("getVendors", () => {
	it("derives unique vendors from published services, preferring the slug", async () => {
		mockedGet.mockResolvedValueOnce({
			data: {
				data: [
					{ slug: "ac-service", vendor_id: "v1", vendor_slug: "cool-air" },
					{ slug: "ac-repair", vendor_id: "v1", vendor_slug: "cool-air" },
					{ slug: "deep-clean", vendor_id: "0b6c-uuid" },
				],
				total: 3,
			},
		});

		expect((await getVendors()).map((e) => e.path)).toEqual([
			"/vendor/cool-air",
			"/vendor/0b6c-uuid",
		]);
	});

	it("requests services at the backend page-size maximum of 50", async () => {
		mockedGet.mockResolvedValueOnce({ data: { data: [], total: 0 } });

		await getVendors();

		expect(mockedGet.mock.calls[0][0]).toContain("/services?limit=50&page=1");
	});
});
