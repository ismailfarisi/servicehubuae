"use client";

import { QueryError } from "@/components/query-error";
import {
	type Category,
	useAdminCategoryTree,
	useCreateCategory,
	useDeleteCategory,
	useReorderCategories,
	useToggleCategoryActive,
	useUpdateCategory,
} from "@/lib/queries/categories";
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	EmptyState,
	Input,
	SimpleSelect,
	Skeleton,
	Switch,
	Textarea,
	toast,
} from "@mypickuae/ui";
import {
	ChevronDown,
	ChevronRight,
	FolderTree,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

// catalog-service rejects trees deeper than four levels (depth 0..3), so a
// category at depth 3 cannot take children.
const MAX_DEPTH = 3;
const NO_PARENT = "__root__";

interface FlatCategory {
	category: Category;
	depth: number;
	path: string;
}

function flatten(
	nodes: Category[],
	depth = 0,
	parentPath = "",
	out: FlatCategory[] = [],
): FlatCategory[] {
	for (const c of nodes) {
		const path = parentPath ? `${parentPath} › ${c.name}` : c.name;
		out.push({ category: c, depth, path });
		if (c.children?.length) flatten(c.children, depth + 1, path, out);
	}
	return out;
}

function subtreeIds(node: Category, out = new Set<string>()): Set<string> {
	out.add(node.id);
	for (const child of node.children ?? []) subtreeIds(child, out);
	return out;
}

function subtreeHeight(node: Category): number {
	if (!node.children?.length) return 0;
	return 1 + Math.max(...node.children.map(subtreeHeight));
}

function apiMessage(err: unknown, fallback: string) {
	const e = err as { response?: { data?: { message?: string } } };
	return e?.response?.data?.message ?? fallback;
}

interface FormState {
	name: string;
	parent_id: string;
	sort_order: number;
	is_active: boolean;
	description: string;
}

export default function CategoriesPage() {
	const { data: tree = [], isLoading, isError, error, refetch } =
		useAdminCategoryTree();
	const { mutateAsync: createCategory, isPending: creating } =
		useCreateCategory();
	const { mutateAsync: updateCategory, isPending: updating } =
		useUpdateCategory();
	const { mutateAsync: reorder, isPending: reordering } = useReorderCategories();
	const { mutate: toggleActive } = useToggleCategoryActive();
	const { mutate: deleteCategory } = useDeleteCategory();

	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Category | null>(null);
	const [form, setForm] = useState<FormState>({
		name: "",
		parent_id: NO_PARENT,
		sort_order: 0,
		is_active: true,
		description: "",
	});
	const [formError, setFormError] = useState("");

	const flat = useMemo(() => flatten(tree), [tree]);
	const saving = creating || updating || reordering;

	const parentOptions = useMemo(() => {
		// A category cannot move under itself or one of its descendants, and the
		// move must keep its whole subtree within MAX_DEPTH.
		const excluded = editing ? subtreeIds(editing) : new Set<string>();
		const height = editing ? subtreeHeight(editing) : 0;
		return [
			{ label: "— Top level —", value: NO_PARENT },
			...flat
				.filter(
					(f) =>
						!excluded.has(f.category.id) && f.depth + 1 + height <= MAX_DEPTH,
				)
				.map((f) => ({ label: f.path, value: f.category.id })),
		];
	}, [flat, editing]);

	function field<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	function openCreate(parentId: string | null = null) {
		setEditing(null);
		setForm({
			name: "",
			parent_id: parentId ?? NO_PARENT,
			sort_order: 0,
			is_active: true,
			description: "",
		});
		setFormError("");
		setDialogOpen(true);
	}

	function openEdit(c: Category) {
		setEditing(c);
		setForm({
			name: c.name,
			parent_id: c.parent_id ?? NO_PARENT,
			sort_order: c.sort_order ?? 0,
			is_active: c.is_active !== false,
			description: c.description ?? "",
		});
		setFormError("");
		setDialogOpen(true);
	}

	async function handleSave() {
		const name = form.name.trim();
		if (!name) {
			setFormError("Name is required.");
			return;
		}
		setFormError("");
		const parent_id = form.parent_id === NO_PARENT ? null : form.parent_id;
		const sort_order = Math.max(0, Math.trunc(form.sort_order || 0));
		const body = {
			name,
			parent_id,
			is_active: form.is_active,
			description: form.description.trim() || null,
		};
		try {
			let id: string;
			if (editing) {
				await updateCategory({ id: editing.id, ...body });
				id = editing.id;
			} else {
				const created = (await createCategory(body)) as { id: string };
				id = created.id;
			}
			if (sort_order !== (editing?.sort_order ?? 0)) {
				await reorder([{ id, sort_order }]);
			}
			setDialogOpen(false);
			toast({ title: editing ? "Category updated" : "Category created" });
		} catch (err) {
			setFormError(
				apiMessage(
					err,
					editing ? "Failed to update category." : "Failed to create category.",
				),
			);
		}
	}

	function handleToggle(c: Category, is_active: boolean) {
		toggleActive(
			{ id: c.id, is_active },
			{
				onError: (err) =>
					toast({
						title: "Error",
						description: apiMessage(err, "Failed to update category."),
						variant: "destructive",
					}),
			},
		);
	}

	function handleDelete(c: Category) {
		const childNote = c.children?.length
			? ` Its ${c.children.length} sub-categor${c.children.length === 1 ? "y" : "ies"} will be hidden with it.`
			: "";
		if (!confirm(`Delete category "${c.name}"?${childNote}`)) return;
		deleteCategory(c.id, {
			onSuccess: () => toast({ title: "Category deleted" }),
			onError: (err) =>
				toast({
					title: "Could not delete category",
					description: apiMessage(
						err,
						"Move or archive its services first, then try again.",
					),
					variant: "destructive",
				}),
		});
	}

	function toggleCollapsed(id: string) {
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function renderNodes(nodes: Category[], depth: number): React.ReactNode {
		return nodes.map((c) => {
			const hasChildren = !!c.children?.length;
			const isCollapsed = collapsed.has(c.id);
			return (
				<li key={c.id}>
					<div
						className="flex items-center gap-2 py-2 pr-3 border-b border-stone-100 hover:bg-pearl/40"
						style={{ paddingLeft: `${12 + depth * 24}px` }}
					>
						{hasChildren ? (
							<button
								type="button"
								onClick={() => toggleCollapsed(c.id)}
								className="p-0.5 text-taupe hover:text-cacao"
								aria-label={isCollapsed ? `Expand ${c.name}` : `Collapse ${c.name}`}
								aria-expanded={!isCollapsed}
							>
								{isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
							</button>
						) : (
							<span className="w-5" />
						)}
						<div className="flex-1 min-w-0">
							<span
								className={`font-medium ${c.is_active === false ? "text-taupe line-through" : "text-cacao"}`}
							>
								{c.name}
							</span>
							<span className="ms-2 font-mono text-xs text-taupe">/{c.slug}</span>
						</div>
						<span className="text-xs text-taupe tabular-nums w-14 text-right">
							#{c.sort_order ?? 0}
						</span>
						<Switch
							checked={c.is_active !== false}
							onCheckedChange={(v) => handleToggle(c, v)}
							aria-label={`${c.is_active === false ? "Activate" : "Deactivate"} ${c.name}`}
						/>
						<div className="flex items-center gap-1">
							{depth < MAX_DEPTH && (
								<button
									type="button"
									className="p-1.5 rounded hover:bg-pearl/100 text-taupe hover:text-cacao"
									onClick={() => openCreate(c.id)}
									aria-label={`Add sub-category to ${c.name}`}
									title="Add sub-category"
								>
									<Plus size={15} />
								</button>
							)}
							<button
								type="button"
								className="p-1.5 rounded hover:bg-pearl/100 text-taupe hover:text-cacao"
								onClick={() => openEdit(c)}
								aria-label={`Edit ${c.name}`}
								title="Edit category"
							>
								<Pencil size={15} />
							</button>
							<button
								type="button"
								className="p-1.5 rounded hover:bg-red-50 text-taupe hover:text-red-600"
								onClick={() => handleDelete(c)}
								aria-label={`Delete ${c.name}`}
								title="Delete category"
							>
								<Trash2 size={15} />
							</button>
						</div>
					</div>
					{hasChildren && !isCollapsed && (
						<ul>{renderNodes(c.children ?? [], depth + 1)}</ul>
					)}
				</li>
			);
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<div className="flex items-baseline gap-2">
						<h1 className="text-2xl font-bold text-cacao">Categories</h1>
						{!isLoading && flat.length > 0 && (
							<span className="text-sm text-taupe">
								({flat.length.toLocaleString("en-AE")})
							</span>
						)}
					</div>
					<p className="text-taupe text-sm mt-1">
						The service catalogue tree, up to four levels deep. Inactive
						categories are hidden from customers. Slugs are generated from the
						name when a category is created.
					</p>
				</div>
				<Button onClick={() => openCreate(null)}>
					<Plus size={16} className="mr-1.5" />
					Add Category
				</Button>
			</div>

			{isError ? (
				<QueryError
					title="Could not load categories."
					error={error}
					onRetry={() => refetch()}
				/>
			) : isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<Skeleton key={i} className="h-10 w-full rounded-lg" />
					))}
				</div>
			) : tree.length === 0 ? (
				<div className="rounded-xl border border-stone-200 bg-linen">
					<EmptyState
						icon={<FolderTree size={28} />}
						title="No categories yet"
						description="Create top-level categories such as Home Cleaning or Beauty & Wellness, then add sub-categories under them."
						action={{ label: "Add your first category", onClick: () => openCreate(null) }}
					/>
				</div>
			) : (
				<div className="rounded-xl border border-stone-200 bg-linen overflow-x-auto">
					<ul className="min-w-[560px]">{renderNodes(tree, 0)}</ul>
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{formError && (
							<div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
								{formError}
							</div>
						)}

						<div>
							<label
								htmlFor="category-name"
								className="block text-sm font-medium text-cacao mb-1"
							>
								Name *
							</label>
							<Input
								id="category-name"
								value={form.name}
								onChange={(e) => field("name", e.target.value)}
								placeholder="Home Cleaning"
							/>
						</div>

						{editing && (
							<div>
								<span className="block text-sm font-medium text-cacao mb-1">Slug</span>
								<p className="font-mono text-sm text-taupe">/{editing.slug}</p>
							</div>
						)}

						<div>
							<span className="block text-sm font-medium text-cacao mb-1">
								Parent
							</span>
							<SimpleSelect
								value={form.parent_id}
								onValueChange={(v) => field("parent_id", v)}
								options={parentOptions}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3 items-end">
							<div>
								<label
									htmlFor="category-sort"
									className="block text-sm font-medium text-cacao mb-1"
								>
									Sort order
								</label>
								<Input
									id="category-sort"
									type="number"
									min={0}
									value={form.sort_order}
									onChange={(e) => field("sort_order", Number(e.target.value))}
								/>
							</div>
							<div className="flex items-center gap-2 text-sm text-cacao pb-2">
								<Switch
									id="category-active"
									checked={form.is_active}
									onCheckedChange={(v) => field("is_active", v)}
								/>
								<label htmlFor="category-active">Active</label>
							</div>
						</div>

						<div>
							<label
								htmlFor="category-description"
								className="block text-sm font-medium text-cacao mb-1"
							>
								Description
							</label>
							<Textarea
								id="category-description"
								value={form.description}
								onChange={(e) => field("description", e.target.value)}
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDialogOpen(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={saving}>
							{saving ? "Saving..." : editing ? "Save Changes" : "Add Category"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
