import { useCartStore } from "@/stores/cart";

type WebMcpToolResponse = {
	content: Array<{ type: "text"; text: string }>;
	structuredContent?: Record<string, unknown>;
};

type WebMcpTool = {
	name: string;
	title: string;
	description: string;
	inputSchema?: Record<string, unknown>;
	annotations?: {
		readOnlyHint?: boolean;
		untrustedContentHint?: boolean;
	};
	execute: (input: Record<string, unknown>) => Promise<WebMcpToolResponse>;
};

type ModelContext = {
	registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
};

declare global {
	interface Document {
		modelContext?: ModelContext;
	}
}

export function registerMyPickUAEWebMcpTools({ locale = "en" } = {}) {
	if (typeof document === "undefined" || !document.modelContext) {
		return undefined;
	}

	const controller = new AbortController();
	const tools = createMyPickUAEWebMcpTools(locale);

	for (const tool of tools) {
		document.modelContext.registerTool(tool, { signal: controller.signal });
	}

	return () => controller.abort();
}

export async function registerMyPickUAEWebMcpServiceWorker({
	scriptUrl = "/webmcp-service-worker.js",
	scope = "/",
} = {}) {
	if (
		typeof window === "undefined" ||
		!("serviceWorker" in navigator) ||
		!navigator.serviceWorker
	) {
		return undefined;
	}

	try {
		return await navigator.serviceWorker.register(scriptUrl, { scope });
	} catch {
		return undefined;
	}
}

function createMyPickUAEWebMcpTools(locale: string): WebMcpTool[] {
	return [
		{
			name: "mypickuae.searchProducts",
			title: "Search MyPickUAE products",
			description:
				"Navigate the MyPickUAE storefront to product search results for a concise customer-provided query.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description:
							"Product, brand, category, or beauty concern to search for.",
						minLength: 1,
						maxLength: 120,
					},
				},
				required: ["query"],
				additionalProperties: false,
			},
			annotations: { readOnlyHint: true },
			async execute(input) {
				const query = String(input.query ?? "")
					.trim()
					.slice(0, 120);
				if (!query) {
					return {
						content: [{ type: "text", text: "Search query is required." }],
						structuredContent: { navigated: false },
					};
				}

				const path = `/${locale}/search?q=${encodeURIComponent(query)}`;
				window.location.assign(path);

				return {
					content: [
						{ type: "text", text: `Searching MyPickUAE for "${query}".` },
					],
					structuredContent: { navigated: true, path, query },
				};
			},
		},
		{
			name: "mypickuae.getCartSummary",
			title: "Get MyPickUAE cart summary",
			description:
				"Read the visible MyPickUAE cart drawer state and current item count.",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
			},
			annotations: { readOnlyHint: true },
			async execute() {
				const { itemCount, isSlideOverOpen } = useCartStore.getState();
				const itemLabel = itemCount === 1 ? "item" : "items";

				return {
					content: [
						{ type: "text", text: `Cart contains ${itemCount} ${itemLabel}.` },
					],
					structuredContent: { itemCount, isOpen: isSlideOverOpen },
				};
			},
		},
		{
			name: "mypickuae.openCart",
			title: "Open MyPickUAE cart",
			description:
				"Open the MyPickUAE cart drawer so the customer can review their cart in the page.",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
			},
			async execute() {
				useCartStore.getState().openSlideOver();

				return {
					content: [{ type: "text", text: "Cart opened." }],
					structuredContent: { isOpen: true },
				};
			},
		},
	];
}
