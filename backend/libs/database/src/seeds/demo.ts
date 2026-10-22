import type { DataSource, EntityManager } from "typeorm";
import { Area } from "../entities/area.entity.ts";
import { Booking } from "../entities/booking.entity.ts";
import { Category } from "../entities/category.entity.ts";
import { ServiceArea } from "../entities/service-area.entity.ts";
import { ServiceOffering } from "../entities/service-offering.entity.ts";
import { ServiceReview } from "../entities/service-review.entity.ts";
import { StaffEngagement } from "../entities/staff-engagement.entity.ts";
import { StaffLocation } from "../entities/staff-location.entity.ts";
import { StaffMember } from "../entities/staff-member.entity.ts";
import { StaffService } from "../entities/staff-service.entity.ts";
import { StaffWorkingHours } from "../entities/staff-working-hours.entity.ts";
import { User } from "../entities/user.entity.ts";
import { VendorLocation } from "../entities/vendor-location.entity.ts";
import { VendorMember } from "../entities/vendor-member.entity.ts";
import { Vendor } from "../entities/vendor.entity.ts";
import {
  BookingStatus,
  EngagementKind,
  EngagementStatus,
  ServiceLocationMode,
  ServiceOfferingStatus,
  ServicePaymentMode,
  ServiceReviewStatus,
} from "../enums/booking.enums.ts";
import { UserRole, UserStatus } from "../enums/user.enums.ts";
import {
  CommissionType,
  VendorMemberRole,
  VendorMemberStatus,
  VendorStatus,
} from "../enums/vendor.enums.ts";

export const DEMO_VENDOR_EMAIL = "vendor@mypickuae.com";
export const DEMO_VENDOR_SLUG = "mypickuae-demo-salon";

interface DemoOffering {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  duration_minutes: number;
  price_fils: number;
  location_mode: ServiceLocationMode;
}

interface DemoVendor {
  slug: string;
  name: string;
  email: string;
  ownerFirstName: string;
  ownerLastName: string;
  description: string;
  business_type: string;
  phone: string;
  branch: { areaSlug: string; name: string; line1: string; city: string; lat: number; lng: number };
  homeVisitAreas: string[];
  offerings: DemoOffering[];
  staff: { name: string; bio: string }[];
}

const { at_premises, home_visit, either } = ServiceLocationMode;

