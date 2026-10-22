"use client";

import type { AxiosInstance } from "axios";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { createContext, useContext, useEffect } from "react";
import type { MediaAssetType, S3UploadClient } from "../../hooks/use-s3-upload";
import { S3ImageUploadField } from "../forms/s3-image-upload-field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SimpleSelect } from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SectionConfigEditorProps {
	apiClient: AxiosInstance;
	sectionTypeName: string;
	sourceMode: string;
	settings: Record<string, unknown>;
	blocks: unknown[];
	dataSource: Record<string, unknown>;
	bidConfig: Record<string, unknown>;
	s3Client?: S3UploadClient;
	vendorId?: string;
	onSettingsChange: (settings: Record<string, unknown>) => void;
	onBlocksChange: (blocks: unknown[]) => void;
	onDataSourceChange: (dataSource: Record<string, unknown>) => void;
	onBidConfigChange: (bidConfig: Record<string, unknown>) => void;
}

// Context lets the deeply nested image fields read the upload client without
// each editor accepting it as an explicit prop. Keeps the per-section editor
// signatures the same as before.
interface UploadCtx {
	client?: S3UploadClient;
	vendorId?: string;
}
const UploadContext = createContext<UploadCtx>({});

function ImageField({
	label,
	value,
	onChange,
	assetType = "banner_image",
	placeholder = "https://...",
}: {
	label: string;
	value: string;
	onChange: (url: string) => void;
	assetType?: Exclude<MediaAssetType, "product_image" | "kyc_document" | "kyc_application_document">;
	placeholder?: string;
}) {
	const { client, vendorId } = useContext(UploadContext);
	if (client) {
		return (
			<S3ImageUploadField
				assetType={assetType}
				value={value || null}
				onChange={(url) => onChange(url ?? "")}
				client={client}
				vendorId={vendorId}
				label={label}
			/>
		);
	}
	return (
		<FieldItem label={label}>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-9 text-sm"
			/>
			<ImagePreview url={value} />
		</FieldItem>
	);
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
	return <div className="space-y-3">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs font-semibold text-taupe uppercase tracking-wide">
			{children}
		</p>
	);
}

