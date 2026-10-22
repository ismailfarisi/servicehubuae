import { apiServer } from "@/lib/api-server";
import type {
	ServiceListItem,
	ServiceOffering,
	ServiceReviewPage,
	VendorLocation,
	VendorPublicProfile,
} from "@/lib/booking/types";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "./client";

// force-dynamic, not ISR — availability is inherently live data, so a cached
// shell would go stale fast.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
	// All service detail pages render on demand (catalog-service
	// GET /services/:slug); nothing is pre-built.
	return [];
}

interface Props {
	params: Promise<{ locale: string; slug: string }>;
}

interface CategoryNode {
	id: string;
	name: string;
	slug: string;
	children?: CategoryNode[];
}

function findCategory(nodes: CategoryNode[], id: string): CategoryNode | null {
	for (const node of nodes) {
		if (node.id === id) return node;
		const hit = findCategory(node.children ?? [], id);
		if (hit) return hit;
	}
	return null;
}

export async function generateMetadata({ params }: Props) {
	const { slug } = await params;
	const server = await apiServer();
	try {
		const { data } = await server.get(`/services/${slug}`);
		const offering: ServiceOffering = data.data;
		return {
			title: offering.name,
			description: offering.description?.slice(0, 160),
			openGraph: {
				title: offering.name,
				images: offering.media_urls?.[0] ? [offering.media_urls[0]] : [],
			},
		};
	} catch {
		return { title: "Service" };
	}
}

export default async function ServiceDetailPage({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const server = await apiServer(locale);

	const offering: ServiceOffering | null = await server
		.get(`/services/${slug}`)
		.then((r) => r.data.data)
		.catch(() => null);

	if (!offering || offering.status !== "published") notFound();

	// Everything below is decoration around the booking widget: each read fails
	// soft so a slow or missing upstream never takes the page down.
	const [locations, vendor, categories, reviews] = await Promise.all([
		server
			.get(`/booking/vendors/${offering.vendor_id}/locations`)
			.then((r) => (r.data.data ?? []) as VendorLocation[])
			.catch(() => [] as VendorLocation[]),
		server
			.get(`/vendors/${offering.vendor_id}/profile`)
			.then((r) => (r.data.data ?? null) as VendorPublicProfile | null)
			.catch(() => null),
		server
			.get("/categories/tree")
			.then((r) => (r.data.data ?? []) as CategoryNode[])
			.catch(() => [] as CategoryNode[]),
		server
			.get(`/booking/services/${offering.id}/reviews`, { params: { limit: 6 } })
			.then((r) => (r.data.data ?? null) as ServiceReviewPage | null)
			.catch(() => null),
	]);

	const category = offering.category_id
		? findCategory(categories, offering.category_id)
		: null;

	// One search call for the category gives both the "similar services" rail
	// and this offering's own indexed row (area names for the quick facts).
	const sameCategory: ServiceListItem[] = category
		? await server
				.get("/services", {
					params: { category: category.slug, sort: "rating", limit: 13 },
				})
				.then((r) => (r.data.data ?? []) as ServiceListItem[])
				.catch(() => [])
		: [];
	const indexed = sameCategory.find((s) => s.id === offering.id) ?? null;
	const similar = sameCategory.filter((s) => s.id !== offering.id).slice(0, 12);

	return (
		<ServiceDetailClient
			offering={offering}
			locations={locations}
			vendor={vendor}
			category={category ? { name: category.name, slug: category.slug } : null}
			reviews={reviews}
			indexed={indexed}
			similar={similar}
		/>
	);
}
