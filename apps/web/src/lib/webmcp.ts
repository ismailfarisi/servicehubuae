import { searchResultsHref } from "./links";

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

export function registerServiceHubUAEWebMcpTools({ locale = "en" } = {}) {
	if (typeof document === "undefined" || !document.modelContext) {
		return undefined;
	}

	const controller = new AbortController();
	const tools = createServiceHubUAEWebMcpTools(locale);

	for (const tool of tools) {
		document.modelContext.registerTool(tool, { signal: controller.signal });
	}

	return () => controller.abort();
}

export async function registerServiceHubUAEWebMcpServiceWorker({
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

function createServiceHubUAEWebMcpTools(locale: string): WebMcpTool[] {
	return [
		{
			name: "servicehubuae.searchServices",
			title: "Search ServiceHubUAE services",
			description:
				"Navigate the ServiceHubUAE storefront to service search results for a concise customer-provided query.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description:
							"Service, category, or job to search for (e.g. \"AC repair\", \"deep cleaning\").",
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

				const path = searchResultsHref(locale, query);
				window.location.assign(path);

				return {
					content: [
						{ type: "text", text: `Searching ServiceHubUAE for "${query}".` },
					],
					structuredContent: { navigated: true, path, query },
				};
			},
		},
		{
			name: "servicehubuae.openMyBookings",
			title: "Open my ServiceHubUAE bookings",
			description:
				"Navigate to the customer's bookings page so they can review upcoming and past appointments.",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
			},
			async execute() {
				const path = `/${locale}/account/bookings`;
				window.location.assign(path);

				return {
					content: [{ type: "text", text: "Opened My bookings." }],
					structuredContent: { navigated: true, path },
				};
			},
		},
	];
}