function FieldRow({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function FieldItem({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<Label className="text-xs text-taupe">{label}</Label>
			{children}
		</div>
	);
}

function SwitchField({
	label,
	checked,
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	onCheckedChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between py-1">
			<Label className="text-sm text-cacao">{label}</Label>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}

function ImagePreview({ url }: { url: string }) {
	if (!url) return null;
	return (
		<img
			src={url}
			alt="preview"
			className="w-16 h-16 object-cover rounded border border-gray-200 mt-1"
			onError={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = "none";
			}}
		/>
	);
}

function AddButton({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-taupe hover:border-blue-300 hover:text-amber hover:bg-blue-50/50 transition-colors"
		>
			<Plus size={14} />
			{label}
		</button>
	);
}

function BlockCard({
	index,
	onRemove,
	showRemove = true,
	onMoveUp,
	onMoveDown,
	children,
}: {
	index: number;
	onRemove: () => void;
	showRemove?: boolean;
	/** Optional reorder controls. Pass both to render up/down buttons; an
	 * undefined handler renders that button disabled (first / last row). */
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	children: React.ReactNode;
}) {
	const showMove = onMoveUp !== undefined || onMoveDown !== undefined;
	return (
		<div className="rounded-lg border border-gray-200 bg-linen overflow-hidden">
			<div className="flex items-center justify-between px-3 py-2 bg-pearl/50 border-b border-gray-100">
				<span className="text-xs font-semibold text-taupe uppercase tracking-wide">
					Item {index + 1}
				</span>
				<div className="flex items-center gap-1">
					{showMove && (
						<>
							<button
								type="button"
								onClick={onMoveUp}
								disabled={!onMoveUp}
								className="inline-flex items-center px-1.5 py-1 rounded text-taupe hover:text-cacao hover:bg-pearl disabled:opacity-40 disabled:pointer-events-none transition-colors"
								aria-label="Move up"
								title="Move up"
							>
								<ArrowUp size={14} />
							</button>
							<button
								type="button"
								onClick={onMoveDown}
								disabled={!onMoveDown}
								className="inline-flex items-center px-1.5 py-1 rounded text-taupe hover:text-cacao hover:bg-pearl disabled:opacity-40 disabled:pointer-events-none transition-colors"
								aria-label="Move down"
								title="Move down"
							>
								<ArrowDown size={14} />
							</button>
						</>
					)}
					{showRemove && (
						<button
							type="button"
							onClick={onRemove}
							className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-taupe hover:text-red-600 hover:bg-red-50 transition-colors"
							aria-label="Remove"
							title="Remove item"
						>
							<Trash2 size={14} />
							<span>Remove</span>
						</button>
					)}
				</div>
			</div>
			<div className="p-3 space-y-3">{children}</div>
		</div>
	);
}

// ─── Bid Config (shared between service_carousel and vendor_showcase) ────────

function BidConfigEditor({
	bidConfig,
	onBidConfigChange,
}: {
	bidConfig: Record<string, unknown>;
	onBidConfigChange: (v: Record<string, unknown>) => void;
}) {
	function set(key: string, value: unknown) {
		onBidConfigChange({ ...bidConfig, [key]: value });
	}

	const fallbackQuery =
		(bidConfig.fallback_query as Record<string, unknown>) ?? {};
	const fallbackQueryInner =
		(fallbackQuery.query as Record<string, unknown>) ?? {};

	function setFallbackType(value: string) {
		onBidConfigChange({
			...bidConfig,
			fallback_query: { ...fallbackQuery, type: value },
		});
	}

	function setFallbackLimit(value: number) {
		onBidConfigChange({
			...bidConfig,
			fallback_query: {
				...fallbackQuery,
				query: { ...fallbackQueryInner, limit: value },
			},
		});
	}

	return (
		<FieldGroup>
			<SectionLabel>Bid Configuration</SectionLabel>
			<FieldRow>
				<FieldItem label="Slots">
					<Input
						type="number"
						min={1}
						value={(bidConfig.slots as number) ?? ""}
						onChange={(e) => set("slots", Number(e.target.value))}
						className="h-9 text-sm"
					/>
				</FieldItem>
				<FieldItem label="Min Bid (fils)">
					<Input
						type="number"
						min={0}
						value={(bidConfig.min_bid_fils as number) ?? ""}
						onChange={(e) => set("min_bid_fils", Number(e.target.value))}
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>
			<FieldItem label="Ranking">
				<SimpleSelect
					value={(bidConfig.ranking as string) ?? "bid_amount"}
					onValueChange={(v) => set("ranking", v)}
					options={[{ label: "Bid Amount", value: "bid_amount" }]}
				/>
			</FieldItem>
			<Separator />
			<SectionLabel>Fallback Query</SectionLabel>
			<FieldRow>
				<FieldItem label="Type">
					<SimpleSelect
						value={(fallbackQuery.type as string) ?? "services"}
						onValueChange={(v) => setFallbackType(v)}
						options={[
							{ label: "Services", value: "services" },
							{ label: "Vendors", value: "vendors" },
						]}
					/>
				</FieldItem>
				<FieldItem label="Limit">
					<Input
						type="number"
						min={1}
						value={(fallbackQueryInner.limit as number) ?? ""}
						onChange={(e) => setFallbackLimit(Number(e.target.value))}
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>
		</FieldGroup>
	);
}

// ─── Banner / Editorial block (shared shape) ─────────────────────────────────

function BannerBlockEditor({
	block,
	index,
	onChange,
	onRemove,
	showRemove,
	showSubtitle = false,
}: {
	block: Record<string, unknown>;
	index: number;
	onChange: (v: Record<string, unknown>) => void;
	onRemove: () => void;
	showRemove: boolean;
	/** promotional_banner only: optional data.subtitle {en,ar}. */
	showSubtitle?: boolean;
}) {
	// All content lives under block.data
	const data = (block.data as Record<string, unknown>) ?? {};
	const image = (data.image as Record<string, unknown>) ?? {};
	const desktop = (image.desktop as Record<string, unknown>) ?? {};
	const mobile = (image.mobile as Record<string, unknown>) ?? {};
	const focalPoint = (image.focal_point as Record<string, unknown>) ?? {};
	const alt = (image.alt as Record<string, unknown>) ?? {};
	const title = (data.title as Record<string, unknown>) ?? {};
	const ctaText = (data.cta_text as Record<string, unknown>) ?? {};

	function setData(key: string, value: unknown) {
		onChange({ ...block, data: { ...data, [key]: value } });
	}

	function setImageField(key: string, value: unknown) {
		onChange({
			...block,
			data: { ...data, image: { ...image, [key]: value } },
		});
	}

	function setDesktopUrl(url: string) {
		onChange({
			...block,
			data: {
				...data,
				image: { ...image, desktop: { ...desktop, url } },
			},
		});
	}

	function setMobileUrl(url: string) {
		onChange({
			...block,
			data: {
				...data,
				image: { ...image, mobile: { ...mobile, url } },
			},
		});
	}

	function setFocalPoint(axis: "x" | "y", value: number) {
		setImageField("focal_point", { ...focalPoint, [axis]: value });
	}

	function setAlt(lang: string, value: string) {
		setImageField("alt", { ...alt, [lang]: value });
	}

	function setTitle(lang: string, value: string) {
		setData("title", { ...title, [lang]: value });
	}

	function setCtaText(lang: string, value: string) {
		setData("cta_text", { ...ctaText, [lang]: value });
	}

	return (
		<BlockCard index={index} onRemove={onRemove} showRemove={showRemove}>
			{!showRemove && (
				<p className="text-xs text-taupe italic">Single banner block</p>
			)}

			<SectionLabel>Images</SectionLabel>
			<ImageField
				label="Desktop image"
				value={(desktop.url as string) ?? ""}
				onChange={setDesktopUrl}
			/>
			<ImageField
				label="Mobile image (optional)"
				value={(mobile.url as string) ?? ""}
				onChange={setMobileUrl}
			/>

			<Separator />
			<SectionLabel>Focal Point</SectionLabel>
			<FieldRow>
				<FieldItem label="X (0–1)">
					<Input
						type="number"
						step={0.01}
						min={0}
						max={1}
						value={(focalPoint.x as number) ?? ""}
						onChange={(e) =>
							setFocalPoint("x", Number.parseFloat(e.target.value))
						}
						className="h-9 text-sm"
					/>
				</FieldItem>
				<FieldItem label="Y (0–1)">
					<Input
						type="number"
						step={0.01}
						min={0}
						max={1}
						value={(focalPoint.y as number) ?? ""}
						onChange={(e) =>
							setFocalPoint("y", Number.parseFloat(e.target.value))
						}
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>

			<Separator />
			<SectionLabel>Alt Text</SectionLabel>
			<FieldRow>
				<FieldItem label="EN">
					<Input
						value={(alt.en as string) ?? ""}
						onChange={(e) => setAlt("en", e.target.value)}
						className="h-9 text-sm"
					/>
				</FieldItem>
				<FieldItem label="AR">
					<Input
						value={(alt.ar as string) ?? ""}
						onChange={(e) => setAlt("ar", e.target.value)}
						dir="rtl"
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>

			<Separator />
			<SectionLabel>Title</SectionLabel>
			<FieldRow>
				<FieldItem label="EN">
					<Input
						value={(title.en as string) ?? ""}
						onChange={(e) => setTitle("en", e.target.value)}
						className="h-9 text-sm"
					/>
				</FieldItem>
				<FieldItem label="AR">
					<Input
						value={(title.ar as string) ?? ""}
						onChange={(e) => setTitle("ar", e.target.value)}
						dir="rtl"
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>

			{showSubtitle && (
				<>
					<Separator />
					<SectionLabel>Subtitle (optional)</SectionLabel>
					<LocalizedField
						label="Subtitle"
						value={data.subtitle}
						onChange={(v) => setData("subtitle", v)}
					/>
				</>
			)}

			<Separator />
			<SectionLabel>CTA</SectionLabel>
			<FieldRow>
				<FieldItem label="Text EN">
					<Input
						value={(ctaText.en as string) ?? ""}
						onChange={(e) => setCtaText("en", e.target.value)}
						className="h-9 text-sm"
					/>
				</FieldItem>
				<FieldItem label="Text AR">
					<Input
						value={(ctaText.ar as string) ?? ""}
						onChange={(e) => setCtaText("ar", e.target.value)}
						dir="rtl"
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldRow>
			<FieldItem label="CTA Link">
				<Input
					value={(data.cta_link as string) ?? ""}
					onChange={(e) => setData("cta_link", e.target.value)}
					placeholder="/services/..."
					className="h-9 text-sm"
				/>
			</FieldItem>
		</BlockCard>
	);
}

// ─── 1. hero_carousel ────────────────────────────────────────────────────────

function HeroCarouselEditor({
	settings,
	blocks,
	onSettingsChange,
	onBlocksChange,
}: Pick<
	SectionConfigEditorProps,
	"settings" | "blocks" | "onSettingsChange" | "onBlocksChange"
>) {
	const slides = blocks as Record<string, unknown>[];

	function addSlide() {
		onBlocksChange([
			...slides,
			{
				id: `slide-${Date.now()}`,
				type: "slide",
				data: {
					image: {
						desktop: { url: "", width: 1920, height: 640 },
						mobile: { url: "", width: 1080, height: 1350 },
						focal_point: { x: 0.5, y: 0.5 },
						alt: { en: "", ar: "" },
					},
					title: { en: "", ar: "" },
					cta_text: { en: "", ar: "" },
					cta_link: "",
				},
			},
		]);
	}

	function updateSlide(index: number, slide: Record<string, unknown>) {
		const next = [...slides];
		next[index] = slide;
		onBlocksChange(next);
	}

	function removeSlide(index: number) {
		onBlocksChange(slides.filter((_, i) => i !== index));
	}

	return (
		<div className="space-y-5">
			{/* Settings */}
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<SwitchField
					label="Autoplay"
					checked={Boolean(settings.autoplay)}
					onCheckedChange={(v) =>
						onSettingsChange({ ...settings, autoplay: v })
					}
				/>
				<FieldItem label="Slide Duration (ms)">
					<Input
						type="number"
						min={500}
						step={100}
						value={(settings.interval_ms as number) ?? ""}
						onChange={(e) =>
							onSettingsChange({
								...settings,
								interval_ms: Number(e.target.value),
							})
						}
						className="h-9 text-sm"
					/>
				</FieldItem>
			</FieldGroup>

			<Separator />

			{/* Slides */}
			<FieldGroup>
				<SectionLabel>Slides ({slides.length})</SectionLabel>
				<div className="space-y-3">
					{slides.map((slide, i) => (
						<BannerBlockEditor
							key={((slide as Record<string, unknown>).id as string) ?? i}
							block={slide}
							index={i}
							onChange={(v) => updateSlide(i, v)}
							onRemove={() => removeSlide(i)}
							showRemove
						/>
					))}
				</div>
				<AddButton label="Add Slide" onClick={addSlide} />
			</FieldGroup>
		</div>
	);
}

// ─── 2. category_grid ────────────────────────────────────────────────────────

function CategoryGridEditor({
	settings,
	blocks,
	onSettingsChange,
	onBlocksChange,
}: Pick<
	SectionConfigEditorProps,
	"settings" | "blocks" | "onSettingsChange" | "onBlocksChange"
>) {
	const categories = blocks as Record<string, unknown>[];

	function addCategory() {
		onBlocksChange([
			...categories,
			{
				id: `cat-${Date.now()}`,
				type: "category_card",
				data: { name: { en: "", ar: "" }, image_url: "", link: "" },
			},
		]);
	}

	function updateCategory(index: number, cat: Record<string, unknown>) {
		const next = [...categories];
		next[index] = cat;
		onBlocksChange(next);
	}

	function removeCategory(index: number) {
		onBlocksChange(categories.filter((_, i) => i !== index));
	}

	const title = (settings.title as Record<string, unknown>) ?? {};
	const columns = (settings.columns as Record<string, unknown>) ?? {};

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<FieldRow>
					<FieldItem label="Title EN">
						<Input
							value={(title.en as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, en: e.target.value },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Title AR">
						<Input
							value={(title.ar as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, ar: e.target.value },
								})
							}
							dir="rtl"
							className="h-9 text-sm"
						/>
					</FieldItem>
				</FieldRow>
				<SectionLabel>Columns</SectionLabel>
				<div className="grid grid-cols-3 gap-3">
					<FieldItem label="Desktop">
						<Input
							type="number"
							min={1}
							max={12}
							value={(columns.desktop as number) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									columns: { ...columns, desktop: Number(e.target.value) },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Tablet">
						<Input
							type="number"
							min={1}
							max={8}
							value={(columns.tablet as number) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									columns: { ...columns, tablet: Number(e.target.value) },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Mobile">
						<Input
							type="number"
							min={1}
							max={4}
							value={(columns.mobile as number) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									columns: { ...columns, mobile: Number(e.target.value) },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
				</div>
			</FieldGroup>

			<Separator />

			<FieldGroup>
				<SectionLabel>Categories ({categories.length})</SectionLabel>
				<div className="space-y-3">
					{categories.map((cat, i) => {
						const catData = (cat.data as Record<string, unknown>) ?? {};
						const name = (catData.name as Record<string, unknown>) ?? {};
						function setCatData(key: string, value: unknown) {
							updateCategory(i, { ...cat, data: { ...catData, [key]: value } });
						}
						return (
							<BlockCard
								key={((cat as Record<string, unknown>).id as string) ?? i}
								index={i}
								onRemove={() => removeCategory(i)}
							>
								<FieldRow>
									<FieldItem label="Name EN">
										<Input
											value={(name.en as string) ?? ""}
											onChange={(e) =>
												setCatData("name", { ...name, en: e.target.value })
											}
											className="h-9 text-sm"
										/>
									</FieldItem>
									<FieldItem label="Name AR">
										<Input
											value={(name.ar as string) ?? ""}
											onChange={(e) =>
												setCatData("name", { ...name, ar: e.target.value })
											}
											dir="rtl"
											className="h-9 text-sm"
										/>
									</FieldItem>
								</FieldRow>
								<ImageField
									label="Image"
									value={(catData.image_url as string) ?? ""}
									onChange={(url) => setCatData("image_url", url)}
								/>
								<FieldItem label="Link">
									<Input
										value={(catData.link as string) ?? ""}
										onChange={(e) => setCatData("link", e.target.value)}
										placeholder="/category/..."
										className="h-9 text-sm"
									/>
								</FieldItem>
							</BlockCard>
						);
					})}
				</div>
				<AddButton label="Add Category" onClick={addCategory} />
			</FieldGroup>
		</div>
	);
}

// ─── 3. service_carousel (product_carousel is the pre-fork alias) ────────────

function ServiceCarouselEditor({
	settings,
	dataSource,
	bidConfig,
	sourceMode,
	onSettingsChange,
	onDataSourceChange,
	onBidConfigChange,
}: Pick<
	SectionConfigEditorProps,
	| "settings"
	| "dataSource"
	| "bidConfig"
	| "sourceMode"
	| "onSettingsChange"
	| "onDataSourceChange"
	| "onBidConfigChange"
>) {
	const title = (settings.title as Record<string, unknown>) ?? {};

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<FieldRow>
					<FieldItem label="Title EN">
						<Input
							value={(title.en as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, en: e.target.value },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Title AR">
						<Input
							value={(title.ar as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, ar: e.target.value },
								})
							}
							dir="rtl"
							className="h-9 text-sm"
						/>
					</FieldItem>
				</FieldRow>
				<SwitchField
					label="Show Price"
					checked={Boolean(settings.show_price)}
					onCheckedChange={(v) =>
						onSettingsChange({ ...settings, show_price: v })
					}
				/>
				<SwitchField
					label="Show Rating"
					checked={Boolean(settings.show_rating)}
					onCheckedChange={(v) =>
						onSettingsChange({ ...settings, show_rating: v })
					}
				/>
			</FieldGroup>

			<Separator />

			{sourceMode === "query" && (
				<FieldGroup>
					<SectionLabel>Data Source</SectionLabel>
					{(() => {
						const dsQuery = (dataSource.query as Record<string, unknown>) ?? {};
						function setDsQuery(key: string, value: unknown) {
							onDataSourceChange({
								...dataSource,
								type: "services",
								query: { ...dsQuery, [key]: value },
							});
						}
						return (
							<>
								<FieldRow>
									<FieldItem label="Category slug (optional)">
										<Input
											value={(dsQuery.category as string) ?? ""}
											onChange={(e) =>
												setDsQuery("category", e.target.value || undefined)
											}
											placeholder="e.g. cleaning"
											className="h-9 text-sm"
										/>
									</FieldItem>
									<FieldItem label="Sort">
										<SimpleSelect
											value={(dsQuery.sort as string) ?? "newest"}
											onValueChange={(v) => setDsQuery("sort", v)}
											options={[
												{ label: "Newest", value: "newest" },
												{ label: "Top rated", value: "rating" },
												{ label: "Price: Low to High", value: "price_asc" },
												{ label: "Price: High to Low", value: "price_desc" },
											]}
										/>
									</FieldItem>
								</FieldRow>
								<FieldItem label="Limit">
									<Input
										type="number"
										min={1}
										max={50}
										value={(dsQuery.limit as number) ?? ""}
										onChange={(e) =>
											setDsQuery("limit", Number(e.target.value))
										}
										className="h-9 text-sm"
									/>
								</FieldItem>
							</>
						);
					})()}
				</FieldGroup>
			)}

			{sourceMode === "bidded" && (
				<BidConfigEditor
					bidConfig={bidConfig}
					onBidConfigChange={onBidConfigChange}
				/>
			)}
		</div>
	);
}

// ─── 4. vendor_showcase ──────────────────────────────────────────────────────

function VendorShowcaseEditor({
	settings,
	dataSource,
	bidConfig,
	sourceMode,
	onSettingsChange,
	onDataSourceChange,
	onBidConfigChange,
}: Pick<
	SectionConfigEditorProps,
	| "settings"
	| "dataSource"
	| "bidConfig"
	| "sourceMode"
	| "onSettingsChange"
	| "onDataSourceChange"
	| "onBidConfigChange"
>) {
	const title = (settings.title as Record<string, unknown>) ?? {};

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<FieldRow>
					<FieldItem label="Title EN">
						<Input
							value={(title.en as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, en: e.target.value },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Title AR">
						<Input
							value={(title.ar as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, ar: e.target.value },
								})
							}
							dir="rtl"
							className="h-9 text-sm"
						/>
					</FieldItem>
				</FieldRow>
				<FieldItem label="Layout">
					<SimpleSelect
						value={(settings.layout as string) ?? "horizontal_scroll"}
						onValueChange={(v) => onSettingsChange({ ...settings, layout: v })}
						options={[
							{ label: "Horizontal Scroll", value: "horizontal_scroll" },
							{ label: "Grid", value: "grid" },
						]}
					/>
				</FieldItem>
			</FieldGroup>

			<Separator />

			{sourceMode === "query" && (
				<FieldGroup>
					<SectionLabel>Data Source</SectionLabel>
					{(() => {
						const dsQuery = (dataSource.query as Record<string, unknown>) ?? {};
						function setDsQuery(key: string, value: unknown) {
							onDataSourceChange({
								...dataSource,
								query: { ...dsQuery, [key]: value },
							});
						}
						return (
							<>
								<SwitchField
									label="Featured Only"
									checked={Boolean(dsQuery.featured)}
									onCheckedChange={(v) => setDsQuery("featured", v)}
								/>
								<FieldItem label="Limit">
									<Input
										type="number"
										min={1}
										value={(dsQuery.limit as number) ?? ""}
										onChange={(e) =>
											setDsQuery("limit", Number(e.target.value))
										}
										className="h-9 text-sm"
									/>
								</FieldItem>
							</>
						);
					})()}
				</FieldGroup>
			)}

			{sourceMode === "bidded" && (
				<BidConfigEditor
					bidConfig={bidConfig}
					onBidConfigChange={onBidConfigChange}
				/>
			)}
		</div>
	);
}

