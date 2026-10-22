-- ============================================================
-- ServiceHubUAE Beauty & Fragrance - Attributes, Values, Brands
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ATTRIBUTES
-- ============================================================

-- === GENERAL FILTERABLE ATTRIBUTES ===
INSERT INTO attributes (id, name, slug, type, is_filterable, is_searchable, is_required, is_variant, sort_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'Gender', 'gender', 'select', true, true, false, false, 1),
('b1000000-0000-0000-0000-000000000002', 'Skin Type', 'skin-type', 'multi_select', true, true, false, false, 2),
('b1000000-0000-0000-0000-000000000003', 'Skin Concern', 'skin-concern', 'multi_select', true, true, false, false, 3),
('b1000000-0000-0000-0000-000000000004', 'Hair Type', 'hair-type', 'multi_select', true, true, false, false, 4),
('b1000000-0000-0000-0000-000000000005', 'Hair Concern', 'hair-concern', 'multi_select', true, true, false, false, 5),
('b1000000-0000-0000-0000-000000000006', 'Coverage', 'coverage', 'select', true, false, false, false, 6),
('b1000000-0000-0000-0000-000000000007', 'Finish', 'finish', 'select', true, false, false, false, 7),
('b1000000-0000-0000-0000-000000000008', 'SPF Level', 'spf-level', 'select', true, true, false, false, 8),
('b1000000-0000-0000-0000-000000000009', 'Fragrance Concentration', 'fragrance-concentration', 'select', true, true, false, false, 9),
('b1000000-0000-0000-0000-000000000010', 'Scent Family', 'scent-family', 'multi_select', true, true, false, false, 10),
('b1000000-0000-0000-0000-000000000011', 'Longevity', 'longevity', 'select', true, false, false, false, 11),
('b1000000-0000-0000-0000-000000000012', 'Sillage', 'sillage', 'select', true, false, false, false, 12),
('b1000000-0000-0000-0000-000000000013', 'Best Season', 'best-season', 'multi_select', true, false, false, false, 13),
('b1000000-0000-0000-0000-000000000014', 'Key Ingredients', 'key-ingredients', 'multi_select', true, true, false, false, 14),
('b1000000-0000-0000-0000-000000000015', 'Formulation', 'formulation', 'select', true, true, false, false, 15),
('b1000000-0000-0000-0000-000000000016', 'Certifications', 'certifications', 'multi_select', true, true, false, false, 16),
('b1000000-0000-0000-0000-000000000017', 'Country of Origin', 'country-of-origin', 'select', true, false, false, false, 17),
('b1000000-0000-0000-0000-000000000018', 'Benefits', 'benefits', 'multi_select', true, true, false, false, 18),
('b1000000-0000-0000-0000-000000000019', 'Water Resistance', 'water-resistance', 'select', true, false, false, false, 19),
('b1000000-0000-0000-0000-000000000020', 'Application Area', 'application-area', 'multi_select', false, false, false, false, 20),
('b1000000-0000-0000-0000-000000000021', 'Occasion', 'occasion', 'multi_select', false, false, false, false, 21),
('b1000000-0000-0000-0000-000000000022', 'Material', 'material', 'select', true, false, false, false, 22),
('b1000000-0000-0000-0000-000000000023', 'Texture', 'texture', 'select', false, false, false, false, 23);

-- === VARIANT ATTRIBUTES ===
INSERT INTO attributes (id, name, slug, type, is_filterable, is_searchable, is_required, is_variant, sort_order) VALUES
('b2000000-0000-0000-0000-000000000001', 'Shade', 'shade', 'color', true, true, false, true, 100),
('b2000000-0000-0000-0000-000000000002', 'Size', 'size', 'select', true, false, false, true, 101),
('b2000000-0000-0000-0000-000000000003', 'Fragrance Size', 'fragrance-size', 'select', true, false, false, true, 102),
('b2000000-0000-0000-0000-000000000004', 'Pack Size', 'pack-size', 'select', true, false, false, true, 103),
('b2000000-0000-0000-0000-000000000005', 'Shade Range', 'shade-range', 'select', true, false, false, true, 104),
('b2000000-0000-0000-0000-000000000006', 'Undertone', 'undertone', 'select', true, false, false, true, 105),
('b2000000-0000-0000-0000-000000000007', 'Scent Variant', 'scent-variant', 'select', false, false, false, true, 106),
('b2000000-0000-0000-0000-000000000008', 'Strength', 'strength', 'select', false, false, false, true, 107);