// Order matters: review booking numbers are derived from vendor and offering
// positions, so append new vendors/offerings at the end to keep re-runs idempotent.
const DEMO_VENDORS: DemoVendor[] = [
  {
    slug: DEMO_VENDOR_SLUG,
    name: "MyPickUAE Demo Salon",
    email: DEMO_VENDOR_EMAIL,
    ownerFirstName: "Demo",
    ownerLastName: "Vendor",
    description:
      "Demo vendor for local development: salon services plus home cleaning and AC care.",
    business_type: "salon",
    phone: "+971500000001",
    branch: {
      areaSlug: "dubai-marina",
      name: "Dubai Marina",
      line1: "Marina Walk, Shop 12",
      city: "Dubai",
      lat: 25.0805,
      lng: 55.1403,
    },
    homeVisitAreas: ["dubai-marina", "jlt", "jvc", "al-barsha"],
    offerings: [
      {
        slug: "haircut-demo-salon",
        name: "Haircut",
        description: "Wash, cut and blow-dry with a senior stylist.",
        categorySlug: "beauty-wellness",
        duration_minutes: 45,
        price_fils: 12000,
        location_mode: at_premises,
      },
      {
        slug: "manicure-demo-salon",
        name: "Classic Manicure",
        description: "Nail shaping, cuticle care and polish of your choice.",
        categorySlug: "beauty-wellness",
        duration_minutes: 60,
        price_fils: 15000,
        location_mode: at_premises,
      },
      {
        slug: "home-cleaning-demo-salon",
        name: "Home Cleaning (2 hours)",
        description: "Two cleaners, all supplies included. Kitchen, bathrooms, floors and dusting.",
        categorySlug: "cleaning",
        duration_minutes: 120,
        price_fils: 25000,
        location_mode: home_visit,
      },
      {
        slug: "ac-service-demo-salon",
        name: "AC Service",
        description: "Filter clean, coil wash and gas pressure check for up to two split units.",
        categorySlug: "home-maintenance",
        duration_minutes: 90,
        price_fils: 19900,
        location_mode: either,
      },
    ],
    staff: [
      { name: "Aisha Rahman", bio: "Senior stylist and nail technician." },
      { name: "Omar Haddad", bio: "Home services lead: cleaning and AC maintenance." },
    ],
  },
  {
    slug: "mypickuae-demo-cleaning",
    name: "MyPickUAE Demo Cleaning",
    email: "demo-cleaning@mypickuae.com",
    ownerFirstName: "Leila",
    ownerLastName: "Nasser",
    description:
      "Trained, background-checked cleaners for regular, deep and move-out cleaning across Dubai.",
    business_type: "cleaning",
    phone: "+971500000002",
    branch: {
      areaSlug: "jlt",
      name: "JLT Cluster D",
      line1: "Cluster D, Lake Plaza Tower, Office 804",
      city: "Dubai",
      lat: 25.0693,
      lng: 55.1412,
    },
    homeVisitAreas: [
      "jlt",
      "dubai-marina",
      "jvc",
      "al-barsha",
      "business-bay",
      "downtown-dubai",
      "palm-jumeirah",
    ],
    offerings: [
      {
        slug: "home-cleaning-4h-demo-cleaning",
        name: "Home Cleaning (4 hours)",
        description: "One cleaner for four hours with all supplies and equipment included.",
        categorySlug: "cleaning",
        duration_minutes: 240,
        price_fils: 32000,
        location_mode: home_visit,
      },
      {
        slug: "deep-cleaning-1br-demo-cleaning",
        name: "Deep Cleaning — 1 Bedroom Apartment",
        description:
          "Top-to-bottom clean including inside cabinets, appliances, grout and windows.",
        categorySlug: "cleaning",
        duration_minutes: 300,
        price_fils: 65000,
        location_mode: home_visit,
      },
      {
        slug: "sofa-shampoo-demo-cleaning",
        name: "Sofa Shampoo (up to 5 seats)",
        description: "Hot-water extraction that lifts stains and odours; dry in four to six hours.",
        categorySlug: "cleaning",
        duration_minutes: 90,
        price_fils: 22000,
        location_mode: home_visit,
      },
      {
        slug: "carpet-cleaning-demo-cleaning",
        name: "Carpet Deep Clean",
        description: "Steam clean for rugs and fitted carpets up to 20 square metres.",
        categorySlug: "cleaning",
        duration_minutes: 90,
        price_fils: 18000,
        location_mode: home_visit,
      },
      {
        slug: "move-out-cleaning-demo-cleaning",
        name: "Move-in / Move-out Cleaning",
        description:
          "Handover-ready clean for an empty apartment, including balcony and kitchen degrease.",
        categorySlug: "cleaning",
        duration_minutes: 360,
        price_fils: 90000,
        location_mode: home_visit,
      },
    ],
    staff: [
      { name: "Grace Wanjiru", bio: "Team lead with eight years in residential cleaning." },
      { name: "Maricel Dizon", bio: "Deep-cleaning and upholstery specialist." },
    ],
  },
  {
    slug: "mypickuae-demo-ac",
    name: "MyPickUAE Demo AC & Maintenance",
    email: "demo-ac@mypickuae.com",
    ownerFirstName: "Khalid",
    ownerLastName: "Al Shamsi",
    description:
      "Licensed AC, plumbing and electrical technicians serving Abu Dhabi, same-day where possible.",
    business_type: "maintenance",
    phone: "+971500000003",
    branch: {
      areaSlug: "al-khalidiyah",
      name: "Al Khalidiyah",
      line1: "Khalidiyah Street, Building 21",
      city: "Abu Dhabi",
      lat: 24.4706,
      lng: 54.3496,
    },
    homeVisitAreas: [
      "al-khalidiyah",
      "al-reem-island",
      "khalifa-city",
      "yas-island",
      "saadiyat-island",
      "al-raha-beach",
    ],
    offerings: [
      {
        slug: "ac-deep-clean-demo-ac",
        name: "AC Deep Cleaning (per unit)",
        description: "Unit dismantled, coil and blower chemical-washed, drain line flushed.",
        categorySlug: "home-maintenance",
        duration_minutes: 90,
        price_fils: 15000,
        location_mode: home_visit,
      },
      {
        slug: "ac-gas-refill-demo-ac",
        name: "AC Gas Top-up",
        description: "Leak check and refrigerant top-up for one split or window unit.",
        categorySlug: "home-maintenance",
        duration_minutes: 60,
        price_fils: 25000,
        location_mode: home_visit,
      },
      {
        slug: "plumber-visit-demo-ac",
        name: "Plumber Visit (1 hour)",
        description: "Leaks, blockages, mixers and heaters. Parts are quoted separately.",
        categorySlug: "home-maintenance",
        duration_minutes: 60,
        price_fils: 14900,
        location_mode: home_visit,
      },
      {
        slug: "electrician-visit-demo-ac",
        name: "Electrician Visit (1 hour)",
        description:
          "Sockets, lights, breakers and fixture installation by a licensed electrician.",
        categorySlug: "home-maintenance",
        duration_minutes: 60,
        price_fils: 14900,
        location_mode: home_visit,
      },
      {
        slug: "handyman-hourly-demo-ac",
        name: "Handyman (per hour)",
        description: "Curtain rails, TV mounting, furniture assembly and small repairs.",
        categorySlug: "home-maintenance",
        duration_minutes: 60,
        price_fils: 9900,
        location_mode: home_visit,
      },
    ],
    staff: [
      { name: "Rajesh Kumar", bio: "HVAC technician, split and ducted systems." },
      { name: "Imran Siddiqui", bio: "Licensed electrician and plumber." },
    ],
  },
  {
    slug: "mypickuae-demo-spa",
    name: "MyPickUAE Demo Spa & Beauty",
    email: "demo-spa@mypickuae.com",
    ownerFirstName: "Noura",
    ownerLastName: "Haddad",
    description:
      "Ladies' spa and beauty lounge in Jumeirah, with massage therapists for home visits.",
    business_type: "spa",
    phone: "+971500000004",
    branch: {
      areaSlug: "jumeirah",
      name: "Jumeirah Beach Road",
      line1: "Jumeirah Beach Road, Villa 48",
      city: "Dubai",
      lat: 25.2048,
      lng: 55.2389,
    },
    homeVisitAreas: ["jumeirah", "umm-suqeim", "downtown-dubai", "business-bay", "palm-jumeirah"],
    offerings: [
      {
        slug: "swedish-massage-60-demo-spa",
        name: "Swedish Massage (60 min)",
        description: "Full-body relaxation massage with warm aromatherapy oils.",
        categorySlug: "beauty-wellness",
        duration_minutes: 60,
        price_fils: 25000,
        location_mode: either,
      },
      {
        slug: "gel-mani-pedi-demo-spa",
        name: "Gel Manicure & Pedicure",
        description: "Long-wear gel colour on hands and feet with cuticle care and a scrub.",
        categorySlug: "beauty-wellness",
        duration_minutes: 90,
        price_fils: 22000,
        location_mode: at_premises,
      },
      {
        slug: "hydrating-facial-demo-spa",
        name: "Hydrating Facial",
        description: "Cleanse, exfoliation, extraction and hyaluronic mask for dry or tired skin.",
        categorySlug: "beauty-wellness",
        duration_minutes: 60,
        price_fils: 30000,
        location_mode: at_premises,
      },
      {
        slug: "hair-colour-demo-spa",
        name: "Hair Colour (root touch-up)",
        description: "Ammonia-free root colour with gloss and blow-dry.",
        categorySlug: "beauty-wellness",
        duration_minutes: 90,
        price_fils: 28000,
        location_mode: at_premises,
      },
      {
        slug: "eyebrow-threading-demo-spa",
        name: "Eyebrow Threading",
        description: "Precise shaping by an experienced threading artist.",
        categorySlug: "beauty-wellness",
        duration_minutes: 15,
        price_fils: 3500,
        location_mode: at_premises,
      },
    ],
    staff: [
      { name: "Elena Petrova", bio: "Massage therapist and facial specialist." },
      { name: "Priya Sharma", bio: "Nail, brow and hair colour artist." },
    ],
  },
  {
    slug: "mypickuae-demo-pest",
    name: "MyPickUAE Demo Pest Control",
    email: "demo-pest@mypickuae.com",
    ownerFirstName: "Yousef",
    ownerLastName: "Darwish",
    description:
      "Municipality-approved pest control and at-home pet grooming in Dubai and Sharjah.",
    business_type: "pest_control",
    phone: "+971500000005",
    branch: {
      areaSlug: "al-qusais",
      name: "Al Qusais",
      line1: "Al Qusais Industrial Area 2, Warehouse 7",
      city: "Dubai",
      lat: 25.2846,
      lng: 55.3878,
    },
    homeVisitAreas: [
      "al-qusais",
      "deira",
      "mirdif",
      "dubai-silicon-oasis",
      "international-city",
      "al-nahda-sharjah",
      "al-majaz",
    ],
    offerings: [
      {
        slug: "general-pest-apartment-demo-pest",
        name: "General Pest Control — Apartment",
        description:
          "Odourless spray and gel treatment for ants, cockroaches and spiders, with a 90-day warranty.",
        categorySlug: "pest-control-pets",
        duration_minutes: 60,
        price_fils: 19900,
        location_mode: home_visit,
      },
      {
        slug: "cockroach-treatment-demo-pest",
        name: "Cockroach Gel Treatment",
        description: "Targeted gel baiting in kitchen and bathrooms; safe to stay at home.",
        categorySlug: "pest-control-pets",
        duration_minutes: 45,
        price_fils: 14900,
        location_mode: home_visit,
      },
      {
        slug: "bed-bug-treatment-demo-pest",
        name: "Bed Bug Treatment (2 visits)",
        description: "Treatment plus follow-up visit two weeks later to break the breeding cycle.",
        categorySlug: "pest-control-pets",
        duration_minutes: 120,
        price_fils: 45000,
        location_mode: home_visit,
      },
      {
        slug: "dog-grooming-home-demo-pest",
        name: "Dog Grooming at Home",
        description: "Bath, blow-dry, haircut, nail trim and ear clean in a mobile grooming van.",
        categorySlug: "pest-control-pets",
        duration_minutes: 90,
        price_fils: 22000,
        location_mode: home_visit,
      },
      {
        slug: "termite-inspection-demo-pest",
        name: "Termite Inspection",
        description: "Moisture-meter inspection of villa walls and woodwork with a written report.",
        categorySlug: "pest-control-pets",
        duration_minutes: 60,
        price_fils: 9900,
        location_mode: home_visit,
      },
    ],
    staff: [
      { name: "Sameer Qureshi", bio: "Certified pest control technician." },
      { name: "Joanna Reyes", bio: "Professional dog groomer." },
    ],
  },
  {
    slug: "mypickuae-demo-fitout",
    name: "MyPickUAE Demo Fit-out",
    email: "demo-fitout@mypickuae.com",
    ownerFirstName: "Marco",
    ownerLastName: "Bianchi",
    description:
      "Painting, ceilings, flooring and kitchen renovation for apartments, villas and offices.",
    business_type: "fit_out",
    phone: "+971500000006",
    branch: {
      areaSlug: "business-bay",
      name: "Business Bay",
      line1: "Bay Square, Building 5, Office 302",
      city: "Dubai",
      lat: 25.1865,
      lng: 55.2817,
    },
    homeVisitAreas: [
      "business-bay",
      "downtown-dubai",
      "arabian-ranches",
      "motor-city",
      "dubai-sports-city",
      "jumeirah",
    ],
    offerings: [
      {
        slug: "painting-1br-demo-fitout",
        name: "Apartment Painting — 1 Bedroom",
        description: "Walls and ceilings in premium emulsion, furniture covered and moved back.",
        categorySlug: "fit-out-construction",
        duration_minutes: 480,
        price_fils: 120000,
        location_mode: home_visit,
      },
      {
        slug: "false-ceiling-visit-demo-fitout",
        name: "Gypsum False Ceiling — Site Visit",
        description: "On-site measurement, design options and a fixed written quote.",
        categorySlug: "fit-out-construction",
        duration_minutes: 60,
        price_fils: 9900,
        location_mode: home_visit,
      },
      {
        slug: "flooring-visit-demo-fitout",
        name: "Flooring Installation — Site Visit",
        description: "Samples of vinyl, laminate and engineered wood brought to you, with a quote.",
        categorySlug: "fit-out-construction",
        duration_minutes: 60,
        price_fils: 9900,
        location_mode: home_visit,
      },
      {
        slug: "kitchen-renovation-demo-fitout",
        name: "Kitchen Renovation Consultation",
        description: "Layout planning with a designer, 3D concept and itemised budget.",
        categorySlug: "fit-out-construction",
        duration_minutes: 90,
        price_fils: 19900,
        location_mode: home_visit,
      },
    ],
    staff: [
      { name: "Antonio Rossi", bio: "Site supervisor and estimator." },
      { name: "Bilal Ahmed", bio: "Painting and finishing foreman." },
    ],
  },
  {
    slug: "mypickuae-demo-it",
    name: "MyPickUAE Demo IT Services",
    email: "demo-it@mypickuae.com",
    ownerFirstName: "Hassan",
    ownerLastName: "Iqbal",
    description: "Device repair, Wi-Fi, CCTV and on-call IT support for homes and small offices.",
    business_type: "it_services",
    phone: "+971500000007",
    branch: {
      areaSlug: "dubai-silicon-oasis",
      name: "Dubai Silicon Oasis",
      line1: "DSO Headquarters, Block A, Office 117",
      city: "Dubai",
      lat: 25.1185,
      lng: 55.3907,
    },
    homeVisitAreas: [
      "dubai-silicon-oasis",
      "international-city",
      "mirdif",
      "business-bay",
      "downtown-dubai",
      "al-barsha",
    ],
    offerings: [
      {
        slug: "laptop-repair-demo-it",
        name: "Laptop Repair & Diagnosis",
        description: "Hardware and software diagnosis with a fixed quote before any repair.",
        categorySlug: "it-business-services",
        duration_minutes: 60,
        price_fils: 14900,
        location_mode: either,
      },
      {
        slug: "wifi-setup-demo-it",
        name: "Home Wi-Fi Setup & Optimisation",
        description: "Mesh or extender setup, dead-zone survey and secure network configuration.",
        categorySlug: "it-business-services",
        duration_minutes: 90,
        price_fils: 19900,
        location_mode: home_visit,
      },
      {
        slug: "cctv-install-demo-it",
        name: "CCTV Installation (4 cameras)",
        description: "Four HD cameras, recorder and phone app setup; cabling up to 60 metres.",
        categorySlug: "it-business-services",
        duration_minutes: 240,
        price_fils: 120000,
        location_mode: home_visit,
      },
      {
        slug: "office-it-support-demo-it",
        name: "Office IT Support (per hour)",
        description: "On-site help with printers, email, backups and user devices.",
        categorySlug: "it-business-services",
        duration_minutes: 60,
        price_fils: 25000,
        location_mode: home_visit,
      },
    ],
    staff: [
      { name: "Vikram Nair", bio: "Network and CCTV engineer." },
      { name: "Daniel Okafor", bio: "Device repair technician." },
    ],
  },
];

