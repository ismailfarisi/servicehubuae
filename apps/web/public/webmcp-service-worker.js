const SEARCH_TOOL_NAME = "mypickuae.service.searchProducts";
const OPEN_CART_TOOL_NAME = "mypickuae.service.openCart";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			await self.clients.claim();
			registerWebMcpTools();
		})(),
	);
});

function registerWebMcpTools() {
	if (!self.agent || typeof self.agent.provideContext !== "function") {
		return;
	}

	self.agent.provideContext({
		tools: [
			{
				name: SEARCH_TOOL_NAME,
				title: "Search MyPickUAE products",
				description:
					"Open MyPickUAE search results for a concise customer-provided product, brand, category, or beauty concern.",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "Search query.",
							minLength: 1,
							maxLength: 120,
						},
						locale: {
							type: "string",
							description: "Optional storefront locale.",
							enum: ["en", "ar", "hi", "ur", "ml"],
						},
					},
					required: ["query"],
					additionalProperties: false,
				},
				annotations: { readOnlyHint: true },
				async execute(params) {
					const query = String(params.query || "")
						.trim()
						.slice(0, 120);

					if (!query) {
						return {
							content: [{ type: "text", text: "Search query is required." }],
							structuredContent: { openedWindow: false },
						};
					}

					const locale = normalizeLocale(params.locale);
					const path = `/${locale}/search?q=${encodeURIComponent(query)}`;
					await self.clients.openWindow(path);

					return {
						content: [
							{ type: "text", text: `Opened MyPickUAE search for "${query}".` },
						],
						structuredContent: { openedWindow: true, path, query },
					};
				},
			},
			{
				name: OPEN_CART_TOOL_NAME,
				title: "Open MyPickUAE cart",
				description:
					"Open the MyPickUAE cart page for customer review in a browser window.",
				inputSchema: {
					type: "object",
					properties: {
						locale: {
							type: "string",
							description: "Optional storefront locale.",
							enum: ["en", "ar", "hi", "ur", "ml"],
						},
					},
					additionalProperties: false,
				},
				async execute(params) {
					const locale = normalizeLocale(params.locale);
					const path = `/${locale}/cart`;
					await self.clients.openWindow(path);

					return {
						content: [{ type: "text", text: "Opened MyPickUAE cart." }],
						structuredContent: { openedWindow: true, path },
					};
				},
			},
		],
	});
}

function normalizeLocale(locale) {
	return ["en", "ar", "hi", "ur", "ml"].includes(locale) ? locale : "en";
}