-- ============================================================
-- 2. ATTRIBUTE VALUES
-- ============================================================

-- === Gender ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'women', 'women', 'Women', 1),
('b1000000-0000-0000-0000-000000000001', 'men', 'men', 'Men', 2),
('b1000000-0000-0000-0000-000000000001', 'unisex', 'unisex', 'Unisex', 3);

-- === Skin Type ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000002', 'normal', 'normal', 'Normal', 1),
('b1000000-0000-0000-0000-000000000002', 'dry', 'dry', 'Dry', 2),
('b1000000-0000-0000-0000-000000000002', 'oily', 'oily', 'Oily', 3),
('b1000000-0000-0000-0000-000000000002', 'combination', 'combination', 'Combination', 4),
('b1000000-0000-0000-0000-000000000002', 'sensitive', 'sensitive', 'Sensitive', 5),
('b1000000-0000-0000-0000-000000000002', 'all-skin-types', 'all-skin-types', 'All Skin Types', 6);

-- === Skin Concern ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000003', 'acne', 'acne', 'Acne', 1),
('b1000000-0000-0000-0000-000000000003', 'aging', 'aging', 'Aging', 2),
('b1000000-0000-0000-0000-000000000003', 'dark-spots', 'dark-spots', 'Dark Spots', 3),
('b1000000-0000-0000-0000-000000000003', 'dullness', 'dullness', 'Dullness', 4),
('b1000000-0000-0000-0000-000000000003', 'dryness', 'dryness', 'Dryness', 5),
('b1000000-0000-0000-0000-000000000003', 'enlarged-pores', 'enlarged-pores', 'Enlarged Pores', 6),
('b1000000-0000-0000-0000-000000000003', 'hyperpigmentation', 'hyperpigmentation', 'Hyperpigmentation', 7),
('b1000000-0000-0000-0000-000000000003', 'redness', 'redness', 'Redness', 8),
('b1000000-0000-0000-0000-000000000003', 'sensitivity', 'sensitivity-concern', 'Sensitivity', 9),
('b1000000-0000-0000-0000-000000000003', 'uneven-texture', 'uneven-texture', 'Uneven Texture', 10),
('b1000000-0000-0000-0000-000000000003', 'fine-lines', 'fine-lines', 'Fine Lines', 11),
('b1000000-0000-0000-0000-000000000003', 'dark-circles', 'dark-circles', 'Dark Circles', 12),
('b1000000-0000-0000-0000-000000000003', 'sun-damage', 'sun-damage', 'Sun Damage', 13);

-- === Hair Type ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000004', 'straight', 'straight', 'Straight', 1),
('b1000000-0000-0000-0000-000000000004', 'wavy', 'wavy', 'Wavy', 2),
('b1000000-0000-0000-0000-000000000004', 'curly', 'curly', 'Curly', 3),
('b1000000-0000-0000-0000-000000000004', 'coily', 'coily', 'Coily', 4),
('b1000000-0000-0000-0000-000000000004', 'all-hair-types', 'all-hair-types', 'All Hair Types', 5);

-- === Hair Concern ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000005', 'damage-repair', 'damage-repair', 'Damage & Repair', 1),
('b1000000-0000-0000-0000-000000000005', 'color-treated', 'color-treated', 'Color-Treated', 2),
('b1000000-0000-0000-0000-000000000005', 'thinning', 'thinning', 'Thinning / Hair Loss', 3),
('b1000000-0000-0000-0000-000000000005', 'dandruff', 'dandruff', 'Dandruff', 4),
('b1000000-0000-0000-0000-000000000005', 'frizz', 'frizz', 'Frizz', 5),
('b1000000-0000-0000-0000-000000000005', 'dryness-hair', 'dryness-hair', 'Dryness', 6),
('b1000000-0000-0000-0000-000000000005', 'oiliness-hair', 'oiliness-hair', 'Oiliness', 7),
('b1000000-0000-0000-0000-000000000005', 'volume', 'volume', 'Volume', 8);

