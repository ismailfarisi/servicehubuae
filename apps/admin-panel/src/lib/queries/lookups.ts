import type { LookupItem } from "@/components/ui/entity-combobox";
import { api } from "../api";

// ─── Users (admin) — server search ───────────────────────────────────

function userLabel(u: {
	id: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	role?: string;
}): LookupItem {
	const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
	return {
		id: u.id,
		label: name || u.email || "Unknown User",
		sublabel: name ? u.email : u.role,
	};
}

export async function searchAdminUsersLookup(q: string): Promise<LookupItem[]> {
	const params: Record<string, string | number> = { limit: 20 };
	if (q) params.search = q;
	const { data } = await api.get("/admin/users", { params });
	const items = data.data?.users ?? data.data?.items ?? [];
	return items.map(userLabel);
}

export async function getAdminUserByIdLookup(
	id: string,
): Promise<LookupItem | null> {
	try {
		const { data } = await api.get(`/admin/users/${id}`);
		const u = data.data;
		return u ? userLabel(u) : null;
	} catch {
		return null;
	}
}

type TreeNode = {
	id: string;
	name: string;
	slug?: string;
	children?: TreeNode[];
};

// ─── Categories (admin) — full tree, in-memory ───────────────────────

let categoryCache: Promise<LookupItem[]> | null = null;

async function loadCategoriesFlat(): Promise<LookupItem[]> {
	if (!categoryCache) {
		categoryCache = (async () => {
			const { data } = await api.get("/categories/tree");
			const flat: LookupItem[] = [];
			function walk(nodes: TreeNode[], pathLabel: string) {
				for (const n of nodes ?? []) {
					const label = pathLabel ? `${pathLabel} › ${n.name}` : n.name;
					flat.push({ id: n.id, label });
					if (n.children?.length) walk(n.children, label);
				}
			}
			walk(data.data ?? [], "");
			return flat;
		})();
	}
	return categoryCache;
}

export async function searchAdminCategoriesLookup(
	q: string,
): Promise<LookupItem[]> {
	const all = await loadCategoriesFlat();
	if (!q) return all.slice(0, 50);
	const ql = q.toLowerCase();
	return all.filter((c) => c.label.toLowerCase().includes(ql)).slice(0, 50);
}

export async function getAdminCategoryByIdLookup(
	id: string,
): Promise<LookupItem | null> {
	const all = await loadCategoriesFlat();
	return all.find((c) => c.id === id) ?? null;
}

// ─── Vendors (admin) — server search ─────────────────────────────────

type VendorLookupRow = {
	id: string;
	business_name?: string;
	contact_email?: string;
};

function vendorLabel(v: VendorLookupRow): LookupItem {
	return {
		id: v.id,
		label: v.business_name ?? "Unnamed vendor",
		sublabel: v.contact_email ?? undefined,
	};
}

export async function searchAdminVendorsLookup(
	q: string,
): Promise<LookupItem[]> {
	const params: Record<string, string | number> = { limit: 20 };
	if (q) params.search = q;
	const { data } = await api.get("/admin/vendors", { params });
	const items: VendorLookupRow[] = data.data?.data ?? [];
	return items.map(vendorLabel);
}

export async function getAdminVendorByIdLookup(
	id: string,
): Promise<LookupItem | null> {
	try {
		const { data } = await api.get(`/admin/vendors/${id}`);
		const v = data.data;
		return v ? vendorLabel(v) : null;
	} catch {
		return null;
	}
}
