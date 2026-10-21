-- Products: Haircare, Bath & Body, Men's Grooming, Tools, Natural, K-Beauty
BEGIN;

-- ============ HAIRCARE ============

-- === Shampoo & Conditioner ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2040000-0000-0000-0000-000000000001', '9787d6f6-803f-4117-8eeb-a8fc9e8fe7de', 'Olaplex No.4 Bond Maintenance Shampoo 250ml', 'olaplex-no4-shampoo-250ml', 'Bond-repairing shampoo', 'Patented OLAPLEX Bond Building technology repairs and protects hair from damage. Sulfate-free, color-safe. Gentle enough for daily use.', 12500, NULL, 'published', NOW(), true, ARRAY['bond-repair','sulfate-free','color-safe','bestseller'], 'HC-SC-001', 'US');

-- === Hair Treatments ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2040000-0000-0000-0000-000000000002', 'd5dc709c-fc41-4d93-aa92-7ebdff54dae7', 'Moroccanoil Treatment Original 100ml', 'moroccanoil-treatment-original-100ml', 'The iconic argan oil hair treatment', 'Argan oil-infused formula smooths, conditions, and eliminates frizz. Protects from environmental damage. The product that started it all.', 18000, NULL, 'published', NOW(), true, ARRAY['argan-oil','smoothing','frizz','iconic'], 'HC-HT-001', 'IL');

-- === Hair Styling ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2040000-0000-0000-0000-000000000003', '3ffe691b-24b1-427a-bee8-1d59f91b048d', 'Oribe Dry Texturizing Spray 300ml', 'oribe-dry-texturizing-spray-300ml', 'Volume and texture in a dry spray', 'Absorbs oil, adds volume and texture without drying out hair. UV protection. Creates that effortless, lived-in look.', 19000, NULL, 'published', NOW(), false, ARRAY['texturizing','volume','dry-spray','luxury'], 'HC-HS-001', 'US');

-- === Hair Color ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2040000-0000-0000-0000-000000000004', 'e57abca2-1bac-4c09-9a30-2c5cf1ae5744', 'L''Oreal Paris Excellence Creme Hair Color', 'loreal-excellence-creme-hair-color', 'Triple protection hair color', 'Pro-Keratin, Collagen and Ceramide protect and nourish hair during coloring. 100% gray coverage with rich, long-lasting color.', 4500, NULL, 'published', NOW(), false, ARRAY['hair-color','gray-coverage','nourishing'], 'HC-HC-001', 'FR');

-- ============ BATH & BODY ============

-- === Body Wash & Shower ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2050000-0000-0000-0000-000000000001', '61c2779e-7556-4939-983e-7d11f7256766', 'Jo Malone English Pear & Freesia Body & Hand Wash 250ml', 'jo-malone-english-pear-body-wash-250ml', 'Luxury scented body wash', 'The delicate freshness of ripe pears wrapped in white freesias and amber patchouli. Enriched with vitamin E.', 16000, NULL, 'published', NOW(), false, ARRAY['luxury','scented','vitamin-e'], 'BB-BW-001', 'GB');

-- === Body Moisturizers ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2050000-0000-0000-0000-000000000002', '1f073f09-7773-4f06-9f32-77a05bf479e0', 'CeraVe Moisturizing Cream 340g', 'cerave-moisturizing-cream-340g', 'Rich body cream with ceramides', '3 essential ceramides and hyaluronic acid in a rich cream. Fragrance-free, non-comedogenic. 24-hour hydration for dry to very dry skin.', 6500, NULL, 'published', NOW(), true, ARRAY['body-cream','ceramides','fragrance-free','24-hour'], 'BB-BM-001', 'US');

-- === Body Scrubs ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2050000-0000-0000-0000-000000000003', '7df7f4ab-935f-449c-8f12-8591dfed591b', 'Fresh Brown Sugar Body Polish 400g', 'fresh-brown-sugar-body-polish-400g', 'Exfoliating body scrub with natural sugar', 'Real brown sugar crystals with evening primrose, sweet almond and apricot kernel oils. Polishes skin to silky smoothness.', 18000, NULL, 'published', NOW(), false, ARRAY['body-scrub','sugar','exfoliating','natural'], 'BB-BS-001', 'US');