-- === Coverage ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000006', 'sheer', 'sheer', 'Sheer', 1),
('b1000000-0000-0000-0000-000000000006', 'light', 'light', 'Light', 2),
('b1000000-0000-0000-0000-000000000006', 'medium', 'medium', 'Medium', 3),
('b1000000-0000-0000-0000-000000000006', 'full', 'full', 'Full', 4),
('b1000000-0000-0000-0000-000000000006', 'buildable', 'buildable', 'Buildable', 5);

-- === Finish ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000007', 'matte', 'matte', 'Matte', 1),
('b1000000-0000-0000-0000-000000000007', 'satin', 'satin', 'Satin', 2),
('b1000000-0000-0000-0000-000000000007', 'dewy', 'dewy', 'Dewy', 3),
('b1000000-0000-0000-0000-000000000007', 'glossy', 'glossy', 'Glossy', 4),
('b1000000-0000-0000-0000-000000000007', 'natural', 'natural-finish', 'Natural', 5),
('b1000000-0000-0000-0000-000000000007', 'shimmer', 'shimmer', 'Shimmer', 6),
('b1000000-0000-0000-0000-000000000007', 'metallic', 'metallic', 'Metallic', 7),
('b1000000-0000-0000-0000-000000000007', 'radiant', 'radiant', 'Radiant', 8);

-- === SPF Level ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000008', 'spf-15', 'spf-15', 'SPF 15', 1),
('b1000000-0000-0000-0000-000000000008', 'spf-25', 'spf-25', 'SPF 25', 2),
('b1000000-0000-0000-0000-000000000008', 'spf-30', 'spf-30', 'SPF 30', 3),
('b1000000-0000-0000-0000-000000000008', 'spf-40', 'spf-40', 'SPF 40', 4),
('b1000000-0000-0000-0000-000000000008', 'spf-50', 'spf-50', 'SPF 50', 5),
('b1000000-0000-0000-0000-000000000008', 'spf-50-plus', 'spf-50-plus', 'SPF 50+', 6);

-- === Fragrance Concentration ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000009', 'parfum', 'parfum', 'Parfum / Extrait', 1),
('b1000000-0000-0000-0000-000000000009', 'edp', 'edp', 'Eau de Parfum (EDP)', 2),
('b1000000-0000-0000-0000-000000000009', 'edt', 'edt', 'Eau de Toilette (EDT)', 3),
('b1000000-0000-0000-0000-000000000009', 'edc', 'edc', 'Eau de Cologne (EDC)', 4),
('b1000000-0000-0000-0000-000000000009', 'body-mist', 'body-mist', 'Body Mist', 5),
('b1000000-0000-0000-0000-000000000009', 'attar', 'attar', 'Perfume Oil / Attar', 6);

