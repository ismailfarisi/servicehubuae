-- Products: Makeup categories
BEGIN;

-- === Foundation ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3031000-0000-0000-0000-000000000001', 'd1afb09d-7c76-4184-bd92-733dcb0cc3b3', 'Charlotte Tilbury Airbrush Flawless Foundation 30ml', 'charlotte-tilbury-airbrush-foundation-30ml', 'Full coverage longwear foundation', '16-hour wear, sweatproof and humidity-proof. Smooths, perfects and blurs pores. 44 shades for every skin tone. Perfect for UAE climate.', 18500, NULL, 'published', NOW(), true, ARRAY['full-coverage','longwear','sweatproof','40-shades'], 'MK-FD-001', 'GB'),
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3031000-0000-0000-0000-000000000001', '006f5d43-95ea-4cb1-84e8-1783755de4b2', 'Fenty Beauty Pro Filt''r Soft Matte Foundation 32ml', 'fenty-pro-filtr-soft-matte-32ml', 'Inclusive 50-shade foundation', 'Oil-free soft matte finish in 50 shades. Climate-adaptive technology resists sweat and humidity. Buildable medium to full coverage.', 16500, NULL, 'published', NOW(), true, ARRAY['inclusive','matte','oil-free','50-shades'], 'MK-FD-002', 'US');

-- === Concealer ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3031000-0000-0000-0000-000000000002', '846744b9-29c9-4c0b-9886-0827aec8029d', 'NARS Radiant Creamy Concealer 6ml', 'nars-radiant-creamy-concealer-6ml', 'Award-winning medium-to-full coverage concealer', 'Multi-action formula brightens, corrects and smooths. 30 shades with botanical blend to hydrate and nourish under-eye area.', 14000, NULL, 'published', NOW(), true, ARRAY['concealer','radiant','under-eye','award-winning'], 'MK-CC-001', 'FR');

-- === Primer ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3031000-0000-0000-0000-000000000003', 'd756e09b-5b2c-404f-a582-dac10d4e1640', 'Too Faced Hangover Replenishing Primer 40ml', 'too-faced-hangover-primer-40ml', 'Hydrating coconut water primer', 'Coconut water, probiotics and peptides create a dewy, hydrated base. Smooths skin and extends makeup wear. Smells like coconuts.', 14500, NULL, 'published', NOW(), false, ARRAY['hydrating','coconut','dewy','primer'], 'MK-PR-001', 'US');

-- === Setting Powder ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3031000-0000-0000-0000-000000000004', 'd1884e2e-e3b6-4017-9d5b-21cf51be3018', 'Laura Mercier Translucent Loose Setting Powder 29g', 'laura-mercier-translucent-powder-29g', 'The iconic setting powder', 'Sets makeup to a flawless, matte finish with an invisible look. Lightweight and silky. A professional and consumer Holy Grail product.', 16500, NULL, 'published', NOW(), true, ARRAY['setting-powder','matte','iconic','holy-grail'], 'MK-SP-001', 'US');

-- === Blush ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3031000-0000-0000-0000-000000000005', '9f02b216-7372-401e-90e4-905496dcfbce', 'Rare Beauty Soft Pinch Liquid Blush 7.5ml', 'rare-beauty-soft-pinch-liquid-blush-7.5ml', 'Viral weightless liquid blush', 'Ultra-pigmented, weightless, long-lasting liquid blush. A tiny dot gives a natural flush. 12 matte and dewy shades. TikTok sensation.', 9500, NULL, 'published', NOW(), true, ARRAY['viral','liquid-blush','weightless','tiktok'], 'MK-BL-001', 'US');

-- === Bronzer ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3031000-0000-0000-0000-000000000006', '81014958-4bb4-4ed9-bd6c-0350ec9099f4', 'Huda Beauty GloWish Soft Radiance Bronzing Powder 10g', 'huda-glowish-bronzer-10g', 'Natural-looking radiant bronzer', 'Ultra-soft bronzer with micro-shimmer for a natural sun-kissed glow. Available in 8 shades for fair to deep skin tones.', 13000, NULL, 'published', NOW(), false, ARRAY['bronzer','natural','sun-kissed','dubai'], 'MK-BR-001', 'IT');

-- === Concealer (already done), Highlighter ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3031000-0000-0000-0000-000000000007', '006f5d43-95ea-4cb1-84e8-1783755de4b2', 'Fenty Beauty Killawatt Freestyle Highlighter Duo', 'fenty-killawatt-highlighter-duo', 'Dual-shade shimmer highlighter', 'Two complementary highlighter shades in one compact. Creamy powder formula blends seamlessly for a custom glow.', 14500, NULL, 'published', NOW(), false, ARRAY['highlighter','duo','glow','shimmer'], 'MK-HL-001', 'US');

