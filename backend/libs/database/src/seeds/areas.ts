import type { DataSource } from "typeorm";
import { Area } from "../entities/area.entity.ts";

export interface AreaSeed {
  name: string;
  slug: string;
  city: string;
  emirate: string;
}

/**
 * Well-known UAE localities across all seven emirates, in picker order
 * (sort_order follows array position). Slugs are what search URLs use
 * (`/services?area=dubai-marina`), so treat them as stable.
 */
export const UAE_AREAS: AreaSeed[] = [
  // Dubai
  { name: "Dubai Marina", slug: "dubai-marina", city: "Dubai", emirate: "Dubai" },
  { name: "Jumeirah Lake Towers (JLT)", slug: "jlt", city: "Dubai", emirate: "Dubai" },
  { name: "Downtown Dubai", slug: "downtown-dubai", city: "Dubai", emirate: "Dubai" },
  { name: "Business Bay", slug: "business-bay", city: "Dubai", emirate: "Dubai" },
  { name: "Jumeirah", slug: "jumeirah", city: "Dubai", emirate: "Dubai" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah", city: "Dubai", emirate: "Dubai" },
  { name: "Al Barsha", slug: "al-barsha", city: "Dubai", emirate: "Dubai" },
  { name: "Jumeirah Village Circle (JVC)", slug: "jvc", city: "Dubai", emirate: "Dubai" },
  { name: "Deira", slug: "deira", city: "Dubai", emirate: "Dubai" },
  { name: "Bur Dubai", slug: "bur-dubai", city: "Dubai", emirate: "Dubai" },
  { name: "Al Karama", slug: "al-karama", city: "Dubai", emirate: "Dubai" },
  { name: "Mirdif", slug: "mirdif", city: "Dubai", emirate: "Dubai" },
  { name: "Dubai Silicon Oasis", slug: "dubai-silicon-oasis", city: "Dubai", emirate: "Dubai" },
  { name: "Arabian Ranches", slug: "arabian-ranches", city: "Dubai", emirate: "Dubai" },
  { name: "Umm Suqeim", slug: "umm-suqeim", city: "Dubai", emirate: "Dubai" },
  { name: "Al Qusais", slug: "al-qusais", city: "Dubai", emirate: "Dubai" },
  { name: "Dubai Sports City", slug: "dubai-sports-city", city: "Dubai", emirate: "Dubai" },
  { name: "Motor City", slug: "motor-city", city: "Dubai", emirate: "Dubai" },
  { name: "Discovery Gardens", slug: "discovery-gardens", city: "Dubai", emirate: "Dubai" },
  { name: "International City", slug: "international-city", city: "Dubai", emirate: "Dubai" },
  // Abu Dhabi
  { name: "Al Reem Island", slug: "al-reem-island", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Khalifa City", slug: "khalifa-city", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Al Khalidiyah", slug: "al-khalidiyah", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Yas Island", slug: "yas-island", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Saadiyat Island", slug: "saadiyat-island", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Al Raha Beach", slug: "al-raha-beach", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  {
    name: "Mohammed Bin Zayed City",
    slug: "mohammed-bin-zayed-city",
    city: "Abu Dhabi",
    emirate: "Abu Dhabi",
  },
  { name: "Al Mushrif", slug: "al-mushrif", city: "Abu Dhabi", emirate: "Abu Dhabi" },
  { name: "Al Ain", slug: "al-ain", city: "Al Ain", emirate: "Abu Dhabi" },
  // Sharjah
  { name: "Al Majaz", slug: "al-majaz", city: "Sharjah", emirate: "Sharjah" },
  { name: "Al Nahda (Sharjah)", slug: "al-nahda-sharjah", city: "Sharjah", emirate: "Sharjah" },
  { name: "Muwaileh", slug: "muwaileh", city: "Sharjah", emirate: "Sharjah" },
  { name: "Al Khan", slug: "al-khan", city: "Sharjah", emirate: "Sharjah" },
  { name: "Al Taawun", slug: "al-taawun", city: "Sharjah", emirate: "Sharjah" },
  // Ajman
  { name: "Al Nuaimiya", slug: "ajman-al-nuaimiya", city: "Ajman", emirate: "Ajman" },
  { name: "Al Jurf", slug: "ajman-al-jurf", city: "Ajman", emirate: "Ajman" },
  // Ras Al Khaimah
  { name: "Al Hamra", slug: "rak-al-hamra", city: "Ras Al Khaimah", emirate: "Ras Al Khaimah" },
  { name: "Al Nakheel", slug: "rak-al-nakheel", city: "Ras Al Khaimah", emirate: "Ras Al Khaimah" },
  // Umm Al Quwain
  {
    name: "Umm Al Quwain City",
    slug: "umm-al-quwain",
    city: "Umm Al Quwain",
    emirate: "Umm Al Quwain",
  },
  // Fujairah
  { name: "Fujairah City", slug: "fujairah-city", city: "Fujairah", emirate: "Fujairah" },
  { name: "Dibba Al Fujairah", slug: "dibba-al-fujairah", city: "Dibba", emirate: "Fujairah" },
];

/**
 * Idempotent: inserts only the slugs that are missing (soft-deleted rows count
 * as present, so an admin's delete is not undone by a re-seed). Returns the
 * number of rows inserted.
 */
export async function seedAreas(ds: DataSource): Promise<number> {
  const repo = ds.getRepository(Area);
  const existing = await repo.find({ select: ["slug"], withDeleted: true });
  const have = new Set(existing.map((a) => a.slug));
  const missing = UAE_AREAS.map((a, i) => ({ ...a, sort_order: i + 1 })).filter(
    (a) => !have.has(a.slug),
  );
  if (missing.length === 0) return 0;
  await repo.save(missing.map((a) => repo.create({ ...a, country_code: "AE", is_active: true })));
  return missing.length;
}