-- === Scent Family ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000010', 'floral', 'floral', 'Floral', 1),
('b1000000-0000-0000-0000-000000000010', 'oriental', 'oriental', 'Oriental', 2),
('b1000000-0000-0000-0000-000000000010', 'woody', 'woody', 'Woody', 3),
('b1000000-0000-0000-0000-000000000010', 'fresh', 'fresh', 'Fresh', 4),
('b1000000-0000-0000-0000-000000000010', 'citrus', 'citrus', 'Citrus', 5),
('b1000000-0000-0000-0000-000000000010', 'aquatic', 'aquatic', 'Aquatic', 6),
('b1000000-0000-0000-0000-000000000010', 'spicy', 'spicy', 'Spicy', 7),
('b1000000-0000-0000-0000-000000000010', 'gourmand', 'gourmand', 'Gourmand', 8),
('b1000000-0000-0000-0000-000000000010', 'oud', 'oud', 'Oud', 9),
('b1000000-0000-0000-0000-000000000010', 'amber', 'amber', 'Amber', 10),
('b1000000-0000-0000-0000-000000000010', 'musk', 'musk', 'Musk', 11),
('b1000000-0000-0000-0000-000000000010', 'fruity', 'fruity', 'Fruity', 12),
('b1000000-0000-0000-0000-000000000010', 'green', 'green', 'Green', 13),
('b1000000-0000-0000-0000-000000000010', 'aromatic', 'aromatic', 'Aromatic', 14),
('b1000000-0000-0000-0000-000000000010', 'powdery', 'powdery', 'Powdery', 15),
('b1000000-0000-0000-0000-000000000010', 'leather', 'leather', 'Leather', 16),
('b1000000-0000-0000-0000-000000000010', 'chypre', 'chypre', 'Chypre', 17);

-- === Longevity ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000011', '1-3-hours', '1-3-hours', '1-3 Hours', 1),
('b1000000-0000-0000-0000-000000000011', '4-6-hours', '4-6-hours', '4-6 Hours', 2),
('b1000000-0000-0000-0000-000000000011', '7-9-hours', '7-9-hours', '7-9 Hours', 3),
('b1000000-0000-0000-0000-000000000011', '10-12-hours', '10-12-hours', '10-12 Hours', 4),
('b1000000-0000-0000-0000-000000000011', '12-plus-hours', '12-plus-hours', '12+ Hours', 5);

-- === Sillage ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000012', 'intimate', 'intimate', 'Intimate', 1),
('b1000000-0000-0000-0000-000000000012', 'moderate', 'moderate', 'Moderate', 2),
('b1000000-0000-0000-0000-000000000012', 'strong', 'strong', 'Strong', 3),
('b1000000-0000-0000-0000-000000000012', 'enormous', 'enormous', 'Enormous', 4);

-- === Best Season ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000013', 'spring', 'spring', 'Spring', 1),
('b1000000-0000-0000-0000-000000000013', 'summer', 'summer', 'Summer', 2),
('b1000000-0000-0000-0000-000000000013', 'fall', 'fall', 'Fall', 3),
('b1000000-0000-0000-0000-000000000013', 'winter', 'winter', 'Winter', 4),
('b1000000-0000-0000-0000-000000000013', 'all-year', 'all-year', 'All Year', 5);

-- === Key Ingredients ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000014', 'hyaluronic-acid', 'hyaluronic-acid', 'Hyaluronic Acid', 1),
('b1000000-0000-0000-0000-000000000014', 'retinol', 'retinol', 'Retinol', 2),
('b1000000-0000-0000-0000-000000000014', 'vitamin-c', 'vitamin-c', 'Vitamin C', 3),
('b1000000-0000-0000-0000-000000000014', 'niacinamide', 'niacinamide', 'Niacinamide', 4),
('b1000000-0000-0000-0000-000000000014', 'salicylic-acid', 'salicylic-acid', 'Salicylic Acid', 5),
('b1000000-0000-0000-0000-000000000014', 'glycolic-acid', 'glycolic-acid', 'Glycolic Acid', 6),
('b1000000-0000-0000-0000-000000000014', 'peptides', 'peptides', 'Peptides', 7),
('b1000000-0000-0000-0000-000000000014', 'ceramides', 'ceramides', 'Ceramides', 8),
('b1000000-0000-0000-0000-000000000014', 'squalane', 'squalane', 'Squalane', 9),
('b1000000-0000-0000-0000-000000000014', 'argan-oil', 'argan-oil', 'Argan Oil', 10),
('b1000000-0000-0000-0000-000000000014', 'centella-asiatica', 'centella-asiatica', 'Centella Asiatica', 11),
('b1000000-0000-0000-0000-000000000014', 'tea-tree', 'tea-tree', 'Tea Tree', 12),
('b1000000-0000-0000-0000-000000000014', 'bakuchiol', 'bakuchiol', 'Bakuchiol', 13),
('b1000000-0000-0000-0000-000000000014', 'snail-mucin', 'snail-mucin', 'Snail Mucin', 14),
('b1000000-0000-0000-0000-000000000014', 'shea-butter', 'shea-butter', 'Shea Butter', 15),
('b1000000-0000-0000-0000-000000000014', 'aloe-vera', 'aloe-vera', 'Aloe Vera', 16),
('b1000000-0000-0000-0000-000000000014', 'oud-ingredient', 'oud-ingredient', 'Oud', 17),
('b1000000-0000-0000-0000-000000000014', 'rose', 'rose', 'Rose', 18),
('b1000000-0000-0000-0000-000000000014', 'saffron', 'saffron', 'Saffron', 19),
('b1000000-0000-0000-0000-000000000014', 'camel-milk', 'camel-milk', 'Camel Milk', 20),
('b1000000-0000-0000-0000-000000000014', 'black-seed', 'black-seed', 'Black Seed / Nigella', 21),
('b1000000-0000-0000-0000-000000000014', 'date-seed-oil', 'date-seed-oil', 'Date Seed Oil', 22);