/** Customers who leave the demo reviews. */
const DEMO_REVIEWERS = [
  { first: "Fatima", last: "Al Mansoori", email: "demo-reviewer1@mypickuae.com" },
  { first: "Rahul", last: "Menon", email: "demo-reviewer2@mypickuae.com" },
  { first: "Sarah", last: "Thompson", email: "demo-reviewer3@mypickuae.com" },
  { first: "Ahmed", last: "Khalil", email: "demo-reviewer4@mypickuae.com" },
  { first: "Maria", last: "Santos", email: "demo-reviewer5@mypickuae.com" },
  { first: "Arjun", last: "Nair", email: "demo-reviewer6@mypickuae.com" },
];

const REVIEW_TEXT: Record<string, { title: string; body: string }[]> = {
  "beauty-wellness": [
    {
      title: "Lovely experience",
      body: "Very professional and relaxing. I left feeling great and will book again.",
    },
    { title: "Spot on", body: "Exactly what I asked for, on time and spotless. Highly recommend." },
    { title: "Good value", body: "Friendly staff and fair price. Booking a slot online was easy." },
    { title: "My new regular", body: "Careful, skilled and clean. Found my go-to place." },
  ],
  cleaning: [
    {
      title: "Apartment sparkling",
      body: "Arrived on time with all supplies and left everything spotless.",
    },
    { title: "Very thorough", body: "They cleaned places I never get to. Worth every dirham." },
    { title: "Reliable team", body: "Second booking now, same great standard both times." },
    {
      title: "Easy booking",
      body: "Picked a slot in a minute and the cleaner was polite and quick.",
    },
  ],
  "home-maintenance": [
    {
      title: "AC blowing cold again",
      body: "Technician explained the problem, fixed it fast and cleaned up after.",
    },
    { title: "Quick and tidy", body: "Came within the slot, no mess, fair price." },
    { title: "Knew what he was doing", body: "Diagnosed the issue in minutes. Would use again." },
    { title: "Great service", body: "Professional and courteous, finished earlier than expected." },
  ],
  "pest-control-pets": [
    { title: "No more cockroaches", body: "Treatment was odourless and it worked within a week." },
    { title: "Safe for kids and pets", body: "They explained every step and the products used." },
    { title: "Punctual", body: "On time, efficient, and followed up after the visit." },
    { title: "Happy customer", body: "Problem solved and the price matched the quote." },
  ],
  "fit-out-construction": [
    {
      title: "Clean finish",
      body: "Neat work, furniture protected, and they cleaned up at the end.",
    },
    { title: "Clear quote", body: "Detailed quote on the spot with no surprises later." },
    { title: "Good advice", body: "Helpful suggestions on materials that saved us money." },
    { title: "On schedule", body: "Started and finished on the days promised." },
  ],
  "it-business-services": [
    {
      title: "Wi-Fi finally works everywhere",
      body: "Set up mesh in every room and explained the app.",
    },
    { title: "Fast repair", body: "Laptop diagnosed the same day with a clear price." },
    { title: "Patient and helpful", body: "Took time to answer all our questions." },
    { title: "Professional install", body: "Cameras neatly installed and cables hidden." },
  ],
};