// ─── 5. promotional_banner ───────────────────────────────────────────────────

function PromotionalBannerEditor({
	blocks,
	onBlocksChange,
	showSubtitle = false,
}: Pick<SectionConfigEditorProps, "blocks" | "onBlocksChange"> & {
	showSubtitle?: boolean;
}) {
	const banners = blocks as Record<string, unknown>[];

	// Ensure at least one banner block exists
	const singleBanner: Record<string, unknown> = banners[0] ?? {
		id: `promo-${Date.now()}`,
		type: "banner",
		data: {
			image: {
				desktop: { url: "", width: 1920, height: 500 },
				mobile: { url: "", width: 1080, height: 600 },
				focal_point: { x: 0.5, y: 0.5 },
				alt: { en: "", ar: "" },
			},
			title: { en: "", ar: "" },
			cta_text: { en: "", ar: "" },
			cta_link: "",
		},
	};

	function updateBanner(v: Record<string, unknown>) {
		onBlocksChange([v]);
	}

	return (
		<div className="space-y-5">
			<BannerBlockEditor
				block={singleBanner}
				index={0}
				onChange={updateBanner}
				onRemove={() => {}}
				showRemove={false}
				showSubtitle={showSubtitle}
			/>
		</div>
	);
}

// ─── 6. editorial_post ───────────────────────────────────────────────────────