-- === Hand & Foot Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2050000-0000-0000-0000-000000000004', '94c51100-a83a-4d36-9e16-12e89ee7593a', 'Caudalie Hand and Nail Cream 75ml', 'caudalie-hand-nail-cream-75ml', 'Nourishing hand cream with grape extracts', 'Organic grape water and shea butter moisturize while grape polyphenols protect against aging. Non-greasy, fast-absorbing.', 6500, NULL, 'published', NOW(), false, ARRAY['hand-cream','grape','nourishing','non-greasy'], 'BB-HF-001', 'FR');

-- === Deodorant ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2050000-0000-0000-0000-000000000005', 'f63ddfc8-1528-4721-80af-b60eb5cc368e', 'Neutrogena Body Clear Body Spray 250ml', 'neutrogena-body-clear-spray-250ml', 'Salicylic acid body spray', 'Acne-fighting body spray with 2% salicylic acid. Prevents breakouts on chest and back. Oil-free and refreshing.', 4500, NULL, 'published', NOW(), false, ARRAY['body-spray','acne','salicylic-acid'], 'BB-DEO-001', 'US');

-- === Bath Soaks & Bombs ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2050000-0000-0000-0000-000000000006', '61c2779e-7556-4939-983e-7d11f7256766', 'Jo Malone Pomegranate Noir Bath Oil 250ml', 'jo-malone-pomegranate-noir-bath-oil-250ml', 'Luxurious scented bath oil', 'Ruby-rich pomegranate, pink pepper and Casablanca lily in a nourishing bath oil. Transform your bath into a luxury ritual.', 24000, NULL, 'published', NOW(), false, ARRAY['bath-oil','luxury','scented','ritual'], 'BB-BA-001', 'GB');

-- ============ MEN'S GROOMING ============

-- === Shaving & Beard ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2060000-0000-0000-0000-000000000001', 'dc6e4d7c-b0cf-4802-8c68-ad468eee387a', 'Tom Ford Conditioning Beard Oil 30ml', 'tom-ford-beard-oil-30ml', 'Luxury grooming beard oil', 'Conditions, softens and tames beard while adding a subtle Tom Ford scent. Blend of grapeseed, sweet almond and jojoba oils.', 22000, NULL, 'published', NOW(), true, ARRAY['beard-oil','luxury','grooming','conditioning'], 'MG-SB-001', 'US');

-- === Men's Skincare ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2060000-0000-0000-0000-000000000002', 'f1293ad6-c29e-40bb-bfc3-edde080a9594', 'Kiehl''s Facial Fuel Energizing Moisture Treatment for Men 125ml', 'kiehls-facial-fuel-moisturizer-men-125ml', 'Energizing men''s moisturizer', 'Caffeine, vitamin C and chestnut extract energize and hydrate. Non-greasy, fast-absorbing. SPF19 sun protection included.', 14000, NULL, 'published', NOW(), false, ARRAY['mens-moisturizer','energizing','spf','caffeine'], 'MG-SK-001', 'US');

-- === Men's Hair ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2060000-0000-0000-0000-000000000003', 'a46884a0-bce3-437c-a422-28503f336911', 'Kerastase Genesis Homme Bain de Force Quotidien 250ml', 'kerastase-genesis-homme-shampoo-250ml', 'Anti-hair fall shampoo for men', 'Strengthens hair fiber and reduces hair fall caused by breakage. Ginger root and edelweiss flower extracts fortify weakened hair.', 13500, NULL, 'published', NOW(), false, ARRAY['anti-hairfall','men','strengthening'], 'MG-MH-001', 'FR');

-- === Men's Body Care ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2060000-0000-0000-0000-000000000004', 'f1293ad6-c29e-40bb-bfc3-edde080a9594', 'Kiehl''s Body Fuel All-in-One Energizing Wash 250ml', 'kiehls-body-fuel-wash-250ml', 'All-in-one body and hair wash', 'Energizing wash for body and hair with caffeine, menthol and vitamin E. Wakes up and invigorates. Efficient grooming.', 11000, NULL, 'published', NOW(), false, ARRAY['body-wash','all-in-one','energizing','men'], 'MG-BC-001', 'US');