const RATINGS = [5, 5, 4, 5, 4, 5, 3, 5];
/** Reviews sit on completed bookings in the past, one per staff member per day. */
const REVIEW_BASE_UTC = Date.UTC(2026, 4, 1, 5, 0, 0); // 1 May 2026, 09:00 Dubai
const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_COMMISSION_RATE = 15;

/** Sun(0)–Sat(6), 09:00–21:00 in the branch timezone (Asia/Dubai). */
const WORK_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WORK_START = "09:00:00";
const WORK_END = "21:00:00";

/**
 * Development-only demo vendors so the storefront, vendor dashboards and
 * availability have something real to show: one vendor per category, each
 * with a branch, home-visit areas, staff, published services and approved
 * reviews on past completed bookings. Idempotent: every row is looked up by a
 * natural key first, so re-running changes nothing. Requires the users, areas
 * and categories seeds to have run. Returns a short summary, or null when
 * skipped.
 */
export async function seedDemoData(ds: DataSource): Promise<string | null> {
  if (process.env.NODE_ENV === "production") return null;

  return ds.transaction(async (m) => {
    const areaBySlug = await loadAreas(m);
    const categories = await m.find(Category);
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
    const reviewers = await ensureReviewers(m);

    let services = 0;
    let reviews = 0;
    for (const [vendorIndex, def] of DEMO_VENDORS.entries()) {
      const branchArea = areaBySlug.get(def.branch.areaSlug);
      if (!branchArea) {
        throw new Error(`demo seed: area "${def.branch.areaSlug}" missing — seed areas first`);
      }

      const user = await ensureOwnerUser(m, def);
      const vendor = await ensureVendor(m, def);
      await ensureOwnerMembership(m, vendor, user);
      const branch = await ensureBranch(m, vendor, def, branchArea);

      for (const slug of def.homeVisitAreas) {
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

      const offerings = await ensureOfferings(m, vendor, def, categoryBySlug);
      const staff = await ensureStaff(m, vendor, def, branch, offerings);
      reviews += await ensureReviews(
        m,
        vendorIndex,
        vendor,
        def,
        branch,
        offerings,
        staff,
        reviewers,
      );
      await refreshVendorRating(m, vendor);
      services += offerings.length;
    }

    return `${DEMO_VENDORS.length} vendors (${DEMO_VENDOR_EMAIL}, ...), ${services} published services, ${reviews} reviews`;
  });
}

async function loadAreas(m: EntityManager): Promise<Map<string, Area>> {
  const areas = await m.find(Area);
  return new Map(areas.map((a) => [a.slug, a]));
}

async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
}

