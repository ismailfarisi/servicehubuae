-- Products: Skincare categories
BEGIN;

-- === Face Wash & Cleansers ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3021000-0000-0000-0000-000000000001', '1f073f09-7773-4f06-9f32-77a05bf479e0', 'CeraVe Hydrating Facial Cleanser 236ml', 'cerave-hydrating-cleanser-236ml', 'Gentle hydrating cleanser with ceramides', 'Non-foaming cleanser with 3 essential ceramides and hyaluronic acid. Fragrance-free, non-comedogenic. Dermatologist recommended for all skin types.', 5500, NULL, 'published', NOW(), true, ARRAY['bestseller','gentle','ceramides','fragrance-free'], 'SKIN-CL-001', 'US');

-- === Micellar Water ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3021000-0000-0000-0000-000000000002', '91ac0e43-765d-45f0-84b7-f1c96cd83bba', 'Bioderma Sensibio H2O Micellar Water 500ml', 'bioderma-sensibio-h2o-500ml', 'The original micellar water for sensitive skin', 'Gently removes makeup and impurities without rinsing. Fragrance-free, alcohol-free, paraben-free. A cult favorite worldwide.', 7500, 9000, 'published', NOW(), false, ARRAY['micellar','sensitive','gentle','cult-favorite'], 'SKIN-MW-001', 'FR');

-- === Toners & Essences ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3021000-0000-0000-0000-000000000003', '6d0cc21b-f24a-4fb9-902b-d1ad6ec026be', 'Paula''s Choice Skin Perfecting 2% BHA Liquid Exfoliant', 'paulas-choice-bha-liquid-exfoliant', 'Cult-favorite salicylic acid toner', 'Unclogs pores and smooths wrinkles with 2% salicylic acid. Leaves skin clear, smooth and radiant. Fragrance-free.', 13500, NULL, 'published', NOW(), true, ARRAY['bha','exfoliant','pores','cult-favorite'], 'SKIN-TE-001', 'US');

-- === Exfoliators & Scrubs ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3021000-0000-0000-0000-000000000004', '7df7f4ab-935f-449c-8f12-8591dfed591b', 'Fresh Sugar Face Polish 125g', 'fresh-sugar-face-polish-125g', 'Gentle brown sugar facial scrub', 'Real brown sugar crystals exfoliate while grapeseed and meadowfoam oils nourish. Buffs away dead skin revealing a soft, radiant glow.', 18000, NULL, 'published', NOW(), false, ARRAY['scrub','gentle','radiance'], 'SKIN-EX-001', 'US');

-- === Moisturizers ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2020000-0000-0000-0000-000000000002', '92c93d37-1875-4c78-bfeb-cce1d89e7aa0', 'La Mer Creme de la Mer Moisturizing Cream 60ml', 'la-mer-creme-moisturizing-60ml', 'The legendary luxury moisturizer', 'Infused with the Miracle Broth, this rich cream heals dryness, softens skin and improves radiance. The gold standard in luxury skincare.', 145000, NULL, 'published', NOW(), true, ARRAY['luxury','iconic','miracle-broth','hydrating'], 'SKIN-MO-001', 'US'),
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2020000-0000-0000-0000-000000000002', 'bed4ca12-8c03-41f8-95a0-43f80a520ebf', 'Clinique Moisture Surge 100H Auto-Replenishing Hydrator 75ml', 'clinique-moisture-surge-100h-75ml', 'Lightweight gel-cream for all skin types', 'Oil-free gel-cream that provides 100 hours of hydration. Lightweight, fast-absorbing and ideal for UAE''s humid climate.', 17000, NULL, 'published', NOW(), false, ARRAY['gel-cream','hydrating','lightweight','oil-free'], 'SKIN-MO-002', 'US');

-- === Vitamin C Serums ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3023000-0000-0000-0000-000000000001', 'bb2887ee-8e0d-4d9c-8733-88468dfcacb9', 'The Ordinary Vitamin C Suspension 23% + HA Spheres 2% 30ml', 'the-ordinary-vitamin-c-23-ha-30ml', 'High-strength vitamin C with hyaluronic acid', 'Pure L-Ascorbic Acid in a silicone-free suspension with hyaluronic acid spheres. Brightens, firms and protects against environmental damage.', 2800, NULL, 'published', NOW(), true, ARRAY['vitamin-c','brightening','value','active'], 'SKIN-VC-001', 'CA');

