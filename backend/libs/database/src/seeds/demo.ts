import type { DataSource, EntityManager } from "typeorm";
import { Area } from "../entities/area.entity.ts";
import { Category } from "../entities/category.entity.ts";
import { ServiceArea } from "../entities/service-area.entity.ts";
import { ServiceOffering } from "../entities/service-offering.entity.ts";
import { StaffLocation } from "../entities/staff-location.entity.ts";
import { StaffMember } from "../entities/staff-member.entity.ts";
import { StaffService } from "../entities/staff-service.entity.ts";
import { StaffWorkingHours } from "../entities/staff-working-hours.entity.ts";
import { User } from "../entities/user.entity.ts";
import { VendorLocation } from "../entities/vendor-location.entity.ts";
import { VendorMember } from "../entities/vendor-member.entity.ts";
import { Vendor } from "../entities/vendor.entity.ts";
import {
  ServiceLocationMode,
  ServiceOfferingStatus,
  ServicePaymentMode,
} from "../enums/booking.enums.ts";
import { UserRole, UserStatus } from "../enums/user.enums.ts";
import { VendorMemberRole, VendorMemberStatus, VendorStatus } from "../enums/vendor.enums.ts";

export const DEMO_VENDOR_EMAIL = "vendor@mypickuae.com";
export const DEMO_VENDOR_SLUG = "mypickuae-demo-salon";

const BRANCH_AREA = "dubai-marina";
const HOME_VISIT_AREAS = ["dubai-marina", "jlt", "jvc", "al-barsha"];

interface DemoOffering {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  duration_minutes: number;
  price_fils: number;
  location_mode: ServiceLocationMode;
}

const DEMO_OFFERINGS: DemoOffering[] = [
  {
    slug: "haircut-demo-salon",
    name: "Haircut",
    description: "Wash, cut and blow-dry with a senior stylist.",
    categorySlug: "beauty-wellness",
    duration_minutes: 45,
    price_fils: 12000,
    location_mode: ServiceLocationMode.at_premises,
  },
  {
    slug: "manicure-demo-salon",
    name: "Classic Manicure",
    description: "Nail shaping, cuticle care and polish of your choice.",
    categorySlug: "beauty-wellness",
    duration_minutes: 60,
    price_fils: 15000,
    location_mode: ServiceLocationMode.at_premises,
  },
  {
    slug: "home-cleaning-demo-salon",
    name: "Home Cleaning (2 hours)",
    description: "Two cleaners, all supplies included. Kitchen, bathrooms, floors and dusting.",
    categorySlug: "cleaning",
    duration_minutes: 120,
    price_fils: 25000,
    location_mode: ServiceLocationMode.home_visit,
  },
  {
    slug: "ac-service-demo-salon",
    name: "AC Service",
    description: "Filter clean, coil wash and gas pressure check for up to two split units.",
    categorySlug: "home-maintenance",
    duration_minutes: 90,
    price_fils: 19900,
    location_mode: ServiceLocationMode.either,
  },
];

const DEMO_STAFF = [
  { name: "Aisha Rahman", bio: "Senior stylist and nail technician." },
  { name: "Omar Haddad", bio: "Home services lead: cleaning and AC maintenance." },
];

/** Sun(0)–Sat(6), 09:00–21:00 in the branch timezone (Asia/Dubai). */
const WORK_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WORK_START = "09:00:00";
const WORK_END = "21:00:00";

/**
 * Development-only demo vendor so the storefront, vendor dashboard and
 * availability have something real to show. Idempotent: every row is looked up
 * by a natural key first, so re-running changes nothing. Requires the areas
 * and categories seeds to have run. Returns a short summary, or null when
 * skipped.
 */
export async function seedDemoData(ds: DataSource): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null;

  return ds.transaction(async (m) => {
    const areaBySlug = await loadAreas(m);
    const branchArea = areaBySlug.get(BRANCH_AREA);
    if (!branchArea) throw new Error(`demo seed: area "${BRANCH_AREA}" missing — seed areas first`);

    const user = await ensureOwnerUser(m);
    const vendor = await ensureVendor(m);
    await ensureOwnerMembership(m, vendor, user);
    const branch = await ensureBranch(m, vendor, branchArea);

    for (const slug of HOME_VISIT_AREAS) {
      const area = areaBySlug.get(slug);
      if (!area) continue;
      const exists = await m.findOne(ServiceArea, {
        where: { vendor_id: vendor.id, area_id: area.id },
      });
      if (!exists) {
        await m.save(
          m.create(ServiceArea, {
            vendor_id: vendor.id,
            area_id: area.id,
            travel_buffer_minutes: 15,
          }),
        );
      }
    }

    const offerings = await ensureOfferings(m, vendor);
    await ensureStaff(m, vendor, branch, offerings);

    return `${vendor.name} (${DEMO_VENDOR_EMAIL}), ${offerings.length} published services`;
  });
}

async function loadAreas(m: EntityManager): Promise<Map<string, Area>> {
  const areas = await m.find(Area);
  return new Map(areas.map((a) => [a.slug, a]));
}