async function ensureOwnerUser(m: EntityManager, def: DemoVendor): Promise<User> {
  const existing = await m.findOne(User, { where: { email: def.email } });
  if (existing) return existing;
  const password_hash = await hashPassword(process.env.SEED_VENDOR_PASSWORD || "Vendor@123");
  // Vendors are customers with an owner vendor_members row (no "vendor" user role).
  return m.save(
    m.create(User, {
      first_name: def.ownerFirstName,
      last_name: def.ownerLastName,
      email: def.email,
      password_hash,
      role: UserRole.customer,
      status: UserStatus.active,
      email_verified_at: new Date(),
      preferred_locale: "en",
      preferred_currency: "AED",
    }),
  );
}

async function ensureReviewers(m: EntityManager): Promise<User[]> {
  const out: User[] = [];
  let password_hash: string | null = null;
  for (const r of DEMO_REVIEWERS) {
    const existing = await m.findOne(User, { where: { email: r.email } });
    if (existing) {
      out.push(existing);
      continue;
    }
    password_hash ??= await hashPassword(process.env.SEED_CUSTOMER_PASSWORD || "Customer@123");
    out.push(
      await m.save(
        m.create(User, {
          first_name: r.first,
          last_name: r.last,
          email: r.email,
          password_hash,
          role: UserRole.customer,
          status: UserStatus.active,
          email_verified_at: new Date(),
          preferred_locale: "en",
          preferred_currency: "AED",
        }),
      ),
    );
  }
  return out;
}