function EditorialPostEditor({
	blocks,
	onBlocksChange,
}: Pick<SectionConfigEditorProps, "blocks" | "onBlocksChange">) {
	// Same shape as promotional banner
	return (
		<PromotionalBannerEditor blocks={blocks} onBlocksChange={onBlocksChange} />
	);
}

// ─── 7. newsletter_signup ────────────────────────────────────────────────────

function NewsletterSignupEditor({
	settings,
	onSettingsChange,
}: Pick<SectionConfigEditorProps, "settings" | "onSettingsChange">) {
	const title = (settings.title as Record<string, unknown>) ?? {};
	const subtitle = (settings.subtitle as Record<string, unknown>) ?? {};

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<FieldRow>
					<FieldItem label="Title EN">
						<Input
							value={(title.en as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, en: e.target.value },
								})
							}
							className="h-9 text-sm"
						/>
					</FieldItem>
					<FieldItem label="Title AR">
						<Input
							value={(title.ar as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									title: { ...title, ar: e.target.value },
								})
							}
							dir="rtl"
							className="h-9 text-sm"
						/>
					</FieldItem>
				</FieldRow>

				<Separator />
				<SectionLabel>Subtitle</SectionLabel>
				<FieldRow>
					<FieldItem label="EN">
						<Textarea
							value={(subtitle.en as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									subtitle: { ...subtitle, en: e.target.value },
								})
							}
							rows={3}
							className="text-sm resize-none"
						/>
					</FieldItem>
					<FieldItem label="AR">
						<Textarea
							value={(subtitle.ar as string) ?? ""}
							onChange={(e) =>
								onSettingsChange({
									...settings,
									subtitle: { ...subtitle, ar: e.target.value },
								})
							}
							dir="rtl"
							rows={3}
							className="text-sm resize-none"
						/>
					</FieldItem>
				</FieldRow>
			</FieldGroup>
		</div>
	);
}

