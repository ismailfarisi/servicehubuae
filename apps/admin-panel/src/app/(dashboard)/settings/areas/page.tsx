"use client";

import { QueryError } from "@/components/query-error";
import {
	type Area,
	EMIRATES,
	useAdminAreas,
	useCreateArea,
	useDeleteArea,
	useUpdateArea,
} from "@/lib/queries/areas";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	toast,
} from "@servicehubuae/ui";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface AreaFormState {
	name: string;
	slug: string;
	city: string;
	emirate: string;
	sort_order: number;
	is_active: boolean;
}

const EMPTY_FORM: AreaFormState = {
	name: "",
	slug: "",
	city: "",
	emirate: "Dubai",
	sort_order: 0,
	is_active: true,
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function apiMessage(err: unknown, fallback: string) {
	const e = err as { response?: { data?: { message?: string } } };
	return e?.response?.data?.message ?? fallback;
}

export default function AreasSettingsPage() {
	const { data: areas = [], isLoading, isError, error, refetch } = useAdminAreas();
	const { mutate: createArea, isPending: creating } = useCreateArea();
	const { mutate: updateArea, isPending: updating } = useUpdateArea();
	const { mutate: deleteArea } = useDeleteArea();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<AreaFormState>(EMPTY_FORM);
	const [formError, setFormError] = useState("");
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return areas;
		return areas.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				a.city.toLowerCase().includes(q) ||
				a.emirate.toLowerCase().includes(q),
		);
	}, [areas, search]);

	function field<K extends keyof AreaFormState>(key: K, value: AreaFormState[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	function openCreate() {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setFormError("");
		setDialogOpen(true);
	}

	function openEdit(area: Area) {
		setEditingId(area.id);
		setForm({
			name: area.name,
			slug: area.slug,
			city: area.city,
			emirate: area.emirate,
			sort_order: area.sort_order ?? 0,
			is_active: area.is_active,
		});
		setFormError("");
		setDialogOpen(true);
	}

	function handleSave() {
		const name = form.name.trim();
		const city = form.city.trim();
		const slug = form.slug.trim();
		if (!name) return setFormError("Name is required.");
		if (!city) return setFormError("City is required.");
		if (slug && !SLUG_RE.test(slug)) {
			return setFormError(
				"Slug may only contain lowercase letters, numbers and single hyphens.",
			);
		}
		setFormError("");

		const payload = {
			name,
			city,
			emirate: form.emirate,
			sort_order: Math.max(0, Math.trunc(form.sort_order || 0)),
			is_active: form.is_active,
			// Leave the slug out when blank so the API derives it from the name.
			...(slug ? { slug } : {}),
		};

		if (editingId) {
			updateArea(
				{ id: editingId, ...payload },
				{
					onSuccess: () => {
						setDialogOpen(false);
						toast({ title: "Area updated" });
					},
					onError: (err) => setFormError(apiMessage(err, "Failed to update area.")),
				},
			);
		} else {
			createArea(payload, {
				onSuccess: () => {
					setDialogOpen(false);
					toast({ title: "Area added" });
				},
				onError: (err) => setFormError(apiMessage(err, "Failed to add area.")),
			});
		}
	}

	function toggleActive(area: Area, is_active: boolean) {
		updateArea(
			{ id: area.id, is_active },
			{
				onSuccess: () =>
					toast({ title: is_active ? "Area activated" : "Area deactivated" }),
				onError: (err) =>
					toast({
						title: "Error",
						description: apiMessage(err, "Failed to update area."),
						variant: "destructive",
					}),
			},
		);
	}

	function handleDelete(area: Area) {
		if (
			!confirm(
				`Delete area "${area.name}"? It disappears from the storefront area picker.`,
			)
		)
			return;
		deleteArea(area.id, {
			onSuccess: () => toast({ title: "Area deleted" }),
			onError: (err) =>
				toast({
					title: "Error",
					description: apiMessage(err, "Failed to delete area."),
					variant: "destructive",
				}),
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<div className="flex items-baseline gap-2">
						<h1 className="text-2xl font-bold text-cacao">Areas</h1>
						{!isLoading && areas.length > 0 && (
							<span className="text-sm text-taupe">
								({areas.length.toLocaleString("en-AE")})
							</span>
						)}
					</div>
					<p className="text-taupe text-sm mt-1">
						UAE localities customers pick on the storefront. Vendor branches and
						home-visit coverage point at these areas. Inactive areas are hidden
						from customers.
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus size={16} className="mr-1.5" />
					Add Area
				</Button>
			</div>

			{isError ? (
				<QueryError
					title="Could not load areas."
					error={error}
					onRetry={() => refetch()}
				/>
			) : isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<Skeleton key={i} className="h-12 w-full rounded-lg" />
					))}
				</div>
			) : areas.length === 0 ? (
				<div className="rounded-xl border border-stone-200 bg-linen">
					<EmptyState
						icon={<MapPin size={28} />}
						title="No areas yet"
						description="Add the localities your vendors serve, for example Dubai Marina or Al Reem Island."
						action={{ label: "Add your first area", onClick: openCreate }}
					/>
				</div>
			) : (
				<div className="space-y-3">
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, city or emirate…"
						className="max-w-sm"
					/>
					<div className="rounded-xl border border-stone-200 bg-linen overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>City</TableHead>
									<TableHead>Emirate</TableHead>
									<TableHead className="text-right">Order</TableHead>
									<TableHead>Active</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center text-taupe py-8">
											No areas match &ldquo;{search}&rdquo;.
										</TableCell>
									</TableRow>
								) : (
									filtered.map((area) => (
										<TableRow key={area.id}>
											<TableCell className="font-medium text-cacao">
												{area.name}
											</TableCell>
											<TableCell className="font-mono text-xs text-taupe">
												{area.slug}
											</TableCell>
											<TableCell>{area.city}</TableCell>
											<TableCell>{area.emirate}</TableCell>
											<TableCell className="text-right text-taupe tabular-nums">
												{area.sort_order ?? 0}
											</TableCell>
											<TableCell>
												<Switch
													checked={area.is_active}
													onCheckedChange={(v) => toggleActive(area, v)}
													aria-label={`${area.is_active ? "Deactivate" : "Activate"} ${area.name}`}
												/>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 justify-end">
													<button
														type="button"
														className="p-1.5 rounded hover:bg-pearl/100 text-taupe hover:text-cacao"
														onClick={() => openEdit(area)}
														aria-label={`Edit ${area.name}`}
														title="Edit area"
													>
														<Pencil size={15} />
													</button>
													<button
														type="button"
														className="p-1.5 rounded hover:bg-red-50 text-taupe hover:text-red-600"
														onClick={() => handleDelete(area)}
														aria-label={`Delete ${area.name}`}
														title="Delete area"
													>
														<Trash2 size={15} />
													</button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{editingId ? "Edit Area" : "Add Area"}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{formError && (
							<div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
								{formError}
							</div>
						)}

						<div>
							<label
								htmlFor="area-name"
								className="block text-sm font-medium text-cacao mb-1"
							>
								Name *
							</label>
							<Input
								id="area-name"
								value={form.name}
								onChange={(e) => field("name", e.target.value)}
								placeholder="Dubai Marina"
							/>
						</div>

						<div>
							<label
								htmlFor="area-slug"
								className="block text-sm font-medium text-cacao mb-1"
							>
								Slug
							</label>
							<Input
								id="area-slug"
								value={form.slug}
								onChange={(e) => field("slug", e.target.value.toLowerCase())}
								placeholder="Generated from the name when left blank"
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="area-city"
									className="block text-sm font-medium text-cacao mb-1"
								>
									City *
								</label>
								<Input
									id="area-city"
									value={form.city}
									onChange={(e) => field("city", e.target.value)}
									placeholder="Dubai"
								/>
							</div>
							<div>
								<span className="block text-sm font-medium text-cacao mb-1">
									Emirate *
								</span>
								<SimpleSelect
									value={form.emirate}
									onValueChange={(v) => field("emirate", v)}
									options={EMIRATES.map((e) => ({ label: e, value: e }))}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3 items-end">
							<div>
								<label
									htmlFor="area-sort"
									className="block text-sm font-medium text-cacao mb-1"
								>
									Sort order
								</label>
								<Input
									id="area-sort"
									type="number"
									min={0}
									value={form.sort_order}
									onChange={(e) => field("sort_order", Number(e.target.value))}
								/>
							</div>
							<div className="flex items-center gap-2 text-sm text-cacao pb-2">
								<Switch
									id="area-active"
									checked={form.is_active}
									onCheckedChange={(v) => field("is_active", v)}
								/>
								<label htmlFor="area-active">Active</label>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDialogOpen(false)}
							disabled={creating || updating}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={creating || updating}>
							{creating || updating
								? "Saving..."
								: editingId
									? "Save Changes"
									: "Add Area"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
