import { describe, expect, it } from "vitest";
import type { GetFeedParams } from "../reels";

describe("GetFeedParams", () => {
	it("accepts the vendor context with a vendorId", () => {
		const params: GetFeedParams = {
			context: "vendor",
			vendorId: "11111111-1111-1111-1111-111111111111",
			limit: 12,
		};
		expect(params.context).toBe("vendor");
	});

	it("accepts the home context with a tab", () => {
		const params: GetFeedParams = { context: "home", tab: "latest", limit: 12 };
		expect(params.tab).toBe("latest");
	});
});