async function ensureVendor(m: EntityManager, def: DemoVendor): Promise<Vendor> {
  const existing = await m.findOne(Vendor, { where: { slug: def.slug } });
  if (existing) return existing;
  return m.save(
    m.create(Vendor, {
      name: def.name,
      slug: def.slug,
      description: def.description,
      status: VendorStatus.approved,
      verified_at: new Date(),
      business_name: `${def.name} LLC`,
      business_type: def.business_type,
      contact_email: def.email,
      contact_phone: def.phone,
      address: {
        line1: def.branch.line1,
        area: def.branch.name,
        city: def.branch.city,
        country: "AE",
      },
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

async function ensureBranch(
  m: EntityManager,
  vendor: Vendor,
  def: DemoVendor,
  area: Area,
): Promise<VendorLocation> {
  const existing = await m.findOne(VendorLocation, {
    where: { vendor_id: vendor.id, area_id: area.id },
  });
  if (existing) return existing;
  return m.save(
    m.create(VendorLocation, {
      vendor_id: vendor.id,
      name: def.branch.name,
      address: {
        line1: def.branch.line1,
        area: def.branch.name,
        city: def.branch.city,
        country: "AE",
      },
      lat: def.branch.lat,
      lng: def.branch.lng,
      area_id: area.id,
      timezone: "Asia/Dubai",
      is_active: true,
    }),
  );
}

async function ensureOfferings(
  m: EntityManager,
  vendor: Vendor,
  def: DemoVendor,
  categoryBySlug: Map<string, Category>,
): Promise<ServiceOffering[]> {
  const out: ServiceOffering[] = [];
  for (const o of def.offerings) {
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
  def: DemoVendor,
  branch: VendorLocation,
  offerings: ServiceOffering[],
): Promise<StaffMember[]> {
  const out: StaffMember[] = [];
  for (const s of def.staff) {
    let staff = await m.findOne(StaffMember, { where: { vendor_id: vendor.id, name: s.name } });
    if (!staff) {
      staff = await m.save(
        m.create(StaffMember, { vendor_id: vendor.id, name: s.name, bio: s.bio, is_active: true }),
      );
    }
    out.push(staff);
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
  return out;
}

/**
 * 2–5 approved reviews per offering, each on its own completed booking and
 * confirmed engagement. Staff alternate and every booking for a staff member
 * falls on a different day, so the no_double_book constraint is never hit.
 */
async function ensureReviews(
  m: EntityManager,
  vendorIndex: number,
  vendor: Vendor,
  def: DemoVendor,
  branch: VendorLocation,
  offerings: ServiceOffering[],
  staff: StaffMember[],
  reviewers: User[],
): Promise<number> {
  let created = 0;
  let slot = 0;
  for (const [offeringIndex, offering] of offerings.entries()) {
    const count = 2 + ((vendorIndex + offeringIndex * 3) % 4);
    const texts = REVIEW_TEXT[def.offerings[offeringIndex]?.categorySlug ?? ""] ?? [];
    for (let k = 0; k < count; k++, slot++) {
      const booking_number = `DEMO-${vendorIndex}-${offeringIndex}-${k}`;
      const exists = await m.findOne(Booking, { where: { booking_number } });
      if (exists) continue;

      const member = staff[slot % staff.length];
      const reviewer = reviewers[(vendorIndex + offeringIndex + k) % reviewers.length];
      if (!member || !reviewer) continue;
      const day = Math.floor(slot / staff.length);
      const starts_at = new Date(REVIEW_BASE_UTC + day * DAY_MS);
      const ends_at = new Date(starts_at.getTime() + offering.duration_minutes * 60_000);
      const homeVisit = offering.location_mode === ServiceLocationMode.home_visit;

      const engagement = await m.save(
        m.create(StaffEngagement, {
          staff_member_id: member.id,
          vendor_id: vendor.id,
          starts_at,
          ends_at,
          status: EngagementStatus.confirmed,
          kind: EngagementKind.marketplace_booking,
        }),
      );
      const booking = await m.save(
        m.create(Booking, {
          booking_number,
          customer_user_id: reviewer.id,
          vendor_id: vendor.id,
          location_id: homeVisit ? null : branch.id,
          customer_address: homeVisit ? { area: def.branch.name, city: def.branch.city } : null,
          customer_name: `${reviewer.first_name} ${reviewer.last_name}`,
          staff_member_id: member.id,
          engagement_id: engagement.id,
          service_offering_id: offering.id,
          service_name: offering.name,
          duration_minutes: offering.duration_minutes,
          price_fils: offering.price_fils,
          cancellation_window_hours: offering.cancellation_window_hours,
          cancellation_refund_policy: offering.cancellation_refund_policy,
          cancellation_penalty_percent: offering.cancellation_penalty_percent,
          reschedule_window_hours: offering.reschedule_window_hours,
          commission_rate: DEMO_COMMISSION_RATE,
          commission_fils: Math.round((offering.price_fils * DEMO_COMMISSION_RATE) / 100),
          commission_type: CommissionType.percentage,
          starts_at,
          ends_at,
          status: BookingStatus.completed,
          payment_mode: ServicePaymentMode.pay_at_venue,
          amount_paid_fils: offering.price_fils,
          paid_at_venue: true,
        }),
      );
      const text = texts[(offeringIndex + k) % Math.max(texts.length, 1)];
      await m.save(
        m.create(ServiceReview, {
          booking_id: booking.id,
          customer_user_id: reviewer.id,
          vendor_id: vendor.id,
          staff_member_id: member.id,
          rating: RATINGS[(vendorIndex + offeringIndex + k) % RATINGS.length] ?? 5,
          title: text?.title ?? null,
          body: text?.body ?? null,
          media_urls: [],
          status: ServiceReviewStatus.approved,
          is_verified: true,
          created_at: new Date(ends_at.getTime() + 2 * 60 * 60 * 1000),
        }),
      );
      created++;
    }
  }
  return created;
}

async function refreshVendorRating(m: EntityManager, vendor: Vendor): Promise<void> {
  await m.query(
    `UPDATE vendors v
        SET rating_avg = COALESCE(r.avg, 0), rating_count = COALESCE(r.count, 0)
       FROM (SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS count
               FROM service_reviews
              WHERE vendor_id = $1 AND status::text = 'approved' AND deleted_at IS NULL) r
      WHERE v.id = $1`,
    [vendor.id],
  );
}
