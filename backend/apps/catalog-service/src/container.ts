import {
  AppDataSource,
  Area,
  RecentSearch,
  ServiceOffering,
  ServiceOfferingTranslation,
  Vendor,
} from "@servicehubuae/database";
import { MediaService } from "@servicehubuae/utils";
import { Elysia } from "elysia";
import { AreaService } from "./domain/area/area.service.ts";
import { CategoryCacheService } from "./domain/category/category-cache.service.ts";
import { CategoryController } from "./domain/category/category.controller.ts";
import { CategoryService } from "./domain/category/category.service.ts";
import { MediaController } from "./domain/media/media.controller.ts";
import { VendorLookupService } from "./domain/media/vendor-lookup.service.ts";
import { RecentSearchService } from "./domain/recent-search/recent-search.service.ts";
import { ServiceOfferingController } from "./domain/service-offering/service-offering.controller.ts";
import { ServiceOfferingService } from "./domain/service-offering/service-offering.service.ts";
import { enqueueServiceReindex } from "./domain/service-search/service-search-reindex.service.ts";
import { enqueueServiceSearchSync } from "./domain/service-search/service-search-sync.job.ts";
import { ServiceSearchAdapter } from "./domain/service-search/service-search.adapter.ts";
import {
  ServiceSuggestService,
  findCategoriesByName,
} from "./domain/service-search/service-suggest.service.ts";

// ─── Media ────────────────────────────────────────────────────────────
const mediaController = new MediaController(new MediaService(), new VendorLookupService());

// ─── Category ─────────────────────────────────────────────────────────
const categoryService = new CategoryService();
const categoryCacheService = new CategoryCacheService(categoryService);
const categoryController = new CategoryController(categoryService, categoryCacheService);

// ─── Areas ────────────────────────────────────────────────────────────
const areaService = new AreaService(AppDataSource.getRepository(Area), {
  findVendorIdsUsingArea: async (areaId) => {
    const rows: Array<{ vendor_id: string }> = await AppDataSource.query(
      `SELECT vendor_id FROM vendor_locations WHERE area_id = $1 AND deleted_at IS NULL
       UNION
       SELECT vendor_id FROM service_areas WHERE area_id = $1 AND deleted_at IS NULL`,
      [areaId],
    );
    return rows.map((r) => r.vendor_id);
  },
  onVendorAreasChanged: (vendorId) => enqueueServiceSearchSync({ type: "resync_vendor", vendorId }),
});

// ─── Recent Search ───────────────────────────────────────────────────
const recentSearchService = new RecentSearchService(AppDataSource.getRepository(RecentSearch));

// ─── Service Offerings + search ──────────────────────────────────────
const serviceOfferingService = new ServiceOfferingService(
  AppDataSource.getRepository(ServiceOffering),
  AppDataSource.getRepository(ServiceOfferingTranslation),
  AppDataSource.getRepository(Vendor),
);
const serviceSearchAdapter = new ServiceSearchAdapter();
const serviceOfferingController = new ServiceOfferingController(
  serviceOfferingService,
  serviceSearchAdapter,
);
const serviceSuggestService = new ServiceSuggestService({
  suggestServices: (query, limit) => serviceSearchAdapter.suggestServices(query, limit),
  findCategories: findCategoriesByName,
});

export const container = new Elysia({ name: "catalog-service-container" })
  .decorate("mediaController", mediaController)
  .decorate("categoryController", categoryController)
  .decorate("areaService", areaService)
  .decorate("recentSearchService", recentSearchService)
  .decorate("serviceOfferingController", serviceOfferingController)
  .decorate("serviceSuggestService", serviceSuggestService)
  .decorate("enqueueServiceReindex", enqueueServiceReindex);