-- === Formulation ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000015', 'cream', 'cream', 'Cream', 1),
('b1000000-0000-0000-0000-000000000015', 'gel', 'gel', 'Gel', 2),
('b1000000-0000-0000-0000-000000000015', 'lotion', 'lotion', 'Lotion', 3),
('b1000000-0000-0000-0000-000000000015', 'serum', 'serum', 'Serum', 4),
('b1000000-0000-0000-0000-000000000015', 'oil', 'oil', 'Oil', 5),
('b1000000-0000-0000-0000-000000000015', 'foam', 'foam', 'Foam', 6),
('b1000000-0000-0000-0000-000000000015', 'spray', 'spray', 'Spray', 7),
('b1000000-0000-0000-0000-000000000015', 'balm', 'balm', 'Balm', 8),
('b1000000-0000-0000-0000-000000000015', 'stick', 'stick', 'Stick', 9),
('b1000000-0000-0000-0000-000000000015', 'powder', 'powder', 'Powder', 10),
('b1000000-0000-0000-0000-000000000015', 'liquid', 'liquid', 'Liquid', 11),
('b1000000-0000-0000-0000-000000000015', 'mousse', 'mousse', 'Mousse', 12),
('b1000000-0000-0000-0000-000000000015', 'mist', 'mist', 'Mist', 13),
('b1000000-0000-0000-0000-000000000015', 'cushion', 'cushion', 'Cushion', 14);

-- === Certifications ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000016', 'halal', 'halal', 'Halal Certified', 1),
('b1000000-0000-0000-0000-000000000016', 'cruelty-free', 'cruelty-free', 'Cruelty-Free', 2),
('b1000000-0000-0000-0000-000000000016', 'vegan', 'vegan', 'Vegan', 3),
('b1000000-0000-0000-0000-000000000016', 'organic', 'organic', 'Organic', 4),
('b1000000-0000-0000-0000-000000000016', 'dermatologist-tested', 'dermatologist-tested', 'Dermatologist-Tested', 5),
('b1000000-0000-0000-0000-000000000016', 'hypoallergenic', 'hypoallergenic', 'Hypoallergenic', 6),
('b1000000-0000-0000-0000-000000000016', 'non-comedogenic', 'non-comedogenic', 'Non-Comedogenic', 7),
('b1000000-0000-0000-0000-000000000016', 'paraben-free', 'paraben-free', 'Paraben-Free', 8),
('b1000000-0000-0000-0000-000000000016', 'sulfate-free', 'sulfate-free', 'Sulfate-Free', 9),
('b1000000-0000-0000-0000-000000000016', 'fragrance-free', 'fragrance-free', 'Fragrance-Free', 10),
('b1000000-0000-0000-0000-000000000016', 'alcohol-free', 'alcohol-free', 'Alcohol-Free', 11);

