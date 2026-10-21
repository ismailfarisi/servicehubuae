-- ============================================================
-- MyPickUAE Beauty & Fragrance - Brands
-- ============================================================

BEGIN;

-- === TIER 1: Must-Have Luxury & Designer Fragrance ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Dior', 'dior', 'French luxury fashion and beauty house', true, true, 1),
('Chanel', 'chanel', 'Iconic French luxury brand', true, true, 2),
('Tom Ford', 'tom-ford', 'American luxury designer known for premium fragrances', true, true, 3),
('Creed', 'creed', 'Artisan fragrance house since 1760', true, true, 4),
('YSL', 'ysl', 'Yves Saint Laurent luxury beauty', true, true, 5),
('Giorgio Armani', 'giorgio-armani', 'Italian luxury fashion and beauty', true, true, 6),
('Amouage', 'amouage', 'Omani luxury fragrance house', true, true, 7),
('Maison Francis Kurkdjian', 'mfk', 'Prestigious French perfumery by master perfumer', true, true, 8),
('Charlotte Tilbury', 'charlotte-tilbury', 'British luxury makeup and skincare', true, true, 9),
('MAC', 'mac', 'Professional-quality makeup for all', true, true, 10),
('Huda Beauty', 'huda-beauty', 'Dubai-based global beauty brand', true, true, 11),
('Estee Lauder', 'estee-lauder', 'Prestige skincare and makeup', true, true, 12),
('La Mer', 'la-mer', 'Ultra-luxury skincare', true, true, 13),
('SK-II', 'sk-ii', 'Japanese luxury skincare with Pitera', true, true, 14),
('Fenty Beauty', 'fenty-beauty', 'Inclusive beauty by Rihanna', true, true, 15),
('NARS', 'nars', 'High-fashion beauty brand', true, true, 16),
('Olaplex', 'olaplex', 'Bond-building haircare technology', true, true, 17),
('Dyson', 'dyson', 'Revolutionary hair tools and technology', true, true, 18),
('The Ordinary', 'the-ordinary', 'Clinical skincare at honest prices', true, true, 19),
('CeraVe', 'cerave', 'Dermatologist-developed skincare with ceramides', true, true, 20);

-- === TIER 2: High Demand ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Jo Malone', 'jo-malone', 'British luxury fragrance and candles', true, true, 21),
('Versace', 'versace', 'Italian luxury fashion fragrances', true, false, 22),
('Gucci', 'gucci', 'Italian luxury house fragrances', true, false, 23),
('Prada', 'prada', 'Italian luxury fashion and fragrance', true, false, 24),
('Burberry', 'burberry', 'British luxury heritage brand', true, false, 25),
('Narciso Rodriguez', 'narciso-rodriguez', 'Sophisticated musky fragrances', true, false, 26),
('Carolina Herrera', 'carolina-herrera', 'Venezuelan luxury fashion and fragrance', true, false, 27),
('Parfums de Marly', 'parfums-de-marly', 'Royal French perfumery', true, true, 28),
('Initio Parfums', 'initio', 'Niche fragrance house', true, false, 29),
('Byredo', 'byredo', 'Swedish modern luxury fragrance', true, true, 30),
('Le Labo', 'le-labo', 'Artisanal fine fragrances', true, true, 31),
('Kilian Paris', 'kilian', 'Luxury French niche perfumery', true, true, 32),
('La Prairie', 'la-prairie', 'Swiss luxury skincare', true, true, 33),
('Drunk Elephant', 'drunk-elephant', 'Clean-compatible skincare', true, false, 34),
('Tatcha', 'tatcha', 'Japanese beauty rituals skincare', true, false, 35),
('Clinique', 'clinique', 'Dermatologist-developed skincare and makeup', true, false, 36),
('Lancome', 'lancome', 'French luxury beauty', true, false, 37),
('Kiehls', 'kiehls', 'New York apothecary since 1851', true, false, 38),
('Bobbi Brown', 'bobbi-brown', 'Natural look makeup', true, false, 39),
('Too Faced', 'too-faced', 'Fun, feminine makeup', true, false, 40),
('Urban Decay', 'urban-decay', 'Edgy, bold cosmetics', true, false, 41),
('Benefit Cosmetics', 'benefit', 'Playful cosmetics brand', true, false, 42),
('Anastasia Beverly Hills', 'abh', 'Brow and makeup experts', true, false, 43),
('Rare Beauty', 'rare-beauty', 'Selena Gomez beauty brand', true, true, 44),
('Laura Mercier', 'laura-mercier', 'French-American luxury makeup', true, false, 45),
('Pat McGrath Labs', 'pat-mcgrath', 'Luxury makeup by legendary makeup artist', true, true, 46),
('Moroccanoil', 'moroccanoil', 'Argan oil-infused haircare', true, false, 47),
('Kerastase', 'kerastase', 'Professional luxury haircare', true, false, 48),
('GHD', 'ghd', 'Professional hair styling tools', true, false, 49),
('La Roche-Posay', 'la-roche-posay', 'Dermatological skincare', true, false, 50);

