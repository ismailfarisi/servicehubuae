-- ============================================================
-- MyPickUAE Beauty & Fragrance Catalog Seed
-- Complete categories, attributes, brands, and mappings
-- ============================================================

BEGIN;

-- ============================================================
-- 1. RENAME ROOT CATEGORY
-- ============================================================
UPDATE categories SET
  name = 'Beauty & Fragrance',
  slug = 'beauty-fragrance',
  description = 'Premium beauty, fragrance, skincare, and grooming products for the UAE market',
  meta_title = 'Beauty & Fragrance | MyPickUAE',
  meta_description = 'Shop luxury beauty, fragrance, skincare, makeup, and grooming products. Halal certified, authentic brands delivered across the UAE.',
  is_featured = true
WHERE id = 'bafb8c75-2ef7-4d27-a275-2cce5838d27c';

-- ============================================================
-- 2. L1 CATEGORIES (depth=1, parent = root)
-- ============================================================
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active, is_featured, meta_title, meta_description) VALUES
-- Fragrance
('a1000000-0000-0000-0000-000000000001', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Fragrance', 'fragrance', 'Luxury perfumes, oud, attars and Arabian fragrances', 1, 'beauty-fragrance/fragrance', 1, true, true, 'Fragrance | MyPickUAE', 'Shop luxury perfumes, oud, attars and designer fragrances'),
-- Skincare
('a1000000-0000-0000-0000-000000000002', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Skincare', 'skincare', 'Cleansers, moisturizers, serums and treatments for every skin type', 1, 'beauty-fragrance/skincare', 2, true, true, 'Skincare | MyPickUAE', 'Premium skincare products for every skin type and concern'),
-- Makeup
('a1000000-0000-0000-0000-000000000003', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Makeup', 'makeup', 'Foundation, lipstick, eyeshadow and complete makeup collections', 1, 'beauty-fragrance/makeup', 3, true, true, 'Makeup | MyPickUAE', 'Shop premium makeup from top beauty brands'),
-- Haircare
('a1000000-0000-0000-0000-000000000004', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Haircare', 'haircare', 'Shampoo, conditioner, treatments and styling for all hair types', 1, 'beauty-fragrance/haircare', 4, true, true, 'Haircare | MyPickUAE', 'Shop haircare products for every hair type'),
-- Bath & Body
('a1000000-0000-0000-0000-000000000005', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Bath & Body', 'bath-body', 'Body wash, lotion, scrubs and pampering essentials', 1, 'beauty-fragrance/bath-body', 5, true, true, 'Bath & Body | MyPickUAE', 'Luxurious bath and body care products'),
-- Men's Grooming
('a1000000-0000-0000-0000-000000000006', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Men''s Grooming', 'mens-grooming', 'Shaving, beard care, skincare and grooming for men', 1, 'beauty-fragrance/mens-grooming', 6, true, true, 'Men''s Grooming | MyPickUAE', 'Premium grooming products for men'),
-- Tools & Accessories
('a1000000-0000-0000-0000-000000000007', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Tools & Accessories', 'tools-accessories', 'Brushes, devices, hair tools and beauty accessories', 1, 'beauty-fragrance/tools-accessories', 7, true, false, 'Beauty Tools | MyPickUAE', 'Professional beauty tools and accessories'),
-- Natural & Organic
('a1000000-0000-0000-0000-000000000008', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'Natural & Organic', 'natural-organic', 'Clean, organic, vegan and halal-certified beauty products', 1, 'beauty-fragrance/natural-organic', 8, true, true, 'Natural & Organic | MyPickUAE', 'Clean, organic and halal beauty products'),
-- K-Beauty & J-Beauty
('a1000000-0000-0000-0000-000000000009', 'bafb8c75-2ef7-4d27-a275-2cce5838d27c', 'K-Beauty & J-Beauty', 'k-beauty-j-beauty', 'Korean and Japanese skincare and makeup innovations', 1, 'beauty-fragrance/k-beauty-j-beauty', 9, true, false, 'K-Beauty & J-Beauty | MyPickUAE', 'Korean and Japanese beauty products');

-- ============================================================
-- 3. L2 CATEGORIES (depth=2)
-- ============================================================

-- === FRAGRANCE L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2010000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Women''s Fragrance', 'womens-fragrance', 'Perfumes and body mists for women', 2, 'beauty-fragrance/fragrance/womens-fragrance', 1, true),
('a2010000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Men''s Fragrance', 'mens-fragrance', 'Colognes and perfumes for men', 2, 'beauty-fragrance/fragrance/mens-fragrance', 2, true),
('a2010000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Unisex Fragrance', 'unisex-fragrance', 'Gender-neutral fragrances', 2, 'beauty-fragrance/fragrance/unisex-fragrance', 3, true),
('a2010000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Arabian Perfumery', 'arabian-perfumery', 'Oud, bakhoor, attars and traditional Arabian scents', 2, 'beauty-fragrance/fragrance/arabian-perfumery', 4, true),
('a2010000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Niche & Designer', 'niche-designer', 'Exclusive niche and luxury designer fragrances', 2, 'beauty-fragrance/fragrance/niche-designer', 5, true),
('a2010000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Fragrance Accessories', 'fragrance-accessories', 'Atomizers, incense burners and discovery sets', 2, 'beauty-fragrance/fragrance/fragrance-accessories', 6, true);

-- === SKINCARE L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2020000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Cleansers & Toners', 'cleansers-toners', 'Face wash, micellar water, toners and cleansing balms', 2, 'beauty-fragrance/skincare/cleansers-toners', 1, true),
('a2020000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Moisturizers', 'moisturizers', 'Day creams, night creams, gel moisturizers and facial oils', 2, 'beauty-fragrance/skincare/moisturizers', 2, true),
('a2020000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Serums & Treatments', 'serums-treatments', 'Vitamin C, retinol, hyaluronic acid and active treatments', 2, 'beauty-fragrance/skincare/serums-treatments', 3, true),
('a2020000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Eye Care', 'eye-care', 'Eye creams, serums and under-eye patches', 2, 'beauty-fragrance/skincare/eye-care', 4, true),
('a2020000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Sun Care', 'sun-care', 'Sunscreen, SPF moisturizers and after-sun care', 2, 'beauty-fragrance/skincare/sun-care', 5, true),
('a2020000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Masks & Treatments', 'masks-treatments', 'Sheet masks, clay masks, overnight masks and peels', 2, 'beauty-fragrance/skincare/masks-treatments', 6, true),
('a2020000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'Lip Care', 'lip-care', 'Lip balm, lip scrub and lip masks', 2, 'beauty-fragrance/skincare/lip-care', 7, true),
('a2020000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Acne & Blemish Care', 'acne-blemish-care', 'Spot treatments, pimple patches and acne cleansers', 2, 'beauty-fragrance/skincare/acne-blemish-care', 8, true),
('a2020000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 'Anti-Aging', 'anti-aging', 'Firming creams, anti-wrinkle serums and neck care', 2, 'beauty-fragrance/skincare/anti-aging', 9, true),
('a2020000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Skincare Sets', 'skincare-sets', 'Curated skincare routine sets and gift sets', 2, 'beauty-fragrance/skincare/skincare-sets', 10, true);

-- === MAKEUP L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2030000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Face Makeup', 'face-makeup', 'Foundation, concealer, primer, blush, bronzer and highlighter', 2, 'beauty-fragrance/makeup/face-makeup', 1, true),
('a2030000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Eye Makeup', 'eye-makeup', 'Eyeshadow, eyeliner, mascara and brow products', 2, 'beauty-fragrance/makeup/eye-makeup', 2, true),
('a2030000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Lip Makeup', 'lip-makeup', 'Lipstick, lip gloss, lip liner and lip stain', 2, 'beauty-fragrance/makeup/lip-makeup', 3, true),
('a2030000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Nail Makeup', 'nail-makeup', 'Nail polish, gel polish, nail art and treatments', 2, 'beauty-fragrance/makeup/nail-makeup', 4, true),
('a2030000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Makeup Sets & Palettes', 'makeup-sets-palettes', 'Curated makeup collections and palettes', 2, 'beauty-fragrance/makeup/makeup-sets-palettes', 5, true),
('a2030000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'Makeup Removers', 'makeup-removers', 'Wipes, oils and balms for makeup removal', 2, 'beauty-fragrance/makeup/makeup-removers', 6, true);

-- === HAIRCARE L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2040000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Shampoo & Conditioner', 'shampoo-conditioner', 'Shampoo, conditioner, co-wash and dry shampoo', 2, 'beauty-fragrance/haircare/shampoo-conditioner', 1, true),
('a2040000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Hair Treatments', 'hair-treatments', 'Hair masks, oils, leave-in conditioner and repair treatments', 2, 'beauty-fragrance/haircare/hair-treatments', 2, true),
('a2040000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Hair Styling', 'hair-styling', 'Spray, gel, wax, mousse and heat protectant', 2, 'beauty-fragrance/haircare/hair-styling', 3, true),
('a2040000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Hair Color', 'hair-color', 'Permanent, semi-permanent color and root touch-up', 2, 'beauty-fragrance/haircare/hair-color', 4, true);

-- === BATH & BODY L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2050000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Body Wash & Shower', 'body-wash-shower', 'Shower gel, body wash, shower oil and bar soap', 2, 'beauty-fragrance/bath-body/body-wash-shower', 1, true),
('a2050000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'Body Moisturizers', 'body-moisturizers', 'Body lotion, cream, butter and oils', 2, 'beauty-fragrance/bath-body/body-moisturizers', 2, true),
('a2050000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'Body Scrubs & Exfoliators', 'body-scrubs-exfoliators', 'Body scrubs and exfoliating treatments', 2, 'beauty-fragrance/bath-body/body-scrubs-exfoliators', 3, true),
('a2050000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Hand & Foot Care', 'hand-foot-care', 'Hand cream, foot cream and cuticle care', 2, 'beauty-fragrance/bath-body/hand-foot-care', 4, true),
('a2050000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Deodorant & Antiperspirant', 'deodorant-antiperspirant', 'Deodorants and antiperspirants', 2, 'beauty-fragrance/bath-body/deodorant-antiperspirant', 5, true),
('a2050000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'Bath Soaks & Bombs', 'bath-soaks-bombs', 'Bath bombs, salts and soaking treatments', 2, 'beauty-fragrance/bath-body/bath-soaks-bombs', 6, true);

-- === MEN'S GROOMING L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2060000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 'Shaving & Beard', 'shaving-beard', 'Razors, shaving cream, beard oil and grooming', 2, 'beauty-fragrance/mens-grooming/shaving-beard', 1, true),
('a2060000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'Men''s Skincare', 'mens-skincare', 'Face wash, moisturizer and treatments for men', 2, 'beauty-fragrance/mens-grooming/mens-skincare', 2, true),
('a2060000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 'Men''s Hair', 'mens-hair', 'Shampoo, pomade and hair loss treatments', 2, 'beauty-fragrance/mens-grooming/mens-hair', 3, true),
('a2060000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 'Men''s Body Care', 'mens-body-care', 'Body wash, deodorant and body lotion for men', 2, 'beauty-fragrance/mens-grooming/mens-body-care', 4, true),
('a2060000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'Grooming Sets', 'grooming-sets', 'Complete grooming kits and gift sets for men', 2, 'beauty-fragrance/mens-grooming/grooming-sets', 5, true);

-- === TOOLS & ACCESSORIES L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2070000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 'Makeup Tools', 'makeup-tools', 'Brushes, sponges, mirrors and makeup bags', 2, 'beauty-fragrance/tools-accessories/makeup-tools', 1, true),
('a2070000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'Hair Tools', 'hair-tools', 'Hair dryers, straighteners, curling irons and brushes', 2, 'beauty-fragrance/tools-accessories/hair-tools', 2, true),
('a2070000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'Skincare Devices', 'skincare-devices', 'Cleansing devices, LED therapy, microcurrent and rollers', 2, 'beauty-fragrance/tools-accessories/skincare-devices', 3, true),
('a2070000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007', 'Nail Tools', 'nail-tools', 'Manicure sets, UV lamps and nail files', 2, 'beauty-fragrance/tools-accessories/nail-tools', 4, true);

-- === NATURAL & ORGANIC L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2080000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'Organic Skincare', 'organic-skincare', 'Certified organic skincare products', 2, 'beauty-fragrance/natural-organic/organic-skincare', 1, true),
('a2080000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 'Natural Makeup', 'natural-makeup', 'Clean and natural makeup products', 2, 'beauty-fragrance/natural-organic/natural-makeup', 2, true),
('a2080000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008', 'Vegan Beauty', 'vegan-beauty', '100% vegan beauty products', 2, 'beauty-fragrance/natural-organic/vegan-beauty', 3, true),
('a2080000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008', 'Halal Beauty', 'halal-beauty', 'Halal-certified beauty and skincare', 2, 'beauty-fragrance/natural-organic/halal-beauty', 4, true),
('a2080000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000008', 'Clean Fragrance', 'clean-fragrance', 'Natural and clean fragrances', 2, 'beauty-fragrance/natural-organic/clean-fragrance', 5, true);

-- === K-BEAUTY & J-BEAUTY L2 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a2090000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'Korean Skincare', 'korean-skincare', 'K-beauty skincare essences, ampoules and sheet masks', 2, 'beauty-fragrance/k-beauty-j-beauty/korean-skincare', 1, true),
('a2090000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009', 'Korean Makeup', 'korean-makeup', 'K-beauty makeup and cushion compacts', 2, 'beauty-fragrance/k-beauty-j-beauty/korean-makeup', 2, true),
('a2090000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000009', 'Japanese Skincare', 'japanese-skincare', 'J-beauty skincare innovations', 2, 'beauty-fragrance/k-beauty-j-beauty/japanese-skincare', 3, true),
('a2090000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000009', 'Japanese Makeup', 'japanese-makeup', 'J-beauty makeup products', 2, 'beauty-fragrance/k-beauty-j-beauty/japanese-makeup', 4, true);

-- ============================================================
-- 4. L3 CATEGORIES (depth=3) - Key subcategories
-- ============================================================

-- === FRAGRANCE > Women's Fragrance L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3011000-0000-0000-0000-000000000001', 'a2010000-0000-0000-0000-000000000001', 'Eau de Parfum', 'womens-edp', 'Women''s Eau de Parfum', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-edp', 1, true),
('a3011000-0000-0000-0000-000000000002', 'a2010000-0000-0000-0000-000000000001', 'Eau de Toilette', 'womens-edt', 'Women''s Eau de Toilette', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-edt', 2, true),
('a3011000-0000-0000-0000-000000000003', 'a2010000-0000-0000-0000-000000000001', 'Parfum & Extrait', 'womens-parfum', 'Women''s pure parfum and extrait', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-parfum', 3, true),
('a3011000-0000-0000-0000-000000000004', 'a2010000-0000-0000-0000-000000000001', 'Body Mist & Splash', 'womens-body-mist', 'Light body mists and splashes', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-body-mist', 4, true),
('a3011000-0000-0000-0000-000000000005', 'a2010000-0000-0000-0000-000000000001', 'Perfume Gift Sets', 'womens-perfume-gift-sets', 'Women''s fragrance gift sets', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-perfume-gift-sets', 5, true),
('a3011000-0000-0000-0000-000000000006', 'a2010000-0000-0000-0000-000000000001', 'Perfume Oils & Attars', 'womens-perfume-oils', 'Concentrated perfume oils for women', 3, 'beauty-fragrance/fragrance/womens-fragrance/womens-perfume-oils', 6, true);

-- === FRAGRANCE > Men's Fragrance L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3012000-0000-0000-0000-000000000001', 'a2010000-0000-0000-0000-000000000002', 'Eau de Parfum', 'mens-edp', 'Men''s Eau de Parfum', 3, 'beauty-fragrance/fragrance/mens-fragrance/mens-edp', 1, true),
('a3012000-0000-0000-0000-000000000002', 'a2010000-0000-0000-0000-000000000002', 'Eau de Toilette', 'mens-edt', 'Men''s Eau de Toilette', 3, 'beauty-fragrance/fragrance/mens-fragrance/mens-edt', 2, true),
('a3012000-0000-0000-0000-000000000003', 'a2010000-0000-0000-0000-000000000002', 'Cologne', 'mens-cologne', 'Men''s Eau de Cologne', 3, 'beauty-fragrance/fragrance/mens-fragrance/mens-cologne', 3, true),
('a3012000-0000-0000-0000-000000000004', 'a2010000-0000-0000-0000-000000000002', 'Deodorant & Body Spray', 'mens-deo-spray', 'Men''s deodorant and body sprays', 3, 'beauty-fragrance/fragrance/mens-fragrance/mens-deo-spray', 4, true),
('a3012000-0000-0000-0000-000000000005', 'a2010000-0000-0000-0000-000000000002', 'Fragrance Gift Sets', 'mens-fragrance-gift-sets', 'Men''s fragrance gift sets', 3, 'beauty-fragrance/fragrance/mens-fragrance/mens-fragrance-gift-sets', 5, true);

-- === FRAGRANCE > Arabian Perfumery L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3014000-0000-0000-0000-000000000001', 'a2010000-0000-0000-0000-000000000004', 'Oud & Bakhoor', 'oud-bakhoor', 'Premium oud wood and bakhoor incense', 3, 'beauty-fragrance/fragrance/arabian-perfumery/oud-bakhoor', 1, true),
('a3014000-0000-0000-0000-000000000002', 'a2010000-0000-0000-0000-000000000004', 'Attar & Concentrated Oils', 'attar-concentrated-oils', 'Traditional attar and concentrated perfume oils', 3, 'beauty-fragrance/fragrance/arabian-perfumery/attar-concentrated-oils', 2, true),
('a3014000-0000-0000-0000-000000000003', 'a2010000-0000-0000-0000-000000000004', 'Bukhoor & Incense', 'bukhoor-incense', 'Bukhoor chips and incense sticks', 3, 'beauty-fragrance/fragrance/arabian-perfumery/bukhoor-incense', 3, true),
('a3014000-0000-0000-0000-000000000004', 'a2010000-0000-0000-0000-000000000004', 'Home Fragrance', 'home-fragrance', 'Diffusers, room sprays and home scents', 3, 'beauty-fragrance/fragrance/arabian-perfumery/home-fragrance', 4, true),
('a3014000-0000-0000-0000-000000000005', 'a2010000-0000-0000-0000-000000000004', 'Incense Burners', 'incense-burners', 'Mabakhir and traditional incense burners', 3, 'beauty-fragrance/fragrance/arabian-perfumery/incense-burners', 5, true);

-- === SKINCARE > Cleansers L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3021000-0000-0000-0000-000000000001', 'a2020000-0000-0000-0000-000000000001', 'Face Wash & Cleansers', 'face-wash-cleansers', 'Daily face washes and cleansers', 3, 'beauty-fragrance/skincare/cleansers-toners/face-wash-cleansers', 1, true),
('a3021000-0000-0000-0000-000000000002', 'a2020000-0000-0000-0000-000000000001', 'Micellar Water', 'micellar-water', 'Gentle micellar cleansing water', 3, 'beauty-fragrance/skincare/cleansers-toners/micellar-water', 2, true),
('a3021000-0000-0000-0000-000000000003', 'a2020000-0000-0000-0000-000000000001', 'Toners & Essences', 'toners-essences', 'Balancing toners and hydrating essences', 3, 'beauty-fragrance/skincare/cleansers-toners/toners-essences', 3, true),
('a3021000-0000-0000-0000-000000000004', 'a2020000-0000-0000-0000-000000000001', 'Exfoliators & Scrubs', 'exfoliators-scrubs', 'Physical and chemical exfoliators', 3, 'beauty-fragrance/skincare/cleansers-toners/exfoliators-scrubs', 4, true);

-- === SKINCARE > Serums L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3023000-0000-0000-0000-000000000001', 'a2020000-0000-0000-0000-000000000003', 'Vitamin C Serums', 'vitamin-c-serums', 'Brightening vitamin C serums', 3, 'beauty-fragrance/skincare/serums-treatments/vitamin-c-serums', 1, true),
('a3023000-0000-0000-0000-000000000002', 'a2020000-0000-0000-0000-000000000003', 'Retinol & Retinoids', 'retinol-retinoids', 'Anti-aging retinol treatments', 3, 'beauty-fragrance/skincare/serums-treatments/retinol-retinoids', 2, true),
('a3023000-0000-0000-0000-000000000003', 'a2020000-0000-0000-0000-000000000003', 'Hyaluronic Acid', 'hyaluronic-acid-serums', 'Hydrating hyaluronic acid serums', 3, 'beauty-fragrance/skincare/serums-treatments/hyaluronic-acid-serums', 3, true),
('a3023000-0000-0000-0000-000000000004', 'a2020000-0000-0000-0000-000000000003', 'Niacinamide Serums', 'niacinamide-serums', 'Pore-refining niacinamide serums', 3, 'beauty-fragrance/skincare/serums-treatments/niacinamide-serums', 4, true),
('a3023000-0000-0000-0000-000000000005', 'a2020000-0000-0000-0000-000000000003', 'AHA & BHA Acids', 'aha-bha-acids', 'Chemical exfoliant treatments', 3, 'beauty-fragrance/skincare/serums-treatments/aha-bha-acids', 5, true);

-- === SKINCARE > Sun Care L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3025000-0000-0000-0000-000000000001', 'a2020000-0000-0000-0000-000000000005', 'Face Sunscreen', 'face-sunscreen', 'SPF protection for the face', 3, 'beauty-fragrance/skincare/sun-care/face-sunscreen', 1, true),
('a3025000-0000-0000-0000-000000000002', 'a2020000-0000-0000-0000-000000000005', 'Body Sunscreen', 'body-sunscreen', 'SPF protection for the body', 3, 'beauty-fragrance/skincare/sun-care/body-sunscreen', 2, true),
('a3025000-0000-0000-0000-000000000003', 'a2020000-0000-0000-0000-000000000005', 'Tinted Sunscreen', 'tinted-sunscreen', 'Tinted SPF for coverage and protection', 3, 'beauty-fragrance/skincare/sun-care/tinted-sunscreen', 3, true),
('a3025000-0000-0000-0000-000000000004', 'a2020000-0000-0000-0000-000000000005', 'After-Sun Care', 'after-sun-care', 'Soothing after-sun treatments', 3, 'beauty-fragrance/skincare/sun-care/after-sun-care', 4, true);

-- === MAKEUP > Face Makeup L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3031000-0000-0000-0000-000000000001', 'a2030000-0000-0000-0000-000000000001', 'Foundation', 'foundation', 'Liquid, powder and stick foundations', 3, 'beauty-fragrance/makeup/face-makeup/foundation', 1, true),
('a3031000-0000-0000-0000-000000000002', 'a2030000-0000-0000-0000-000000000001', 'Concealer', 'concealer', 'Under-eye and blemish concealers', 3, 'beauty-fragrance/makeup/face-makeup/concealer', 2, true),
('a3031000-0000-0000-0000-000000000003', 'a2030000-0000-0000-0000-000000000001', 'Primer', 'primer', 'Face primers for smooth makeup base', 3, 'beauty-fragrance/makeup/face-makeup/primer', 3, true),
('a3031000-0000-0000-0000-000000000004', 'a2030000-0000-0000-0000-000000000001', 'Setting Powder', 'setting-powder', 'Loose and pressed setting powders', 3, 'beauty-fragrance/makeup/face-makeup/setting-powder', 4, true),
('a3031000-0000-0000-0000-000000000005', 'a2030000-0000-0000-0000-000000000001', 'Blush', 'blush', 'Powder, cream and liquid blush', 3, 'beauty-fragrance/makeup/face-makeup/blush', 5, true),
('a3031000-0000-0000-0000-000000000006', 'a2030000-0000-0000-0000-000000000001', 'Bronzer', 'bronzer', 'Matte and shimmer bronzers', 3, 'beauty-fragrance/makeup/face-makeup/bronzer', 6, true),
('a3031000-0000-0000-0000-000000000007', 'a2030000-0000-0000-0000-000000000001', 'Highlighter', 'highlighter', 'Powder and liquid highlighters', 3, 'beauty-fragrance/makeup/face-makeup/highlighter', 7, true),
('a3031000-0000-0000-0000-000000000008', 'a2030000-0000-0000-0000-000000000001', 'Contour', 'contour', 'Contour sticks, powders and palettes', 3, 'beauty-fragrance/makeup/face-makeup/contour', 8, true),
('a3031000-0000-0000-0000-000000000009', 'a2030000-0000-0000-0000-000000000001', 'Setting Spray', 'setting-spray', 'Makeup setting and fixing sprays', 3, 'beauty-fragrance/makeup/face-makeup/setting-spray', 9, true),
('a3031000-0000-0000-0000-000000000010', 'a2030000-0000-0000-0000-000000000001', 'BB & CC Cream', 'bb-cc-cream', 'Tinted moisturizers and colour correcting creams', 3, 'beauty-fragrance/makeup/face-makeup/bb-cc-cream', 10, true);

-- === MAKEUP > Eye Makeup L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3032000-0000-0000-0000-000000000001', 'a2030000-0000-0000-0000-000000000002', 'Eyeshadow Palettes', 'eyeshadow-palettes', 'Multi-shade eyeshadow palettes', 3, 'beauty-fragrance/makeup/eye-makeup/eyeshadow-palettes', 1, true),
('a3032000-0000-0000-0000-000000000002', 'a2030000-0000-0000-0000-000000000002', 'Eyeliner', 'eyeliner', 'Pencil, liquid and gel eyeliners', 3, 'beauty-fragrance/makeup/eye-makeup/eyeliner', 2, true),
('a3032000-0000-0000-0000-000000000003', 'a2030000-0000-0000-0000-000000000002', 'Mascara', 'mascara', 'Volumizing and lengthening mascaras', 3, 'beauty-fragrance/makeup/eye-makeup/mascara', 3, true),
('a3032000-0000-0000-0000-000000000004', 'a2030000-0000-0000-0000-000000000002', 'Eyebrow Products', 'eyebrow-products', 'Brow pencils, gels and pomades', 3, 'beauty-fragrance/makeup/eye-makeup/eyebrow-products', 4, true),
('a3032000-0000-0000-0000-000000000005', 'a2030000-0000-0000-0000-000000000002', 'False Lashes', 'false-lashes', 'Strip lashes and individual lashes', 3, 'beauty-fragrance/makeup/eye-makeup/false-lashes', 5, true);

-- === MAKEUP > Lip Makeup L3 ===
INSERT INTO categories (id, parent_id, name, slug, description, depth, path, sort_order, is_active) VALUES
('a3033000-0000-0000-0000-000000000001', 'a2030000-0000-0000-0000-000000000003', 'Lipstick', 'lipstick', 'Bullet and matte lipsticks', 3, 'beauty-fragrance/makeup/lip-makeup/lipstick', 1, true),
('a3033000-0000-0000-0000-000000000002', 'a2030000-0000-0000-0000-000000000003', 'Liquid Lipstick', 'liquid-lipstick', 'Long-wearing liquid lipsticks', 3, 'beauty-fragrance/makeup/lip-makeup/liquid-lipstick', 2, true),
('a3033000-0000-0000-0000-000000000003', 'a2030000-0000-0000-0000-000000000003', 'Lip Gloss', 'lip-gloss', 'Glossy and shimmer lip gloss', 3, 'beauty-fragrance/makeup/lip-makeup/lip-gloss', 3, true),
('a3033000-0000-0000-0000-000000000004', 'a2030000-0000-0000-0000-000000000003', 'Lip Liner', 'lip-liner', 'Defining lip liners', 3, 'beauty-fragrance/makeup/lip-makeup/lip-liner', 4, true);

COMMIT;