-- === Contour ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3031000-0000-0000-0000-000000000008', 'd1afb09d-7c76-4184-bd92-733dcb0cc3b3', 'Charlotte Tilbury Hollywood Contour Wand', 'charlotte-tilbury-contour-wand', 'Liquid contour with buildable coverage', 'A cream-to-powder contour wand that sculpts, shapes and defines. Blends effortlessly and lasts all day. 5 shades.', 15500, NULL, 'published', NOW(), false, ARRAY['contour','liquid','sculpt','longwear'], 'MK-CT-001', 'GB');

-- === Setting Spray ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3031000-0000-0000-0000-000000000009', 'ea2bed95-36f6-4819-8ce7-cc25209053e5', 'Urban Decay All Nighter Long-Lasting Setting Spray 118ml', 'urban-decay-all-nighter-setting-spray-118ml', 'The OG setting spray for 16-hour wear', 'Temperature control technology keeps makeup looking fresh in heat and humidity. Essential for UAE weather. Won''t melt, fade or settle.', 14500, NULL, 'published', NOW(), true, ARRAY['setting-spray','16-hour','humidity-proof','essential'], 'MK-SS-001', 'US');

-- === BB & CC Cream ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3031000-0000-0000-0000-000000000010', 'bed4ca12-8c03-41f8-95a0-43f80a520ebf', 'Clinique Moisture Surge Tinted Moisturizer SPF15 30ml', 'clinique-moisture-surge-tinted-moisturizer-30ml', 'Tinted moisturizer with SPF', 'Lightweight, oil-free tinted moisturizer with SPF15. Evens skin tone while providing hydration. 8 shades.', 14000, NULL, 'published', NOW(), false, ARRAY['bb-cream','tinted','spf','lightweight'], 'MK-BB-001', 'US');

-- === Eyeshadow Palettes ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3032000-0000-0000-0000-000000000001', '81014958-4bb4-4ed9-bd6c-0350ec9099f4', 'Huda Beauty Rose Gold Remastered Palette', 'huda-beauty-rose-gold-remastered', 'Iconic 18-shade eyeshadow palette', '18 shades in matte, shimmer and glitter finishes. Rich pigmentation, blendable textures. The palette that launched a beauty empire.', 26000, NULL, 'published', NOW(), true, ARRAY['palette','rose-gold','iconic','pigmented','dubai'], 'MK-EP-001', 'IT');

-- === Eyeliner ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3032000-0000-0000-0000-000000000002', 'b20d373d-f604-4f1a-9553-237a0d151faf', 'MAC Pro Longwear Fluidline Gel Eyeliner 3g', 'mac-pro-longwear-fluidline-gel-3g', 'Waterproof gel eyeliner', 'Silky gel formula glides on smoothly and sets to a smudge-proof, waterproof finish. 12-hour wear. A makeup artist staple.', 8500, NULL, 'published', NOW(), false, ARRAY['gel-liner','waterproof','pro','longwear'], 'MK-EL-001', 'US');

-- === Mascara ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3032000-0000-0000-0000-000000000003', '5057a7ca-f601-4fba-8efb-7bb0f82aa36c', 'Lancome Lash Idole Mascara', 'lancome-lash-idole-mascara', 'Volumizing and lengthening mascara', 'Unique bent wand coats every lash from root to tip. Buildable volume, dramatic length, no clumps. 24-hour wear.', 12000, NULL, 'published', NOW(), true, ARRAY['mascara','volume','length','24-hour'], 'MK-MA-001', 'FR');

-- === Eyebrow Products ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3032000-0000-0000-0000-000000000004', '50791362-e01b-4ca4-b4fb-049910e0f496', 'Anastasia Beverly Hills Brow Wiz', 'abh-brow-wiz', 'Ultra-slim precision brow pencil', 'Hair-like strokes with ultra-thin 0.003" tip. Includes spoolie brush. 12 shades for natural-looking defined brows.', 10000, NULL, 'published', NOW(), true, ARRAY['brows','precision','hair-stroke','bestseller'], 'MK-EB-001', 'US');

-- === False Lashes ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3032000-0000-0000-0000-000000000005', '81014958-4bb4-4ed9-bd6c-0350ec9099f4', 'Huda Beauty Classic Lash Samantha #7', 'huda-beauty-lash-samantha-7', 'Glamorous false lashes', 'Handmade lashes with dramatic volume and a wispy finish. Flexible band for comfortable all-day wear. Reusable up to 15 times.', 7500, NULL, 'published', NOW(), false, ARRAY['false-lashes','dramatic','wispy','reusable'], 'MK-FL-001', 'ID');