-- === Country of Origin ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000017', 'france', 'france', 'France', 1),
('b1000000-0000-0000-0000-000000000017', 'italy', 'italy', 'Italy', 2),
('b1000000-0000-0000-0000-000000000017', 'uae', 'uae', 'UAE', 3),
('b1000000-0000-0000-0000-000000000017', 'south-korea', 'south-korea', 'South Korea', 4),
('b1000000-0000-0000-0000-000000000017', 'japan', 'japan', 'Japan', 5),
('b1000000-0000-0000-0000-000000000017', 'usa', 'usa', 'USA', 6),
('b1000000-0000-0000-0000-000000000017', 'uk', 'uk', 'UK', 7),
('b1000000-0000-0000-0000-000000000017', 'oman', 'oman', 'Oman', 8),
('b1000000-0000-0000-0000-000000000017', 'saudi-arabia', 'saudi-arabia', 'Saudi Arabia', 9),
('b1000000-0000-0000-0000-000000000017', 'germany', 'germany', 'Germany', 10),
('b1000000-0000-0000-0000-000000000017', 'spain', 'spain', 'Spain', 11),
('b1000000-0000-0000-0000-000000000017', 'morocco', 'morocco', 'Morocco', 12);

-- === Benefits ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000018', 'hydrating', 'hydrating', 'Hydrating', 1),
('b1000000-0000-0000-0000-000000000018', 'brightening', 'brightening', 'Brightening', 2),
('b1000000-0000-0000-0000-000000000018', 'anti-aging-benefit', 'anti-aging-benefit', 'Anti-Aging', 3),
('b1000000-0000-0000-0000-000000000018', 'pore-minimizing', 'pore-minimizing', 'Pore-Minimizing', 4),
('b1000000-0000-0000-0000-000000000018', 'smoothing', 'smoothing', 'Smoothing', 5),
('b1000000-0000-0000-0000-000000000018', 'volumizing', 'volumizing', 'Volumizing', 6),
('b1000000-0000-0000-0000-000000000018', 'strengthening', 'strengthening', 'Strengthening', 7),
('b1000000-0000-0000-0000-000000000018', 'color-protecting', 'color-protecting', 'Color-Protecting', 8),
('b1000000-0000-0000-0000-000000000018', 'oil-control', 'oil-control', 'Oil-Control', 9),
('b1000000-0000-0000-0000-000000000018', 'soothing', 'soothing', 'Soothing', 10),
('b1000000-0000-0000-0000-000000000018', 'firming', 'firming', 'Firming', 11);

-- === Water Resistance ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000019', 'waterproof', 'waterproof', 'Waterproof', 1),
('b1000000-0000-0000-0000-000000000019', 'water-resistant', 'water-resistant', 'Water-Resistant', 2),
('b1000000-0000-0000-0000-000000000019', 'not-water-resistant', 'not-water-resistant', 'Not Water-Resistant', 3);

-- === Material (for tools) ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b1000000-0000-0000-0000-000000000022', 'stainless-steel', 'stainless-steel', 'Stainless Steel', 1),
('b1000000-0000-0000-0000-000000000022', 'titanium', 'titanium', 'Titanium', 2),
('b1000000-0000-0000-0000-000000000022', 'ceramic', 'ceramic', 'Ceramic', 3),
('b1000000-0000-0000-0000-000000000022', 'synthetic-bristle', 'synthetic-bristle', 'Synthetic', 4),
('b1000000-0000-0000-0000-000000000022', 'natural-hair-bristle', 'natural-hair-bristle', 'Natural Hair', 5),
('b1000000-0000-0000-0000-000000000022', 'silicone', 'silicone', 'Silicone', 6);

