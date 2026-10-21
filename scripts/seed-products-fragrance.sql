-- Products: Fragrance categories
BEGIN;

-- Vendor IDs: v1=3f345253, v2=69241f42, v3=5467e451
-- Prices in fils (1 AED = 100 fils)

-- === Women's EDP ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3011000-0000-0000-0000-000000000001', '0c4796f5-7a2e-4b08-a6f6-aa4278110891', 'Chanel N°5 Eau de Parfum 100ml', 'chanel-no5-edp-100ml', 'The iconic floral aldehyde fragrance', 'A timeless masterpiece, Chanel N°5 is a bouquet of abstract flowers with notes of ylang-ylang, May rose, jasmine, and sandalwood. An eternal symbol of femininity.', 52000, NULL, 'published', NOW(), true, ARRAY['bestseller','iconic','luxury','gift'], 'FRAG-W-EDP-001', 'FR'),
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3011000-0000-0000-0000-000000000001', '5e73f2c5-f5c0-4850-b592-d21ded8f72e0', 'Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml', 'mfk-baccarat-rouge-540-edp-70ml', 'The legendary amber floral fragrance', 'An alchemy of amber, jasmine, and saffron that creates a poetic, luminous, and sophisticated aura. A modern masterpiece of perfumery.', 95000, NULL, 'published', NOW(), true, ARRAY['bestseller','niche','luxury','viral'], 'FRAG-W-EDP-002', 'FR');

-- === Women's EDT ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3011000-0000-0000-0000-000000000002', '17793a90-1d79-455d-a591-ab009a328884', 'Miss Dior Eau de Toilette 100ml', 'miss-dior-edt-100ml', 'A fresh and sparkling floral fragrance', 'A vibrant expression of joie de vivre with blood orange, grasse rose, and white musk. A celebration of love and freshness.', 42000, NULL, 'published', NOW(), false, ARRAY['floral','fresh','designer'], 'FRAG-W-EDT-001', 'FR');

-- === Women's Parfum & Extrait ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3011000-0000-0000-0000-000000000003', '05ad4125-d427-4491-b8c3-d8865de4e8ae', 'Kilian Love Don''t Be Shy Extreme 50ml', 'kilian-love-dont-be-shy-extreme-50ml', 'An intoxicating gourmand floral extrait', 'Orange blossom, neroli and marshmallow accord meld with vanilla and musk in this intensified version of the beloved fragrance.', 110000, NULL, 'published', NOW(), true, ARRAY['niche','gourmand','luxury','extrait'], 'FRAG-W-PAR-001', 'FR');

-- === Women's Body Mist ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3011000-0000-0000-0000-000000000004', '8f0ab542-742d-4c0c-ba1e-eb1c8e6c1551', 'Versace Bright Crystal Body Mist 200ml', 'versace-bright-crystal-body-mist-200ml', 'A refreshing floral body mist', 'Magnolia, peony and lotus with pomegranate and musk in a light, refreshing body mist format perfect for UAE summers.', 15000, 18000, 'published', NOW(), false, ARRAY['summer','fresh','body-mist'], 'FRAG-W-BM-001', 'IT');

-- === Women's Perfume Gift Sets ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3011000-0000-0000-0000-000000000005', '0a6efcb6-b9ab-4380-802d-206ecb6d4e9c', 'YSL Libre Discovery Set (4x 7.5ml)', 'ysl-libre-discovery-set', 'Discover the YSL Libre collection', 'Explore four stunning fragrances from the Libre family: Libre EDT, Libre EDP, Libre Intense, and Libre Le Parfum.', 35000, NULL, 'published', NOW(), false, ARRAY['gift-set','discovery','travel'], 'FRAG-W-GS-001', 'FR');

-- === Women's Perfume Oils ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3011000-0000-0000-0000-000000000006', 'f0a57fa1-6f7f-47e9-b261-7178d4717db4', 'Swiss Arabian Concentrated Perfume Oil Amaali 12ml', 'swiss-arabian-amaali-oil-12ml', 'Luxurious concentrated perfume oil', 'A blend of rose, oud and musk in pure concentrated oil form. Alcohol-free, long-lasting and perfect for layering.', 8500, NULL, 'published', NOW(), false, ARRAY['attar','oil','alcohol-free','arabian'], 'FRAG-W-OIL-001', 'AE');