-- === Grooming Sets ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2060000-0000-0000-0000-000000000005', 'dc6e4d7c-b0cf-4802-8c68-ad468eee387a', 'Tom Ford Grooming Essentials Set', 'tom-ford-grooming-essentials-set', 'Complete luxury grooming kit', 'Includes Neroli Portofino shave cream, aftershave balm and beard oil. Premium packaging ideal for gifting.', 48000, NULL, 'published', NOW(), true, ARRAY['grooming-set','luxury','gift','beard'], 'MG-GS-001', 'US');

-- ============ TOOLS & ACCESSORIES ============

-- === Makeup Tools ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2070000-0000-0000-0000-000000000001', 'b20d373d-f604-4f1a-9553-237a0d151faf', 'MAC 217S Blending Brush', 'mac-217s-blending-brush', 'The iconic eyeshadow blending brush', 'Soft synthetic bristles in a tapered dome shape. Perfect for blending eyeshadow seamlessly. A makeup artist essential.', 11000, NULL, 'published', NOW(), true, ARRAY['brush','blending','eyeshadow','pro'], 'TL-MT-001', 'US');

-- === Hair Tools ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2070000-0000-0000-0000-000000000002', '17c3d773-4bfe-4761-bc4f-5a6304b4e4c6', 'Dyson Airwrap Complete Long', 'dyson-airwrap-complete-long', 'Multi-styler with Coanda technology', 'Curl, wave, smooth and dry with no extreme heat. Includes 6 attachments for different styles. Engineered for long hair.', 210000, NULL, 'published', NOW(), true, ARRAY['multi-styler','no-heat','curl','smooth','premium'], 'TL-HT-001', 'GB');

-- === Skincare Devices ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2070000-0000-0000-0000-000000000003', '4f498af1-c7da-437e-8d03-04a175a4dbb4', 'Foreo Luna 4 Facial Cleansing Device', 'foreo-luna-4-cleansing-device', 'Smart facial cleansing and firming', 'T-Sonic pulsations remove 99.5% of dirt and oil. Silicone touchpoints massage and firm skin. App-connected for personalized routines.', 15000, NULL, 'published', NOW(), true, ARRAY['cleansing-device','sonic','smart','silicone'], 'TL-SD-001', 'SE');

-- === Nail Tools ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2070000-0000-0000-0000-000000000004', NULL, 'Professional Manicure Set 12-Piece Stainless Steel', 'professional-manicure-set-12pc', 'Complete stainless steel manicure kit', 'Surgical-grade stainless steel nail clipper, scissors, tweezers, cuticle pusher and more in a leather travel case.', 8500, NULL, 'published', NOW(), false, ARRAY['manicure-set','stainless-steel','travel','professional'], 'TL-NT-001', 'DE');

-- ============ NATURAL & ORGANIC ============

-- === Organic Skincare ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2080000-0000-0000-0000-000000000001', '161b63e3-cef6-4920-a005-3d2469f018dc', 'Shiffa Dubai Oud Luxury Body Oil 100ml', 'shiffa-dubai-oud-body-oil-100ml', 'Luxury organic body oil from Dubai', 'Organic argan, rosehip and oud blend. Nourishes, firms and scents skin with pure Arabian oud. Handmade in Dubai.', 35000, NULL, 'published', NOW(), true, ARRAY['organic','oud','dubai','luxury','handmade'], 'NO-OS-001', 'AE');

-- === Natural Makeup ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2080000-0000-0000-0000-000000000002', '9f02b216-7372-401e-90e4-905496dcfbce', 'Rare Beauty Kind Words Matte Lip Liner', 'rare-beauty-kind-words-lip-liner', 'Clean beauty lip liner', 'Creamy, long-wearing lip liner made with clean ingredients. Vegan and cruelty-free. Defines lips without feathering.', 7500, NULL, 'published', NOW(), false, ARRAY['clean-beauty','vegan','cruelty-free','lip-liner'], 'NO-NM-001', 'US');

-- === Vegan Beauty ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2080000-0000-0000-0000-000000000003', 'a2107bec-4716-43ee-acfb-28eddaedda8d', 'Drunk Elephant Protini Polypeptide Cream 50ml', 'drunk-elephant-protini-polypeptide-50ml', 'Vegan protein-rich moisturizer', 'Signal peptides, growth factors and amino acids in a clean, vegan formula. Improves tone, texture and firmness.', 28000, NULL, 'published', NOW(), false, ARRAY['vegan','peptides','clean-beauty','firming'], 'NO-VB-001', 'US');