-- === VARIANT: Shade Range ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000005', 'fair', 'fair', 'Fair', 1),
('b2000000-0000-0000-0000-000000000005', 'light-shade', 'light-shade', 'Light', 2),
('b2000000-0000-0000-0000-000000000005', 'light-medium', 'light-medium', 'Light-Medium', 3),
('b2000000-0000-0000-0000-000000000005', 'medium-shade', 'medium-shade', 'Medium', 4),
('b2000000-0000-0000-0000-000000000005', 'medium-dark', 'medium-dark', 'Medium-Dark', 5),
('b2000000-0000-0000-0000-000000000005', 'dark', 'dark', 'Dark', 6),
('b2000000-0000-0000-0000-000000000005', 'deep', 'deep', 'Deep', 7);

-- === VARIANT: Undertone ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000006', 'cool', 'cool', 'Cool', 1),
('b2000000-0000-0000-0000-000000000006', 'warm', 'warm', 'Warm', 2),
('b2000000-0000-0000-0000-000000000006', 'neutral-tone', 'neutral-tone', 'Neutral', 3),
('b2000000-0000-0000-0000-000000000006', 'olive', 'olive', 'Olive', 4);

-- === VARIANT: Size ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000002', '15ml', '15ml', '15ml', 1),
('b2000000-0000-0000-0000-000000000002', '30ml', '30ml', '30ml', 2),
('b2000000-0000-0000-0000-000000000002', '50ml', '50ml', '50ml', 3),
('b2000000-0000-0000-0000-000000000002', '75ml', '75ml', '75ml', 4),
('b2000000-0000-0000-0000-000000000002', '100ml', '100ml', '100ml', 5),
('b2000000-0000-0000-0000-000000000002', '150ml', '150ml', '150ml', 6),
('b2000000-0000-0000-0000-000000000002', '200ml', '200ml', '200ml', 7),
('b2000000-0000-0000-0000-000000000002', '250ml', '250ml', '250ml', 8),
('b2000000-0000-0000-0000-000000000002', '500ml', '500ml', '500ml', 9),
('b2000000-0000-0000-0000-000000000002', '1l', '1l', '1L', 10),
('b2000000-0000-0000-0000-000000000002', '30g', '30g', '30g', 11),
('b2000000-0000-0000-0000-000000000002', '50g', '50g', '50g', 12),
('b2000000-0000-0000-0000-000000000002', '100g', '100g', '100g', 13);

-- === VARIANT: Fragrance Size ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000003', '5ml-travel', '5ml-travel', '5ml (Travel)', 1),
('b2000000-0000-0000-0000-000000000003', '10ml-frag', '10ml-frag', '10ml', 2),
('b2000000-0000-0000-0000-000000000003', '30ml-frag', '30ml-frag', '30ml', 3),
('b2000000-0000-0000-0000-000000000003', '50ml-frag', '50ml-frag', '50ml', 4),
('b2000000-0000-0000-0000-000000000003', '75ml-frag', '75ml-frag', '75ml', 5),
('b2000000-0000-0000-0000-000000000003', '100ml-frag', '100ml-frag', '100ml', 6),
('b2000000-0000-0000-0000-000000000003', '125ml-frag', '125ml-frag', '125ml', 7),
('b2000000-0000-0000-0000-000000000003', '150ml-frag', '150ml-frag', '150ml', 8),
('b2000000-0000-0000-0000-000000000003', '200ml-frag', '200ml-frag', '200ml', 9);

-- === VARIANT: Pack Size ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000004', 'single', 'single', 'Single', 1),
('b2000000-0000-0000-0000-000000000004', 'duo', 'duo', 'Duo', 2),
('b2000000-0000-0000-0000-000000000004', '3-pack', '3-pack', '3-Pack', 3),
('b2000000-0000-0000-0000-000000000004', '6-pack', '6-pack', '6-Pack', 4);

-- === VARIANT: Strength ===
INSERT INTO attribute_values (attribute_id, value, slug, display_value, sort_order) VALUES
('b2000000-0000-0000-0000-000000000008', 'gentle', 'gentle', 'Gentle / 0.25%', 1),
('b2000000-0000-0000-0000-000000000008', 'regular', 'regular', 'Regular / 0.5%', 2),
('b2000000-0000-0000-0000-000000000008', 'strong-strength', 'strong-strength', 'Strong / 1%', 3);

COMMIT;