-- === Men's EDP ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3012000-0000-0000-0000-000000000001', '17793a90-1d79-455d-a591-ab009a328884', 'Dior Sauvage Eau de Parfum 100ml', 'dior-sauvage-edp-100ml', 'The iconic fresh spicy men''s fragrance', 'A bold and magnetic composition with Calabrian bergamot, Sichuan pepper, and warm ambroxan. The world''s best-selling men''s fragrance.', 48500, NULL, 'published', NOW(), true, ARRAY['bestseller','iconic','fresh','spicy'], 'FRAG-M-EDP-001', 'FR'),
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3012000-0000-0000-0000-000000000001', 'a33ffc7e-ffe0-4a12-8ed4-32f94368cbfd', 'Creed Aventus Eau de Parfum 100ml', 'creed-aventus-edp-100ml', 'The legendary masculine powerhouse', 'Fruity, smoky and rich with pineapple, birch, oakmoss and ambergris. A symbol of strength and success.', 120000, NULL, 'published', NOW(), true, ARRAY['niche','luxury','iconic','power'], 'FRAG-M-EDP-002', 'FR');

-- === Men's EDT ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3012000-0000-0000-0000-000000000002', '754f4fdc-3333-460d-8014-d2b0282798ed', 'Acqua di Gio Profondo EDT 75ml', 'acqua-di-gio-profondo-edt-75ml', 'A deep aquatic aromatic fragrance', 'Marine notes blended with bergamot, rosemary, patchouli and amber create a deep oceanic freshness. Perfect for hot UAE summers.', 35000, NULL, 'published', NOW(), false, ARRAY['aquatic','summer','fresh'], 'FRAG-M-EDT-001', 'IT');

-- === Men's Cologne ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3012000-0000-0000-0000-000000000003', '08dedc22-f98f-43f5-a45e-04feaf23ec73', 'Montblanc Explorer Eau de Cologne 100ml', 'montblanc-explorer-edc-100ml', 'A refreshing woody aromatic cologne', 'Bergamot, vetiver and patchouli create a vibrant cologne ideal for everyday wear in warm climates.', 22000, 28000, 'published', NOW(), false, ARRAY['cologne','everyday','fresh'], 'FRAG-M-COL-001', 'DE');

-- === Men's Deo & Body Spray ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3012000-0000-0000-0000-000000000004', 'cdfe6f9c-fc1a-4ee8-956b-f4dfdabedf75', 'Hugo Boss Bottled Deodorant Spray 150ml', 'hugo-boss-bottled-deo-150ml', 'Long-lasting deodorant with signature scent', 'The iconic Boss Bottled scent in a refreshing deodorant spray format. Apple, geranium and sandalwood freshness all day.', 8500, NULL, 'published', NOW(), false, ARRAY['deodorant','everyday','value'], 'FRAG-M-DEO-001', 'DE');

-- === Men's Fragrance Gift Sets ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3012000-0000-0000-0000-000000000005', 'dc6e4d7c-b0cf-4802-8c68-ad468eee387a', 'Tom Ford Noir Collection Gift Set', 'tom-ford-noir-gift-set', 'Three luxury fragrances in one set', 'Includes Noir Extreme EDP 50ml, Noir de Noir EDP 50ml, and Ombre Leather EDP 50ml. The ultimate luxury gifting set.', 180000, NULL, 'published', NOW(), true, ARRAY['gift-set','luxury','eid'], 'FRAG-M-GS-001', 'US');

-- === Niche & Designer ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2010000-0000-0000-0000-000000000005', '7e0ddef0-7ae7-4a74-84fc-c735916a7b34', 'Xerjoff Naxos Eau de Parfum 100ml', 'xerjoff-naxos-edp-100ml', 'A rich tobacco honey gourmand masterpiece', 'Lavender, cinnamon, tobacco and honey over a base of tonka bean and cashmeran. An opulent Italian masterwork.', 85000, NULL, 'published', NOW(), true, ARRAY['niche','gourmand','tobacco','luxury'], 'FRAG-NI-001', 'IT'),
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2010000-0000-0000-0000-000000000005', '8d447301-741a-47c2-a361-93b9a982d017', 'Parfums de Marly Layton Eau de Parfum 125ml', 'pdm-layton-edp-125ml', 'The viral amber vanilla fragrance', 'Apple, lavender, cardamom and vanilla create an addictive, warm fragrance that projects beautifully. A crowd-pleaser with phenomenal longevity.', 95000, NULL, 'published', NOW(), true, ARRAY['niche','viral','amber','crowd-pleaser'], 'FRAG-NI-002', 'FR');