// ─── Helpers for the marketplace homepage sections ───────────────────────────

type Localized = { en: string; ar: string };

function asLocalized(value: unknown): Localized {
	const v = (value as Partial<Localized> | null | undefined) ?? {};
	return { en: v.en ?? "", ar: v.ar ?? "" };
}

/** EN + AR input pair for a `{ en, ar }` string, labelled "<label> EN/AR". */
function LocalizedField({
	label,
	value,
	onChange,
	multiline = false,
	placeholder,
}: {
	label: string;
	value: unknown;
	onChange: (v: Localized) => void;
	multiline?: boolean;
	placeholder?: string;
}) {
	const loc = asLocalized(value);
	return (
		<FieldRow>
			{(["en", "ar"] as const).map((lang) => (
				<FieldItem key={lang} label={`${label} ${lang.toUpperCase()}`}>
					{multiline ? (
						<Textarea
							aria-label={`${label} ${lang.toUpperCase()}`}
							value={loc[lang]}
							onChange={(e) => onChange({ ...loc, [lang]: e.target.value })}
							dir={lang === "ar" ? "rtl" : undefined}
							rows={2}
							className="text-sm resize-none"
						/>
					) : (
						<Input
							aria-label={`${label} ${lang.toUpperCase()}`}
							value={loc[lang]}
							onChange={(e) => onChange({ ...loc, [lang]: e.target.value })}
							dir={lang === "ar" ? "rtl" : undefined}
							placeholder={lang === "en" ? placeholder : undefined}
							className="h-9 text-sm"
						/>
					)}
				</FieldItem>
			))}
		</FieldRow>
	);
}