async function ensureOwnerUser(m: EntityManager): Promise<User> {
  const existing = await m.findOne(User, { where: { email: DEMO_VENDOR_EMAIL } });
  if (existing) return existing;
  const password = process.env.SEED_VENDOR_PASSWORD || "Vendor@123";
  const password_hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
  // Vendors are customers with an owner vendor_members row (no "vendor" user role).
  return m.save(
    m.create(User, {
      first_name: "Demo",
      last_name: "Vendor",
      email: DEMO_VENDOR_EMAIL,
      password_hash,
      role: UserRole.customer,
      status: UserStatus.active,
      email_verified_at: new Date(),
      preferred_locale: "en",
      preferred_currency: "AED",
    }),
  );
}

async function ensureVendor(m: EntityManager): Promise<Vendor> {
  const existing = await m.findOne(Vendor, { where: { slug: DEMO_VENDOR_SLUG } });
  if (existing) return existing;
  return m.save(
    m.create(Vendor, {
      name: "MyPickUAE Demo Salon",
      slug: DEMO_VENDOR_SLUG,
      description:
        "Demo vendor for local development: salon services plus home cleaning and AC care.",
      status: VendorStatus.approved,
      verified_at: new Date(),
      business_name: "MyPickUAE Demo Salon LLC",
      business_type: "salon",
      contact_email: DEMO_VENDOR_EMAIL,
      contact_phone: "+971500000001",
      address: { line1: "Marina Walk", area: "Dubai Marina", city: "Dubai", country: "AE" },
      // Trusted so the vendor's own publish requests skip admin review.
      services_trusted: true,
    }),
  );
}

async function ensureOwnerMembership(m: EntityManager, vendor: Vendor, user: User): Promise<void> {
  const existing = await m.findOne(VendorMember, {
    where: { vendor_id: vendor.id, user_id: user.id },
  });
  if (existing) return;
  await m.save(
    m.create(VendorMember, {
      vendor_id: vendor.id,
      user_id: user.id,
      email: user.email.toLowerCase(),
      role: VendorMemberRole.owner,
      status: VendorMemberStatus.active,
      accepted_at: new Date(),
    }),
  );
}

async function ensureBranch(m: EntityManager, vendor: Vendor, area: Area): Promise<VendorLocation> {
  const existing = await m.findOne(VendorLocation, {
    where: { vendor_id: vendor.id, area_id: area.id },
  });
  if (existing) return existing;
  return m.save(
    m.create(VendorLocation, {
      vendor_id: vendor.id,
      name: "Dubai Marina",
      address: {
        line1: "Marina Walk, Shop 12",
        area: "Dubai Marina",
        city: "Dubai",
        country: "AE",
      },
      lat: 25.0805,
      lng: 55.1403,
      area_id: area.id,
      timezone: "Asia/Dubai",
      is_active: true,
    }),
  );
}

async function ensureOfferings(m: EntityManager, vendor: Vendor): Promise<ServiceOffering[]> {
  const categories = await m.find(Category);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const out: ServiceOffering[] = [];
  for (const o of DEMO_OFFERINGS) {
    const existing = await m.findOne(ServiceOffering, { where: { slug: o.slug } });
    if (existing) {
      out.push(existing);
      continue;
    }
    out.push(
      await m.save(
        m.create(ServiceOffering, {
          vendor_id: vendor.id,
          category_id: categoryBySlug.get(o.categorySlug)?.id ?? null,
          slug: o.slug,
          name: o.name,
          description: o.description,
          duration_minutes: o.duration_minutes,
          price_fils: o.price_fils,
          location_mode: o.location_mode,
          payment_mode: ServicePaymentMode.pay_at_venue,
          slot_step_minutes: 15,
          min_notice_minutes: 60,
          max_advance_days: 60,
          status: ServiceOfferingStatus.published,
          reviewed_at: new Date(),
          auto_approve: true,
        }),
      ),
    );
  }
  return out;
}

async function ensureStaff(
  m: EntityManager,
  vendor: Vendor,
  branch: VendorLocation,
  offerings: ServiceOffering[],
): Promise<void> {
  for (const s of DEMO_STAFF) {
    let staff = await m.findOne(StaffMember, { where: { vendor_id: vendor.id, name: s.name } });
    if (!staff) {
      staff = await m.save(
        m.create(StaffMember, { vendor_id: vendor.id, name: s.name, bio: s.bio, is_active: true }),
      );
    }
    const staffId = staff.id;

    // Premises bookings only consider staff assigned to the branch.
    const atBranch = await m.findOne(StaffLocation, {
      where: { staff_member_id: staffId, vendor_location_id: branch.id },
    });
    if (!atBranch) {
      await m.save(
        m.create(StaffLocation, { staff_member_id: staffId, vendor_location_id: branch.id }),
      );
    }

    for (const offering of offerings) {
      const linked = await m.findOne(StaffService, {
        where: { staff_member_id: staffId, service_offering_id: offering.id },
      });
      if (!linked) {
        await m.save(
          m.create(StaffService, { staff_member_id: staffId, service_offering_id: offering.id }),
        );
      }
    }

    // location_id NULL = a vendor-wide shift that applies at the branch AND to
    // home visits (availability treats null-location rules as everywhere).
    const hours = await m.find(StaffWorkingHours, { where: { staff_member_id: staffId } });
    const haveDays = new Set(hours.map((h) => h.day_of_week));
    const missing = WORK_DAYS.filter((d) => !haveDays.has(d));
    if (missing.length > 0) {
      await m.save(
        missing.map((day_of_week) =>
          m.create(StaffWorkingHours, {
            staff_member_id: staffId,
            location_id: null,
            day_of_week,
            start_time: WORK_START,
            end_time: WORK_END,
          }),
        ),
      );
    }
  }
}