-- === Unisex Fragrance ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2010000-0000-0000-0000-000000000003', '254fb753-525b-4291-854d-fda76717e1c3', 'Le Labo Santal 33 Eau de Parfum 100ml', 'le-labo-santal-33-edp-100ml', 'The cult favorite sandalwood fragrance', 'Cardamom, iris, violet and sandalwood create a leathery, woody scent that has become a modern classic. Effortlessly cool.', 120000, NULL, 'published', NOW(), true, ARRAY['cult','unisex','woody','minimal'], 'FRAG-UNI-001', 'US'),
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2010000-0000-0000-0000-000000000003', 'ed6bc02c-58d3-4697-adc3-f64670216e18', 'Byredo Gypsy Water Eau de Parfum 100ml', 'byredo-gypsy-water-edp-100ml', 'A fresh woody bohemian fragrance', 'Pine needles, lemon, incense, orris and vanilla. A romantic, free-spirited scent inspired by the Romani lifestyle.', 78000, NULL, 'published', NOW(), false, ARRAY['unisex','woody','fresh','bohemian'], 'FRAG-UNI-002', 'SE');

-- === Arabian Perfumery: Oud & Bakhoor ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3014000-0000-0000-0000-000000000001', '48470f2e-086a-469c-b9ac-5531e89b4683', 'Amouage Interlude Man Eau de Parfum 100ml', 'amouage-interlude-man-edp-100ml', 'A powerful oud and incense composition', 'Oregano, bergamot, oud, frankincense, myrrh and amber create a dramatic, rich and complex Arabian masterpiece.', 75000, NULL, 'published', NOW(), true, ARRAY['oud','arabian','luxury','incense'], 'FRAG-AR-OB-001', 'OM');

-- === Arabian: Attar & Concentrated Oils ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3014000-0000-0000-0000-000000000002', 'a5e4729f-22ed-4e6e-ba03-88d6343b1075', 'Abdul Samad Al Qurashi Royal Oud Attar 12ml', 'asaq-royal-oud-attar-12ml', 'Pure oud attar from heritage house', 'Hand-crafted concentrated oud oil blended with rose and musk. Pure, alcohol-free and incredibly long-lasting. A treasured heritage scent.', 45000, NULL, 'published', NOW(), true, ARRAY['attar','oud','heritage','alcohol-free'], 'FRAG-AR-AT-001', 'SA');

-- === Arabian: Bukhoor & Incense ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3014000-0000-0000-0000-000000000003', 'a8bb41cd-9297-4066-b6e8-b1dfc7b014ad', 'Arabian Oud Bukhoor Majestic 80g', 'arabian-oud-bukhoor-majestic-80g', 'Premium bukhoor chips for home fragrance', 'Rich oud wood chips blended with sandalwood, musk and amber resin. Burns slowly releasing a warm, enveloping aroma throughout your home.', 12000, NULL, 'published', NOW(), false, ARRAY['bukhoor','incense','home','arabian'], 'FRAG-AR-BK-001', 'AE');

-- === Arabian: Home Fragrance ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3014000-0000-0000-0000-000000000004', '8bcc0477-19a1-4cec-bea0-14b8f7e1f5a4', 'Diptyque Baies Reed Diffuser 200ml', 'diptyque-baies-reed-diffuser-200ml', 'Luxury home fragrance diffuser', 'The iconic Baies scent of blackcurrant leaves and Bulgarian rose in an elegant glass diffuser. Lasts up to 3 months.', 32000, NULL, 'published', NOW(), false, ARRAY['home-fragrance','diffuser','luxury'], 'FRAG-AR-HF-001', 'FR');

-- === Arabian: Incense Burners ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3014000-0000-0000-0000-000000000005', 'cf145084-f161-4149-8c4f-3e4c5796d421', 'Ajmal Heritage Electric Mabkhara Gold', 'ajmal-heritage-electric-mabkhara-gold', 'Elegant electric incense burner', 'Premium gold-finished electric mabkhara. Safe, smoke-free bukhoor burning with adjustable heat. Perfect for home and office.', 28000, NULL, 'published', NOW(), true, ARRAY['mabkhara','incense-burner','electric','gift'], 'FRAG-AR-IB-001', 'AE');

-- === Fragrance Accessories ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2010000-0000-0000-0000-000000000006', '61c2779e-7556-4939-983e-7d11f7256766', 'Jo Malone Cologne Intense Discovery Set', 'jo-malone-cologne-intense-discovery-set', 'Five luxury fragrances to explore', 'Five 1.5ml samples of Cologne Intense collection including Oud & Bergamot, Velvet Rose & Oud, and Myrrh & Tonka.', 18000, NULL, 'published', NOW(), false, ARRAY['discovery','travel','gift','sample'], 'FRAG-ACC-001', 'GB');

COMMIT;
