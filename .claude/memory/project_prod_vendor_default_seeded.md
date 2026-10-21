---
name: project_prod_vendor_default_seeded
description: "Prod was missing the vendor-default storefront template; seeded it (5 sections, copied from staging) on 2026-06-02 so un-customized vendor pages stop falling back to empty"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2c9d4fc8-8e67-44a7-8f49-101b51c4e9e0
---

The admin template `page_layouts(slug='vendor-default', vendor_id IS NULL)` was **absent in prod** even though migration `AddVendorOwnedLayouts1746000020000` ran — its seed `INSERT ... SELECT FROM users WHERE role='super_admin'` was a no-op because prod had no super_admin at migration time. Effect: vendors without a customized layout resolved to `LAYOUT_NOT_PUBLISHED` → the web vendor page showed only the hero, no sections.

Fixed 2026-06-02: seeded prod `vendor-default` (published, version 1, 5 sections) to match staging v2:
0 hero_carousel/manual `{use_vendor_banner:true}`, 1 promotional_banner/manual `{}`, 2 product_carousel/query `{title:{en:"Featured Products"}}` data_source `{"type":"products","query":{"limit":12,"sort":"newest"}}`, 3 testimonials/manual `{title:{en:"What Customers Say"}}`, 4 flash_deals/manual `{}`.

Method (SSH to Netcup was fail2ban-blocked): read staging template via the **public resolve API** `GET api.stage.mypickuae.com/layouts/vendor-default/resolve` (note: resolve DROPS query-mode `data_source` — recovered the product_carousel spec from the seed migration), then applied a guarded `DO` block to prod RDS via SSM (dry-run in a rolled-back txn first). section_type mapped by NAME (ids differ per DB); created_by reused beauty-fragrance's author. Verified live: `/layouts/vendor-storefront/resolve?context_vendor_id=<vendor>` → owner=admin_template, 5 sections, carousel 12 items. See [[reference_prod_rds_ssm_debug]] and [[project_netcup_staging_live]].
