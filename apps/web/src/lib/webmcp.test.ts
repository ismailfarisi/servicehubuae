import { afterEach, describe, expect, test, vi } from "vitest";
import { registerServiceHubUAEWebMcpTools } from "./webmcp";

describe("registerServiceHubUAEWebMcpTools", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		Reflect.deleteProperty(document, "modelContext");
	});

	test("does nothing when WebMCP is unavailable", () => {
		expect(registerServiceHubUAEWebMcpTools()).toBeUndefined();
	});

	test("registers storefront tools and aborts them during cleanup", () => {
		const registerTool = vi.fn();
		Object.defineProperty(document, "modelContext", {
			configurable: true,
			value: { registerTool },
		});

		const cleanup = registerServiceHubUAEWebMcpTools({ locale: "en" });

		expect(registerTool).toHaveBeenCalledTimes(2);
		expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual([
			"servicehubuae.searchServices",
			"servicehubuae.openMyBookings",
		]);

		const signals = registerTool.mock.calls.map(
			([, options]) => options.signal,
		);
		expect(signals.every((signal) => signal instanceof AbortSignal)).toBe(true);
		expect(signals.every((signal) => signal.aborted)).toBe(false);

		cleanup?.();

		expect(signals.every((signal) => signal.aborted)).toBe(true);
	});

	test("rejects an empty search query without navigating", async () => {
		const registerTool = vi.fn();
		Object.defineProperty(document, "modelContext", {
			configurable: true,
			value: { registerTool },
		});

		registerServiceHubUAEWebMcpTools({ locale: "en" });

		const searchTool = registerTool.mock.calls[0][0];
		await expect(searchTool.execute({ query: "   " })).resolves.toEqual({
			content: [{ type: "text", text: "Search query is required." }],
			structuredContent: { navigated: false },
		});
	});
});
