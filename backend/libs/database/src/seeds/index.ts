import "reflect-metadata";
import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source.ts";
import { Category } from "../entities/category.entity.ts";
import { SiteSetting } from "../entities/site-setting.entity.ts";
import { TaxRate } from "../entities/tax-rate.entity.ts";
import { User } from "../entities/user.entity.ts";
import { UserRole, UserStatus } from "../enums/user.enums.ts";

async function seed() {
  const ds = await AppDataSource.initialize();
  console.log("Database connected — seeding...");

  // ── Admin & test users ──────────────────────────────────────────
  const userRepo = ds.getRepository(User);

  const adminExists = await userRepo.findOne({ where: { email: "admin@mypickuae.com" } });
  if (!adminExists) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
    const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || "Customer@123";
    const adminHash = await Bun.password.hash(adminPassword, { algorithm: "bcrypt", cost: 10 });
    const customerHash = await Bun.password.hash(customerPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });
    await userRepo.save([
      userRepo.create({
        first_name: "Super",
        last_name: "Admin",
        email: "admin@mypickuae.com",
        password_hash: adminHash,
        role: UserRole.super_admin,
        status: UserStatus.active,
        email_verified_at: new Date(),
        preferred_locale: "en",
        preferred_currency: "AED",
      }),
      userRepo.create({
        first_name: "Test",
        last_name: "Customer",
        email: "customer@mypickuae.com",
        password_hash: customerHash,
        role: UserRole.customer,
        status: UserStatus.active,
        email_verified_at: new Date(),
        preferred_locale: "en",
        preferred_currency: "AED",
      }),
    ]);
    console.log("  ✓ Created admin + test customer");
  } else {
    console.log("  – Users already seeded, skipping");
  }

  // ── Categories (placeholder top-level groups; the full 440-service
  // catalogue is imported from the client spreadsheet) ─────────────
  const catRepo = ds.getRepository(Category);
  const catCount = await catRepo.count();
  if (catCount === 0) {
    const groups: Array<[name: string, slug: string, description: string]> = [
      ["Home Maintenance", "home-maintenance", "AC, plumbing, electrical, handyman and appliance repair"],
      ["Cleaning", "cleaning", "Home, office, deep and move-in cleaning"],
      ["Beauty & Wellness", "beauty-wellness", "Salon, spa and massage at home"],
      ["Pest Control & Pets", "pest-control-pets", "Pest control and pet grooming"],
      ["Fit-out & Construction", "fit-out-construction", "Interior fit-out, renovation and construction works"],
      ["IT & Business Services", "it-business-services", "IT projects, maintenance contracts and business procurement"],
    ];
    await catRepo.save(
      groups.map(([name, slug, description], i) =>
        catRepo.create({ name, slug, description, is_active: true, sort_order: i + 1 }),
      ),
    );
    console.log(`  ✓ Created ${groups.length} top-level service categories`);
  } else {
    console.log("  – Categories already exist, skipping");
  }

  // ── Tax rates (UAE VAT) ─────────────────────────────────────────
  const taxRepo = ds.getRepository(TaxRate);
  const taxCount = await taxRepo.count();
  if (taxCount === 0) {
    await taxRepo.save([
      taxRepo.create({
        name: "UAE Standard VAT",
        rate: 5.0,
        country_code: "AE",
        is_default: true,
        effective_from: "2018-01-01",
        is_active: true,
      }),
      taxRepo.create({
        name: "UAE Zero-Rated",
        rate: 0.0,
        country_code: "AE",
        is_default: false,
        effective_from: "2018-01-01",
        is_active: true,
      }),
    ]);
    console.log("  ✓ Created tax rates (UAE VAT 5% + zero-rated)");
  } else {
    console.log("  – Tax rates already seeded, skipping");
  }

  // ── Site settings ───────────────────────────────────────────────
  const settingRepo = ds.getRepository(SiteSetting);
  const settingCount = await settingRepo.count();
  if (settingCount === 0) {
    await settingRepo.save([
      settingRepo.create({
        key: "site_name",
        value: "MyPickUAE",
        value_type: "string",
        group: "general",
        description: "Marketplace name",
      }),
      settingRepo.create({
        key: "site_tagline",
        value: "Compare, book and get it done",
        value_type: "string",
        group: "general",
        description: "Tagline shown in header",
      }),
      settingRepo.create({
        key: "default_currency",
        value: "AED",
        value_type: "string",
        group: "general",
        description: "Default currency code",
      }),
      settingRepo.create({
        key: "default_locale",
        value: "en",
        value_type: "string",
        group: "general",
        description: "Default locale",
      }),
      settingRepo.create({
        key: "supported_locales",
        value: '["en","ar","hi","ur","ml"]',
        value_type: "json",
        group: "general",
        description: "Supported locale codes",
      }),
      settingRepo.create({
        key: "supported_currencies",
        value: '["AED","USD","EUR","GBP","SAR"]',
        value_type: "json",
        group: "general",
        description: "Supported currency codes",
      }),
      settingRepo.create({
        key: "vendor_commission_default",
        value: "10.00",
        value_type: "number",
        group: "vendor",
        description: "Default vendor commission percentage",
      }),
      settingRepo.create({
        key: "vendor_auto_approve",
        value: "false",
        value_type: "boolean",
        group: "vendor",
        description: "Auto-approve new vendor applications",
      }),
      settingRepo.create({
        key: "order_prefix",
        value: "FS",
        value_type: "string",
        group: "order",
        description: "Order number prefix",
      }),
      settingRepo.create({
        key: "max_cart_items",
        value: "50",
        value_type: "number",
        group: "cart",
        description: "Maximum items per cart",
      }),
      settingRepo.create({
        key: "cart_ttl_days",
        value: "30",
        value_type: "number",
        group: "cart",
        description: "Cart expiry in days",
      }),
      settingRepo.create({
        key: "vat_rate",
        value: "5.00",
        value_type: "number",
        group: "tax",
        description: "UAE standard VAT rate",
      }),
      settingRepo.create({
        key: "min_order_amount",
        value: "10.00",
        value_type: "number",
        group: "order",
        description: "Minimum order amount in AED",
      }),
    ]);
    console.log("  ✓ Created 13 site settings");
  } else {
    console.log("  – Site settings already seeded, skipping");
  }


  await ds.destroy();
  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