-- === Retinol & Retinoids ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3023000-0000-0000-0000-000000000002', 'a2107bec-4716-43ee-acfb-28eddaedda8d', 'Drunk Elephant A-Passioni Retinol Cream 30ml', 'drunk-elephant-a-passioni-retinol-30ml', '1% retinol anti-aging cream', 'Clean 1% retinol cream with vitamin F, jojoba and marula oil. Fights wrinkles, uneven texture and loss of firmness without irritation.', 28000, NULL, 'published', NOW(), false, ARRAY['retinol','anti-aging','clean-beauty'], 'SKIN-RE-001', 'US');

-- === Hyaluronic Acid Serums ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3023000-0000-0000-0000-000000000003', 'bb2887ee-8e0d-4d9c-8733-88468dfcacb9', 'The Ordinary Hyaluronic Acid 2% + B5 30ml', 'the-ordinary-hyaluronic-acid-2-b5-30ml', 'Multi-weight hyaluronic acid serum', 'Low, medium and high molecular weight HA combined with pro-vitamin B5. Intense hydration at an honest price.', 2500, NULL, 'published', NOW(), true, ARRAY['hyaluronic-acid','hydrating','bestseller','value'], 'SKIN-HA-001', 'CA');

-- === Niacinamide Serums ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3023000-0000-0000-0000-000000000004', 'bb2887ee-8e0d-4d9c-8733-88468dfcacb9', 'The Ordinary Niacinamide 10% + Zinc 1% 30ml', 'the-ordinary-niacinamide-10-zinc-30ml', 'Pore-minimizing and oil-control serum', '10% niacinamide with 1% zinc PCA. Reduces blemishes, controls sebum and minimizes pores. Best-selling skincare product worldwide.', 2200, NULL, 'published', NOW(), true, ARRAY['niacinamide','pores','oil-control','mega-bestseller'], 'SKIN-NI-001', 'CA');

-- === AHA & BHA Acids ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3023000-0000-0000-0000-000000000005', 'bb2887ee-8e0d-4d9c-8733-88468dfcacb9', 'The Ordinary AHA 30% + BHA 2% Peeling Solution 30ml', 'the-ordinary-aha-30-bha-2-peeling-30ml', 'Intense 10-minute exfoliating treatment', '30% AHA and 2% BHA for deep exfoliation. Use once weekly for dramatically improved skin texture and radiance. The viral red mask.', 3200, NULL, 'published', NOW(), false, ARRAY['aha','bha','peeling','viral','weekly-treatment'], 'SKIN-AB-001', 'CA');

-- === Eye Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2020000-0000-0000-0000-000000000004', '5b96ff26-2c4d-4b53-9569-3fb4a35acf44', 'Estee Lauder Advanced Night Repair Eye Supercharged Gel-Creme 15ml', 'estee-lauder-anr-eye-gel-creme-15ml', 'Anti-aging eye gel-cream', 'Chronolux Power Signal Technology targets lines, wrinkles, puffiness and dark circles. 8-hour anti-oxidant power.', 22000, NULL, 'published', NOW(), false, ARRAY['eye-cream','anti-aging','dark-circles'], 'SKIN-EC-001', 'US');

-- === Lip Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2020000-0000-0000-0000-000000000007', '1c270d8b-2257-4920-b639-58a6f4786ef8', 'Laneige Lip Sleeping Mask Berry 20g', 'laneige-lip-sleeping-mask-berry-20g', 'Cult-favorite overnight lip treatment', 'Berry mix complex and vitamin C nourish and smooth lips overnight. Wake up with plump, smooth, moisturized lips.', 7500, NULL, 'published', NOW(), true, ARRAY['lip-mask','overnight','cult-favorite','k-beauty'], 'SKIN-LC-001', 'KR');

-- === Masks & Treatments ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2020000-0000-0000-0000-000000000006', 'e602cf62-678a-4c1e-a894-f6d43c09f2f4', 'Tatcha Dewy Skin Cream 50ml', 'tatcha-dewy-skin-cream-50ml', 'Rich plumping cream for dry skin', 'Japanese purple rice, hyaluronic acid and botanical extracts create a dewy, plumped complexion. J-beauty meets luxury.', 28000, NULL, 'published', NOW(), false, ARRAY['dewy','plumping','j-beauty','hydrating'], 'SKIN-MT-001', 'JP');

