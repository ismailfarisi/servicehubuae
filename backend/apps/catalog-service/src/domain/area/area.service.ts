import type { Area } from "@servicehubuae/database";
import type { CreateAreaBody, UpdateAreaBody } from "@servicehubuae/dto";
import { ConflictError, NotFoundError } from "@servicehubuae/plugins";
import type { Repository } from "typeorm";
import { slugify } from "../../lib/slug.ts";

export type PublicArea = Pick<
  Area,
  "id" | "name" | "slug" | "city" | "emirate" | "country_code" | "is_active" | "sort_order"
>;

export interface AreaServiceDeps {
  /**
   * Vendors whose branches or home-visit coverage point at this area. Their
   * search documents embed the area's name/slug, so a rename, deactivation or
   * delete must re-index them.
   */
  findVendorIdsUsingArea: (areaId: string) => Promise<string[]>;
  onVendorAreasChanged: (vendorId: string) => Promise<void>;
}

function toPublic(a: Area): PublicArea {
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    city: a.city,
    emirate: a.emirate,
    country_code: a.country_code,
    is_active: a.is_active,
    sort_order: a.sort_order,
  };
}

export class AreaService {
  constructor(
    private readonly repo: Repository<Area>,
    private readonly deps: AreaServiceDeps,
  ) {}

  /** Storefront list: active areas only, sorted for pickers. */
  async listPublic(): Promise<PublicArea[]> {
    const rows = await this.repo.find({
      where: { is_active: true },
      order: { sort_order: "ASC", name: "ASC" },
    });
    return rows.map(toPublic);
  }

  /** Admin list: includes inactive areas (soft-deleted ones stay hidden). */
  async listAdmin(): Promise<Area[]> {
    return this.repo.find({ order: { sort_order: "ASC", name: "ASC" } });
  }

  async create(body: CreateAreaBody): Promise<Area> {
    const slug = body.slug ?? slugify(body.name);
    await this.assertSlugFree(slug);
    const area = this.repo.create({
      name: body.name.trim(),
      slug,
      city: body.city.trim(),
      emirate: body.emirate,
      country_code: (body.country_code ?? "AE").toUpperCase(),
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    });
    return this.repo.save(area);
  }

  async update(id: string, body: UpdateAreaBody): Promise<Area> {
    const area = await this.repo.findOne({ where: { id } });
    if (!area) throw new NotFoundError("Area not found");

    if (body.slug && body.slug !== area.slug) await this.assertSlugFree(body.slug, id);

    const searchVisibleChange =
      (body.name !== undefined && body.name.trim() !== area.name) ||
      (body.slug !== undefined && body.slug !== area.slug) ||
      (body.is_active !== undefined && body.is_active !== area.is_active);

    if (body.name !== undefined) area.name = body.name.trim();
    if (body.slug !== undefined) area.slug = body.slug;
    if (body.city !== undefined) area.city = body.city.trim();
    if (body.emirate !== undefined) area.emirate = body.emirate;
    if (body.country_code !== undefined) area.country_code = body.country_code.toUpperCase();
    if (body.is_active !== undefined) area.is_active = body.is_active;
    if (body.sort_order !== undefined) area.sort_order = body.sort_order;

    const saved = await this.repo.save(area);
    if (searchVisibleChange) await this.resyncVendors(id);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const area = await this.repo.findOne({ where: { id } });
    if (!area) throw new NotFoundError("Area not found");
    await this.repo.softRemove(area);
    await this.resyncVendors(id);
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictError(`An area with slug "${slug}" already exists`);
    }
  }

  private async resyncVendors(areaId: string): Promise<void> {
    const vendorIds = await this.deps.findVendorIdsUsingArea(areaId);
    for (const vendorId of vendorIds) await this.deps.onVendorAreasChanged(vendorId);
  }
}