/** Eyebrow / title / subtitle settings shared by the new homepage sections. */
function SectionHeadingFields({
	settings,
	onSettingsChange,
}: Pick<SectionConfigEditorProps, "settings" | "onSettingsChange">) {
	function set(key: string, value: unknown) {
		onSettingsChange({ ...settings, [key]: value });
	}
	return (
		<>
			<LocalizedField
				label="Eyebrow"
				value={settings.eyebrow}
				onChange={(v) => set("eyebrow", v)}
			/>
			<LocalizedField
				label="Title"
				value={settings.title}
				onChange={(v) => set("title", v)}
			/>
			<LocalizedField
				label="Subtitle"
				value={settings.subtitle}
				onChange={(v) => set("subtitle", v)}
				multiline
			/>
		</>
	);
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
	if (to < 0 || to >= items.length) return items;
	const next = [...items];
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved as T);
	return next;
}

/**
 * Sections fed by the area list (service_search_hero, area_links) always use
 * data_source `{ type: "areas", query: {} }`. A freshly added section starts
 * with an empty data source, so set it once here instead of exposing config.
 */
function useAreasDataSource(
	dataSource: Record<string, unknown>,
	onDataSourceChange: (dataSource: Record<string, unknown>) => void,
) {
	const type = dataSource.type;
	useEffect(() => {
		if (type !== "areas") onDataSourceChange({ type: "areas", query: {} });
	}, [type, onDataSourceChange]);
}

function AreasSourceHint() {
	return (
		<p className="text-xs text-taupe">
			Uses Query mode — area list comes from Settings → Areas.
		</p>
	);
}

// ─── 8. service_search_hero ──────────────────────────────────────────────────

function ServiceSearchHeroEditor({
	settings,
	dataSource,
	onSettingsChange,
	onDataSourceChange,
}: Pick<
	SectionConfigEditorProps,
	"settings" | "dataSource" | "onSettingsChange" | "onDataSourceChange"
>) {
	useAreasDataSource(dataSource, onDataSourceChange);

	const popular = Array.isArray(settings.popular_searches)
		? (settings.popular_searches as Record<string, unknown>[])
		: [];

	function setPopular(next: Record<string, unknown>[]) {
		onSettingsChange({ ...settings, popular_searches: next });
	}

	function updatePopular(index: number, item: Record<string, unknown>) {
		const next = [...popular];
		next[index] = item;
		setPopular(next);
	}

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<AreasSourceHint />
				<SectionHeadingFields
					settings={settings}
					onSettingsChange={onSettingsChange}
				/>
				<LocalizedField
					label="Search placeholder"
					value={settings.search_placeholder}
					onChange={(v) =>
						onSettingsChange({ ...settings, search_placeholder: v })
					}
				/>
			</FieldGroup>

			<Separator />

			<FieldGroup>
				<SectionLabel>Popular searches ({popular.length})</SectionLabel>
				<div className="space-y-3">
					{popular.map((item, i) => (
						<BlockCard
							// biome-ignore lint/suspicious/noArrayIndexKey: popular_searches rows have no stable id
							key={i}
							index={i}
							onRemove={() => setPopular(popular.filter((_, j) => j !== i))}
							onMoveUp={
								i > 0
									? () => setPopular(moveItem(popular, i, i - 1))
									: undefined
							}
							onMoveDown={
								i < popular.length - 1
									? () => setPopular(moveItem(popular, i, i + 1))
									: undefined
							}
						>
							<LocalizedField
								label="Label"
								value={item.label}
								onChange={(v) => updatePopular(i, { ...item, label: v })}
							/>
							<FieldItem label="Search query">
								<Input
									value={(item.query as string) ?? ""}
									onChange={(e) =>
										updatePopular(i, { ...item, query: e.target.value })
									}
									placeholder="e.g. ac service"
									className="h-9 text-sm"
								/>
							</FieldItem>
						</BlockCard>
					))}
				</div>
				<AddButton
					label="Add Popular Search"
					onClick={() =>
						setPopular([...popular, { label: { en: "", ar: "" }, query: "" }])
					}
				/>
			</FieldGroup>
		</div>
	);
}