-- === TIER 3: Arabian & Regional Fragrance Houses ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Ajmal', 'ajmal', 'Emirati heritage fragrance house since 1951', true, true, 51),
('Rasasi', 'rasasi', 'UAE-based Oriental and Western fragrances', true, true, 52),
('Arabian Oud', 'arabian-oud', 'World''s largest Arabian fragrance retailer', true, true, 53),
('Swiss Arabian', 'swiss-arabian', 'Arabian perfumery since 1974', true, false, 54),
('Al Haramain', 'al-haramain', 'UAE-based premium perfumery', true, false, 55),
('Lattafa', 'lattafa', 'Popular Arabian fragrance house', true, false, 56),
('Kayali', 'kayali', 'Dubai fragrance brand by Huda Kattan', true, true, 57),
('Abdul Samad Al Qurashi', 'asaq', 'Luxury Arabian heritage perfumery', true, true, 58),
('Hind Al Oud', 'hind-al-oud', 'Emirates luxury oud brand', true, false, 59),
('Ghawali', 'ghawali', 'Artisan Arabian perfumery', true, false, 60),
('Widian', 'widian', 'High-end Arabian fragrance house (AJ Arabia)', true, true, 61),
('SoOud', 'sooud', 'Modern Arabian luxury scents', true, false, 62),
('Lootah Perfumes', 'lootah', 'Heritage UAE perfume brand', true, false, 63),
('Nabeel', 'nabeel', 'Traditional Arabian perfumes', true, false, 64),
('Ard Al Zaafaran', 'ard-al-zaafaran', 'Artisan Arabian fragrance maker', true, false, 65);

-- === TIER 3: Niche Fragrance ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Xerjoff', 'xerjoff', 'Italian luxury niche perfumery', true, false, 66),
('Tiziana Terenzi', 'tiziana-terenzi', 'Italian artisan niche fragrances', true, false, 67),
('Nishane', 'nishane', 'Turkish niche perfume house', true, false, 68),
('Roja Dove', 'roja-dove', 'British luxury niche perfumer', true, false, 69),
('Penhaligons', 'penhaligons', 'British heritage perfumery since 1870', true, false, 70),
('Clive Christian', 'clive-christian', 'British ultra-luxury fragrance', true, false, 71),
('Diptyque', 'diptyque', 'French luxury fragrance and candles', true, false, 72);

-- === TIER 3: Skincare Brands ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Sisley Paris', 'sisley', 'French luxury plant-based skincare', true, false, 73),
('Augustinus Bader', 'augustinus-bader', 'Science-driven luxury skincare', true, false, 74),
('Dr. Barbara Sturm', 'dr-barbara-sturm', 'Molecular cosmetics skincare', true, false, 75),
('Sulwhasoo', 'sulwhasoo', 'Korean luxury herbal skincare', true, false, 76),
('Fresh', 'fresh', 'Natural ingredient skincare', true, false, 77),
('Caudalie', 'caudalie', 'French vineyard-inspired skincare', true, false, 78),
('Paulas Choice', 'paulas-choice', 'Research-backed skincare', true, false, 79),
('Bioderma', 'bioderma', 'French dermatological skincare', true, false, 80),
('Vichy', 'vichy', 'French thermal water skincare', true, false, 81),
('Neutrogena', 'neutrogena', 'Dermatologist-recommended skincare', true, false, 82);

-- === K-Beauty Brands ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('COSRX', 'cosrx', 'Korean skincare with gentle actives', true, false, 83),
('Laneige', 'laneige', 'Korean water science skincare', true, false, 84),
('Innisfree', 'innisfree', 'Korean natural beauty brand', true, false, 85),
('Dr. Jart+', 'dr-jart', 'Korean derma-cosmetics', true, false, 86),
('Some By Mi', 'some-by-mi', 'Korean trouble care skincare', true, false, 87),
('Beauty of Joseon', 'beauty-of-joseon', 'Korean traditional beauty secrets', true, false, 88),
('Missha', 'missha', 'Korean beauty essentials', true, false, 89);

-- === Mass & Mass-Prestige Makeup ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('NYX Professional', 'nyx', 'Affordable professional-quality makeup', true, false, 90),
('Maybelline', 'maybelline', 'Accessible beauty for all', true, false, 91),
('LOreal Paris', 'loreal-paris', 'Global beauty leader', true, false, 92);

-- === Haircare & Tools ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Oribe', 'oribe', 'Luxury haircare and styling', true, false, 93),
('Briogeo', 'briogeo', 'Clean haircare for all textures', true, false, 94),
('T3', 't3', 'Premium hair styling tools', true, false, 95),
('Foreo', 'foreo', 'Swedish beauty tech devices', true, false, 96);

-- === UAE-Local / Regional Brands ===
INSERT INTO brands (name, slug, description, is_active, is_featured, sort_order) VALUES
('Shiffa Dubai', 'shiffa-dubai', 'Luxury natural skincare from Dubai', true, false, 97),
('The Camel Soap Factory', 'camel-soap-factory', 'UAE camel milk beauty products', true, false, 98),
('Hugo Boss', 'hugo-boss', 'German luxury fashion fragrances', true, false, 99),
('Dolce & Gabbana', 'dolce-gabbana', 'Italian luxury fashion and beauty', true, false, 100),
('Valentino', 'valentino', 'Italian haute couture and fragrance', true, false, 101),
('Jean Paul Gaultier', 'jean-paul-gaultier', 'French fashion and iconic fragrances', true, false, 102),
('Montblanc', 'montblanc', 'German luxury brand fragrances', true, false, 103);

COMMIT;