-- === Acne & Blemish Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2020000-0000-0000-0000-000000000008', 'a9bceb1b-9386-483a-900c-d6cda65951aa', 'COSRX Acne Pimple Master Patch (24 patches)', 'cosrx-pimple-master-patch-24', 'Hydrocolloid blemish patches', 'Thin, transparent patches that absorb pus and protect blemishes from bacteria. 3 sizes for different spot sizes. Works overnight.', 2500, NULL, 'published', NOW(), true, ARRAY['pimple-patch','acne','k-beauty','bestseller'], 'SKIN-AC-001', 'KR');

-- === Anti-Aging ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2020000-0000-0000-0000-000000000009', '6ed77d29-da3c-4f56-afe4-4a08b83e5867', 'Augustinus Bader The Rich Cream 50ml', 'augustinus-bader-rich-cream-50ml', 'Luxury stem cell technology anti-aging cream', 'Patented TFC8 technology triggers the body''s own renewal process. Visibly reduces wrinkles, firms and restores radiance. Celebrity favorite.', 120000, NULL, 'published', NOW(), true, ARRAY['luxury','anti-aging','stem-cell','celebrity-fav'], 'SKIN-AA-001', 'DE');

-- === Face Sunscreen ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3025000-0000-0000-0000-000000000001', '44151d96-c82f-4d1b-a6f8-590073518a1e', 'La Roche-Posay Anthelios UVMune 400 Fluid SPF50+ 50ml', 'lrp-anthelios-uvmune-400-spf50-50ml', 'Ultra-high protection invisible fluid sunscreen', 'World''s first SPF with Mexoryl 400 for unprecedented UVA protection. Ultra-light, non-greasy, invisible finish. Essential for UAE sun.', 12000, NULL, 'published', NOW(), true, ARRAY['spf50','uva','lightweight','essential','uae-must-have'], 'SKIN-SS-001', 'FR');

-- === Body Sunscreen ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3025000-0000-0000-0000-000000000002', 'f63ddfc8-1528-4721-80af-b60eb5cc368e', 'Neutrogena Ultra Sheer Body Mist Sunscreen SPF50 141g', 'neutrogena-ultra-sheer-body-mist-spf50', 'Lightweight spray-on body sunscreen', 'Oil-free body mist sunscreen with Helioplex technology. Non-greasy, fast-absorbing and water-resistant for 80 minutes.', 6500, NULL, 'published', NOW(), false, ARRAY['spf50','body','spray','water-resistant'], 'SKIN-BS-001', 'US');

-- === Tinted Sunscreen ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3025000-0000-0000-0000-000000000003', '44151d96-c82f-4d1b-a6f8-590073518a1e', 'La Roche-Posay Anthelios Tinted Fluid SPF50+ 50ml', 'lrp-anthelios-tinted-fluid-spf50-50ml', 'Universal tinted sunscreen', 'Broad-spectrum SPF50+ with a universal tint that adapts to all skin tones. Iron oxides protect against visible light and blue light.', 13500, NULL, 'published', NOW(), false, ARRAY['spf50','tinted','universal','blue-light'], 'SKIN-TS-001', 'FR');

-- === After-Sun Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3025000-0000-0000-0000-000000000004', '665e7230-5bbe-4212-bb6b-36d9e871e884', 'Vichy Ideal Soleil After Sun SOS Balm 100ml', 'vichy-after-sun-sos-balm-100ml', 'Soothing after-sun care balm', 'Shea butter and Vichy thermal water soothe and repair sun-exposed skin. Reduces redness and restores comfort.', 8500, NULL, 'published', NOW(), false, ARRAY['after-sun','soothing','repair'], 'SKIN-AS-001', 'FR');

-- === Skincare Sets ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2020000-0000-0000-0000-000000000010', 'f1293ad6-c29e-40bb-bfc3-edde080a9594', 'Kiehl''s Ultimate Hydration Set', 'kiehls-ultimate-hydration-set', 'Complete hydrating skincare routine', 'Includes Ultra Facial Cleanser 150ml, Calendula Toner 250ml, and Ultra Facial Cream 50ml. Perfect introduction to Kiehl''s.', 32000, 40000, 'published', NOW(), false, ARRAY['set','hydrating','gift','routine'], 'SKIN-SET-001', 'US');

COMMIT;