// ─── 9. feature_grid ─────────────────────────────────────────────────────────

const FEATURE_ICONS = [
	"search",
	"compare",
	"calendar",
	"check",
	"shield",
	"star",
	"tag",
	"map",
	"clock",
	"chat",
	"wallet",
	"sparkles",
] as const;

function FeatureGridEditor({
	settings,
	blocks,
	onSettingsChange,
	onBlocksChange,
}: Pick<
	SectionConfigEditorProps,
	"settings" | "blocks" | "onSettingsChange" | "onBlocksChange"
>) {
	const features = blocks as Record<string, unknown>[];

	function addFeature() {
		onBlocksChange([
			...features,
			{
				id: `feature-${Date.now()}`,
				type: "feature",
				data: {
					icon: FEATURE_ICONS[0],
					title: { en: "", ar: "" },
					text: { en: "", ar: "" },
				},
			},
		]);
	}

	function updateFeature(index: number, feature: Record<string, unknown>) {
		const next = [...features];
		next[index] = feature;
		onBlocksChange(next);
	}

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<SectionHeadingFields
					settings={settings}
					onSettingsChange={onSettingsChange}
				/>
				<FieldItem label="Variant">
					<SimpleSelect
						value={(settings.variant as string) ?? "cards"}
						onValueChange={(v) => onSettingsChange({ ...settings, variant: v })}
						options={[
							{ label: "Numbered steps", value: "steps" },
							{ label: "Icon cards", value: "cards" },
						]}
					/>
				</FieldItem>
			</FieldGroup>

			<Separator />

			<FieldGroup>
				<SectionLabel>Features ({features.length})</SectionLabel>
				<div className="space-y-3">
					{features.map((feature, i) => {
						const data = (feature.data as Record<string, unknown>) ?? {};
						function setData(key: string, value: unknown) {
							updateFeature(i, { ...feature, data: { ...data, [key]: value } });
						}
						const iconId = `feature-icon-${(feature.id as string) ?? i}`;
						return (
							<BlockCard
								key={(feature.id as string) ?? i}
								index={i}
								onRemove={() =>
									onBlocksChange(features.filter((_, j) => j !== i))
								}
								onMoveUp={
									i > 0
										? () => onBlocksChange(moveItem(features, i, i - 1))
										: undefined
								}
								onMoveDown={
									i < features.length - 1
										? () => onBlocksChange(moveItem(features, i, i + 1))
										: undefined
								}
							>
								<div className="space-y-1">
									<Label htmlFor={iconId} className="text-xs text-taupe">
										Icon
									</Label>
									<select
										id={iconId}
										value={(data.icon as string) ?? FEATURE_ICONS[0]}
										onChange={(e) => setData("icon", e.target.value)}
										className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
									>
										{FEATURE_ICONS.map((icon) => (
											<option key={icon} value={icon}>
												{icon}
											</option>
										))}
									</select>
								</div>
								<LocalizedField
									label="Title"
									value={data.title}
									onChange={(v) => setData("title", v)}
								/>
								<LocalizedField
									label="Text"
									value={data.text}
									onChange={(v) => setData("text", v)}
									multiline
								/>
							</BlockCard>
						);
					})}
				</div>
				<AddButton label="Add Feature" onClick={addFeature} />
			</FieldGroup>
		</div>
	);
}

// ─── 10. area_links ──────────────────────────────────────────────────────────

function AreaLinksEditor({
	settings,
	dataSource,
	onSettingsChange,
	onDataSourceChange,
}: Pick<
	SectionConfigEditorProps,
	"settings" | "dataSource" | "onSettingsChange" | "onDataSourceChange"
>) {
	useAreasDataSource(dataSource, onDataSourceChange);

	return (
		<div className="space-y-5">
			<FieldGroup>
				<SectionLabel>Settings</SectionLabel>
				<AreasSourceHint />
				<SectionHeadingFields
					settings={settings}
					onSettingsChange={onSettingsChange}
				/>
			</FieldGroup>
		</div>
	);
}

// ─── Fallback JSON editor ────────────────────────────────────────────────────