-- === Halal Beauty ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2080000-0000-0000-0000-000000000004', '189c3133-1991-4e20-854a-a44e1ab5acb7', 'The Camel Soap Factory Camel Milk Face Cream 50ml', 'camel-soap-factory-face-cream-50ml', 'Halal camel milk skincare', 'UAE-made face cream with camel milk, date seed oil and frankincense. Halal certified, natural ingredients. Rich in vitamins and minerals.', 12000, NULL, 'published', NOW(), true, ARRAY['halal','camel-milk','uae-made','natural'], 'NO-HB-001', 'AE');

-- === Clean Fragrance ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2080000-0000-0000-0000-000000000005', 'ed6bc02c-58d3-4697-adc3-f64670216e18', 'Byredo Rose of No Man''s Land EDP 50ml', 'byredo-rose-of-no-mans-land-edp-50ml', 'Clean rose fragrance', 'Turkish rose, raspberry blossom and papyrus. Clean, cruelty-free and sustainably produced. A modern rose scent.', 72000, NULL, 'published', NOW(), false, ARRAY['clean','rose','sustainable','cruelty-free'], 'NO-CF-001', 'SE');

-- ============ K-BEAUTY & J-BEAUTY ============

-- === Korean Skincare ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2090000-0000-0000-0000-000000000001', 'a9bceb1b-9386-483a-900c-d6cda65951aa', 'COSRX Advanced Snail 96 Mucin Power Essence 100ml', 'cosrx-snail-96-mucin-essence-100ml', 'Cult snail mucin hydrating essence', '96% snail secretion filtrate. Deeply hydrates, repairs damaged skin and improves elasticity. Lightweight, absorbs quickly. K-beauty icon.', 7000, NULL, 'published', NOW(), true, ARRAY['snail-mucin','k-beauty','hydrating','cult-favorite'], 'KB-KS-001', 'KR'),
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2090000-0000-0000-0000-000000000001', '5e713794-33ed-4df9-84ec-56aa390377f5', 'Beauty of Joseon Glow Serum: Propolis + Niacinamide 30ml', 'beauty-of-joseon-glow-serum-30ml', 'Brightening propolis serum', 'Propolis extract and niacinamide brighten, hydrate and soothe. Lightweight texture perfect for humid climates. Incredible value.', 5500, NULL, 'published', NOW(), true, ARRAY['propolis','niacinamide','brightening','value','k-beauty'], 'KB-KS-002', 'KR');

-- === Korean Makeup ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2090000-0000-0000-0000-000000000002', '1c270d8b-2257-4920-b639-58a6f4786ef8', 'Laneige Neo Cushion Glow SPF50 15g', 'laneige-neo-cushion-glow-spf50-15g', 'Dewy cushion foundation with SPF50', 'Ultra-thin, buildable coverage with a dewy glow finish. Blue hyaluronic acid for hydration. SPF50+/PA+++ sun protection.', 16000, NULL, 'published', NOW(), false, ARRAY['cushion','dewy','spf50','k-beauty'], 'KB-KM-001', 'KR');

-- === Japanese Skincare ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2090000-0000-0000-0000-000000000003', 'dca019fd-62da-45f0-9297-48dfd643cf97', 'SK-II Facial Treatment Essence 230ml', 'sk-ii-facial-treatment-essence-230ml', 'The miracle water with 90% Pitera', 'Over 90% Pitera (a naturally-derived ingredient from sake fermentation) transforms skin clarity, texture and radiance. Japan''s #1 prestige skincare.', 95000, NULL, 'published', NOW(), true, ARRAY['pitera','essence','j-beauty','luxury','iconic'], 'KB-JS-001', 'JP');

-- === Japanese Makeup ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2090000-0000-0000-0000-000000000004', '16125687-cfa7-4285-92e2-f72f97b15c63', 'Missha M Perfect Covering BB Cream SPF42 50ml', 'missha-perfect-covering-bb-cream-spf42-50ml', 'Full-coverage BB cream with SPF42', 'Natural-looking coverage with SPF42 PA+++ protection. Lightweight yet covers blemishes and evens skin tone. Multi-functional.', 5000, 6500, 'published', NOW(), false, ARRAY['bb-cream','spf','coverage','value'], 'KB-JM-001', 'KR');

COMMIT;
