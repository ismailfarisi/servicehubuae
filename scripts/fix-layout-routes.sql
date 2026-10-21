BEGIN;

-- 1. Fix hero_carousel - correct CTA links to match actual category slugs
UPDATE layout_sections SET blocks = '[
  {"id":"slide-1","type":"slide","data":{"title":{"en":"Luxury Fragrances","ar":"عطور فاخرة"},"cta_text":{"en":"Explore Scents","ar":"اكتشف العطور"},"cta_link":"/c/fragrance","image":{"desktop":{"url":"https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&h=640&fit=crop&crop=center&q=85","width":1920,"height":640},"mobile":{"url":"https://images.unsplash.com/photo-1541643600914-78b084683601?w=1080&h=1350&fit=crop&crop=center&q=85","width":1080,"height":1350},"alt":{"en":"Luxury Fragrances Collection","ar":"مجموعة العطور الفاخرة"},"focal_point":{"x":0.5,"y":0.45}}}},
  {"id":"slide-2","type":"slide","data":{"title":{"en":"Skincare Essentials","ar":"أساسيات العناية بالبشرة"},"cta_text":{"en":"Shop Skincare","ar":"تسوق العناية"},"cta_link":"/c/skincare","image":{"desktop":{"url":"https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=1920&h=640&fit=crop&crop=center&q=85","width":1920,"height":640},"mobile":{"url":"https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=1080&h=1350&fit=crop&crop=center&q=85","width":1080,"height":1350},"alt":{"en":"Skincare Essentials","ar":"أساسيات العناية بالبشرة"},"focal_point":{"x":0.5,"y":0.3}}}},
  {"id":"slide-3","type":"slide","data":{"title":{"en":"Makeup Must-Haves","ar":"مكياج لا غنى عنه"},"cta_text":{"en":"Shop Makeup","ar":"تسوق المكياج"},"cta_link":"/c/makeup","image":{"desktop":{"url":"https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1920&h=640&fit=crop&crop=center&q=85","width":1920,"height":640},"mobile":{"url":"https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1080&h=1350&fit=crop&crop=center&q=85","width":1080,"height":1350},"alt":{"en":"Makeup Must-Haves","ar":"مكياج لا غنى عنه"},"focal_point":{"x":0.5,"y":0.5}}}},
  {"id":"slide-4","type":"slide","data":{"title":{"en":"Arabian Perfumery","ar":"العطور العربية"},"cta_text":{"en":"Discover Oud","ar":"اكتشف العود"},"cta_link":"/c/arabian-perfumery","image":{"desktop":{"url":"https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=1920&h=640&fit=crop&crop=center&q=85","width":1920,"height":640},"mobile":{"url":"https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=1080&h=1350&fit=crop&crop=center&q=85","width":1080,"height":1350},"alt":{"en":"Arabian Perfumery","ar":"العطور العربية"},"focal_point":{"x":0.5,"y":0.5}}}}
]'::jsonb,
updated_at = NOW()
WHERE id = 'ff707aa9-6829-41a0-abf3-fa843cf540d5';

-- 2. Fix category_grid - all 9 L1 categories with correct slugs
UPDATE layout_sections SET blocks = '[
  {"id":"cat-fragrance","type":"category_card","data":{"name":{"en":"Fragrance","ar":"العطور"},"link":"/c/fragrance","image_url":"https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-skincare","type":"category_card","data":{"name":{"en":"Skincare","ar":"العناية بالبشرة"},"link":"/c/skincare","image_url":"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-makeup","type":"category_card","data":{"name":{"en":"Makeup","ar":"مكياج"},"link":"/c/makeup","image_url":"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-haircare","type":"category_card","data":{"name":{"en":"Haircare","ar":"العناية بالشعر"},"link":"/c/haircare","image_url":"https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-bath-body","type":"category_card","data":{"name":{"en":"Bath & Body","ar":"الاستحمام والجسم"},"link":"/c/bath-body","image_url":"https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-mens-grooming","type":"category_card","data":{"name":{"en":"Men''s Grooming","ar":"العناية بالرجل"},"link":"/c/mens-grooming","image_url":"https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-tools","type":"category_card","data":{"name":{"en":"Tools & Accessories","ar":"الأدوات والإكسسوارات"},"link":"/c/tools-accessories","image_url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-natural","type":"category_card","data":{"name":{"en":"Natural & Organic","ar":"طبيعي وعضوي"},"link":"/c/natural-organic","image_url":"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=80"}},
  {"id":"cat-kbeauty","type":"category_card","data":{"name":{"en":"K-Beauty & J-Beauty","ar":"الجمال الكوري والياباني"},"link":"/c/k-beauty-j-beauty","image_url":"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop&q=80"}}
]'::jsonb,
updated_at = NOW()
WHERE id = '6b79d981-3872-43b1-8f11-5bdc46046eaf';

-- 3. Fix promotional_banner - correct CTA link
UPDATE layout_sections SET blocks = '[
  {"id":"promo-summer","type":"banner","data":{"title":{"en":"Summer Beauty Sale","ar":"تخفيضات الصيف للجمال"},"cta_text":{"en":"Up to 40% Off","ar":"خصم حتى 40%"},"cta_link":"/c/skincare","image":{"desktop":{"url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&h=500&fit=crop&crop=center&q=85","width":1920,"height":500},"mobile":{"url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&h=600&fit=crop&crop=center&q=85","width":1080,"height":600},"alt":{"en":"Summer Beauty Sale - Up to 40% Off","ar":"تخفيضات الصيف للجمال"},"focal_point":{"x":0.5,"y":0.5}}}}
]'::jsonb,
updated_at = NOW()
WHERE id = 'ce7fd9c0-4d9c-4ddb-ba6a-a910b7ec5e92';

-- 4. Fix brand_spotlight - correct brand links to search
UPDATE layout_sections SET blocks = '[
  {"id":"brand-1","type":"brand","data":{"name":"Dior","link":"/search?brand=dior","logo_url":"https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-2","type":"brand","data":{"name":"Chanel","link":"/search?brand=chanel","logo_url":"https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-3","type":"brand","data":{"name":"Tom Ford","link":"/search?brand=tom-ford","logo_url":"https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-4","type":"brand","data":{"name":"Huda Beauty","link":"/search?brand=huda-beauty","logo_url":"https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-5","type":"brand","data":{"name":"MAC","link":"/search?brand=mac","logo_url":"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-6","type":"brand","data":{"name":"Charlotte Tilbury","link":"/search?brand=charlotte-tilbury","logo_url":"https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-7","type":"brand","data":{"name":"Amouage","link":"/search?brand=amouage","logo_url":"https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-8","type":"brand","data":{"name":"Fenty Beauty","link":"/search?brand=fenty-beauty","logo_url":"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-9","type":"brand","data":{"name":"La Mer","link":"/search?brand=la-mer","logo_url":"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop&q=80"}},
  {"id":"brand-10","type":"brand","data":{"name":"The Ordinary","link":"/search?brand=the-ordinary","logo_url":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&h=120&fit=crop&q=80"}}
]'::jsonb,
updated_at = NOW()
WHERE id = 'a6d91a95-ccb1-4709-8ebd-53d1d6d9a2c1';

COMMIT;
