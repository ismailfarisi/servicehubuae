const SEARCH_TOOL_NAME = "mypickuae.service.searchServices";
const OPEN_BOOKINGS_TOOL_NAME = "mypickuae.service.openMyBookings";

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
				title: "Search MyPickUAE services",
				description:
					"Open MyPickUAE service search results for a concise customer-provided service, category, or job.",
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
					const path = `/${locale}/services?q=${encodeURIComponent(query)}`;
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
				name: OPEN_BOOKINGS_TOOL_NAME,
				title: "Open my MyPickUAE bookings",
				description:
					"Open the customer's MyPickUAE bookings page in a browser window.",
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
					const path = `/${locale}/account/bookings`;
					await self.clients.openWindow(path);

					return {
						content: [{ type: "text", text: "Opened MyPickUAE bookings." }],
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