-- === Lipstick ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3033000-0000-0000-0000-000000000001', 'b20d373d-f604-4f1a-9553-237a0d151faf', 'MAC Matte Lipstick - Ruby Woo 3g', 'mac-matte-lipstick-ruby-woo-3g', 'The world''s best-selling red lipstick', 'Vivid red with blue undertone in iconic matte finish. Intense color payoff with a retro matte texture. A timeless classic.', 9500, NULL, 'published', NOW(), true, ARRAY['red-lipstick','matte','iconic','bestseller'], 'MK-LS-001', 'US');

-- === Liquid Lipstick ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a3033000-0000-0000-0000-000000000002', '81014958-4bb4-4ed9-bd6c-0350ec9099f4', 'Huda Beauty Power Bullet Matte Lipstick', 'huda-power-bullet-matte-lipstick', 'Ultra-pigmented matte liquid lip', 'Creamy matte formula that doesn''t dry out lips. Full coverage in one swipe. 20 wearable everyday shades.', 10000, NULL, 'published', NOW(), false, ARRAY['liquid-lipstick','matte','pigmented','dubai'], 'MK-LL-001', 'IT');

-- === Lip Gloss ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a3033000-0000-0000-0000-000000000003', '006f5d43-95ea-4cb1-84e8-1783755de4b2', 'Fenty Beauty Gloss Bomb Universal Lip Luminizer', 'fenty-gloss-bomb-universal', 'The universally flattering lip gloss', 'Non-sticky formula with shea butter. Rose nude shade looks amazing on every skin tone. Subtle shimmer and vanilla scent.', 8500, NULL, 'published', NOW(), true, ARRAY['lip-gloss','universal','non-sticky','shimmer'], 'MK-LG-001', 'US');

-- === Lip Liner ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a3033000-0000-0000-0000-000000000004', 'd1afb09d-7c76-4184-bd92-733dcb0cc3b3', 'Charlotte Tilbury Lip Cheat Lip Liner - Pillow Talk', 'charlotte-tilbury-lip-cheat-pillow-talk', 'The best-selling nude lip liner', 'Creamy, long-lasting formula that defines and shapes lips. Pillow Talk is the universally flattering nude-pink shade. A global bestseller.', 9500, NULL, 'published', NOW(), true, ARRAY['lip-liner','pillow-talk','nude','bestseller'], 'MK-LL-002', 'GB');

-- === Makeup Removers ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('5467e451-2049-4fcd-8267-7f94af189921', 'a2030000-0000-0000-0000-000000000006', '5057a7ca-f601-4fba-8efb-7bb0f82aa36c', 'Lancome Bi-Facil Double Action Eye Makeup Remover 125ml', 'lancome-bi-facil-eye-remover-125ml', 'Gentle yet effective eye makeup remover', 'Dual-phase formula removes waterproof makeup without rubbing. Oil-free, fragrance-free, ophthalmologist-tested. A classic.', 11000, NULL, 'published', NOW(), false, ARRAY['makeup-remover','eye','gentle','waterproof'], 'MK-MR-001', 'FR');

-- === Makeup Sets & Palettes ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('3f345253-a546-427f-bf0d-2efec0288c12', 'a2030000-0000-0000-0000-000000000005', 'd1afb09d-7c76-4184-bd92-733dcb0cc3b3', 'Charlotte Tilbury Pillow Talk Dreams Come True Set', 'charlotte-tilbury-pillow-talk-dreams-set', 'Complete Pillow Talk makeup collection', 'Includes Pillow Talk lipstick, liner, blush and setting spray. Everything you need for the signature CT look. Gift-ready packaging.', 25000, 30000, 'published', NOW(), true, ARRAY['set','gift','pillow-talk','value'], 'MK-SET-001', 'GB');

-- === Nail Makeup ===
INSERT INTO products (vendor_id, category_id, brand_id, name, slug, short_description, description, price, compare_at_price, status, published_at, is_featured, tags, sku, country_of_origin) VALUES
('69241f42-33b6-41c5-8804-0fdb4507c293', 'a2030000-0000-0000-0000-000000000004', '17793a90-1d79-455d-a591-ab009a328884', 'Dior Vernis Nail Lacquer 10ml', 'dior-vernis-nail-lacquer-10ml', 'Luxury gel-effect nail polish', 'Couture color with gel-effect shine. Long-wearing, chip-resistant formula. Enriched with bioceramide. 40+ shades.', 12500, NULL, 'published', NOW(), false, ARRAY['nail-polish','gel-effect','luxury','couture'], 'MK-NL-001', 'FR');

COMMIT;