function FallbackJsonEditor({
	settings,
	blocks,
	dataSource,
	bidConfig,
	sourceMode,
	onSettingsChange,
	onBlocksChange,
	onDataSourceChange,
	onBidConfigChange,
}: SectionConfigEditorProps) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="fallback-settings"
					className="block text-xs font-semibold text-taupe uppercase tracking-wide mb-1"
				>
					Settings (JSON)
				</label>
				<textarea
					id="fallback-settings"
					value={JSON.stringify(settings, null, 2)}
					onChange={(e) => {
						try {
							onSettingsChange(JSON.parse(e.target.value));
						} catch {
							// ignore parse errors while typing
						}
					}}
					rows={4}
					className="w-full rounded-lg border border-gray-200 bg-linen px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			{sourceMode === "query" && (
				<div>
					<label
						htmlFor="fallback-datasource"
						className="block text-xs font-semibold text-taupe uppercase tracking-wide mb-1"
					>
						Data Source (JSON)
					</label>
					<textarea
						id="fallback-datasource"
						value={JSON.stringify(dataSource, null, 2)}
						onChange={(e) => {
							try {
								onDataSourceChange(JSON.parse(e.target.value));
							} catch {
								// ignore
							}
						}}
						rows={4}
						className="w-full rounded-lg border border-gray-200 bg-linen px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			)}
			{sourceMode === "manual" && (
				<div>
					<label
						htmlFor="fallback-blocks"
						className="block text-xs font-semibold text-taupe uppercase tracking-wide mb-1"
					>
						Blocks (JSON array)
					</label>
					<textarea
						id="fallback-blocks"
						value={JSON.stringify(blocks, null, 2)}
						onChange={(e) => {
							try {
								onBlocksChange(JSON.parse(e.target.value));
							} catch {
								// ignore
							}
						}}
						rows={4}
						className="w-full rounded-lg border border-gray-200 bg-linen px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			)}
			{sourceMode === "bidded" && (
				<div>
					<label
						htmlFor="fallback-bidconfig"
						className="block text-xs font-semibold text-taupe uppercase tracking-wide mb-1"
					>
						Bid Config (JSON)
					</label>
					<textarea
						id="fallback-bidconfig"
						value={JSON.stringify(bidConfig, null, 2)}
						onChange={(e) => {
							try {
								onBidConfigChange(JSON.parse(e.target.value));
							} catch {
								// ignore
							}
						}}
						rows={4}
						className="w-full rounded-lg border border-gray-200 bg-linen px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			)}
		</div>
	);
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function SectionConfigEditor(props: SectionConfigEditorProps) {
	const {
		apiClient,
		sectionTypeName,
		sourceMode,
		settings,
		blocks,
		dataSource,
		bidConfig,
		s3Client,
		vendorId,
		onSettingsChange,
		onBlocksChange,
		onDataSourceChange,
		onBidConfigChange,
	} = props;

	return (
		<UploadContext.Provider value={{ client: s3Client, vendorId }}>
			<SectionConfigEditorBody
				apiClient={apiClient}
				sectionTypeName={sectionTypeName}
				sourceMode={sourceMode}
				settings={settings}
				blocks={blocks}
				dataSource={dataSource}
				bidConfig={bidConfig}
				onSettingsChange={onSettingsChange}
				onBlocksChange={onBlocksChange}
				onDataSourceChange={onDataSourceChange}
				onBidConfigChange={onBidConfigChange}
			/>
		</UploadContext.Provider>
	);
}

function SectionConfigEditorBody(
	props: Omit<SectionConfigEditorProps, "s3Client" | "vendorId">,
) {
	const {
		sectionTypeName,
		sourceMode,
		settings,
		blocks,
		dataSource,
		bidConfig,
		onSettingsChange,
		onBlocksChange,
		onDataSourceChange,
		onBidConfigChange,
	} = props;

	switch (sectionTypeName) {
		case "hero_carousel":
			return (
				<HeroCarouselEditor
					settings={settings}
					blocks={blocks}
					onSettingsChange={onSettingsChange}
					onBlocksChange={onBlocksChange}
				/>
			);

		case "category_grid":
			return (
				<CategoryGridEditor
					settings={settings}
					blocks={blocks}
					onSettingsChange={onSettingsChange}
					onBlocksChange={onBlocksChange}
				/>
			);

		case "service_carousel":
		case "product_carousel":
			return (
				<ServiceCarouselEditor
					settings={settings}
					dataSource={dataSource}
					bidConfig={bidConfig}
					sourceMode={sourceMode}
					onSettingsChange={onSettingsChange}
					onDataSourceChange={onDataSourceChange}
					onBidConfigChange={onBidConfigChange}
				/>
			);

		case "vendor_showcase":
			return (
				<VendorShowcaseEditor
					settings={settings}
					dataSource={dataSource}
					bidConfig={bidConfig}
					sourceMode={sourceMode}
					onSettingsChange={onSettingsChange}
					onDataSourceChange={onDataSourceChange}
					onBidConfigChange={onBidConfigChange}
				/>
			);

		case "promotional_banner":
			return (
				<PromotionalBannerEditor
					blocks={blocks}
					onBlocksChange={onBlocksChange}
					showSubtitle
				/>
			);

		case "editorial_post":
			return (
				<EditorialPostEditor blocks={blocks} onBlocksChange={onBlocksChange} />
			);

		case "newsletter_signup":
			return (
				<NewsletterSignupEditor
					settings={settings}
					onSettingsChange={onSettingsChange}
				/>
			);

		case "service_search_hero":
			return (
				<ServiceSearchHeroEditor
					settings={settings}
					dataSource={dataSource}
					onSettingsChange={onSettingsChange}
					onDataSourceChange={onDataSourceChange}
				/>
			);

		case "feature_grid":
			return (
				<FeatureGridEditor
					settings={settings}
					blocks={blocks}
					onSettingsChange={onSettingsChange}
					onBlocksChange={onBlocksChange}
				/>
			);

		case "area_links":
			return (
				<AreaLinksEditor
					settings={settings}
					dataSource={dataSource}
					onSettingsChange={onSettingsChange}
					onDataSourceChange={onDataSourceChange}
				/>
			);

		default:
			return <FallbackJsonEditor {...props} />;
	}
}
