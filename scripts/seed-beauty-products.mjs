/**
 * Seed 20 beauty & fragrance products via the admin API.
 * Run: node scripts/seed-beauty-products.mjs
 */

const API = "http://127.0.0.1:3000";
const CATEGORY_ID = "93d4b722-3c5c-47f4-a760-13c2ea938064"; // Beauty & Health
const VENDOR_ID = "3f345253-a546-427f-bf0d-2efec0288c12";

const products = [
  {
    name: "Dior Sauvage Eau de Parfum 100ml",
    description: "A bold and magnetic fragrance for men. Fresh Calabrian bergamot meets warm ambroxan for an irresistible trail.",
    price: 55000, compare_at_price: 65000,
    tags: ["fragrance", "men", "luxury", "dior"],
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Chanel N°5 Eau de Parfum 50ml",
    description: "The iconic feminine fragrance. A floral-aldehyde masterpiece with jasmine, rose, and sandalwood.",
    price: 48000, compare_at_price: 52000,
    tags: ["fragrance", "women", "luxury", "chanel"],
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Tom Ford Black Orchid EDP 50ml",
    description: "Dark and luxurious. A blend of black truffle, bergamot, and black orchid for an unforgettable scent.",
    price: 62000,
    tags: ["fragrance", "unisex", "luxury", "tom-ford"],
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Charlotte Tilbury Flawless Filter Foundation",
    description: "Hollywood-inspired foundation that blurs, smooths, and gives a beautiful lit-from-within glow.",
    price: 18500, compare_at_price: 22000,
    tags: ["makeup", "foundation", "charlotte-tilbury"],
    image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "La Mer Crème de la Mer Moisturizer 30ml",
    description: "The legendary Miracle Broth-infused moisturizer. Transforms skin, delivering unparalleled hydration and renewal.",
    price: 95000,
    tags: ["skincare", "moisturizer", "luxury", "la-mer"],
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "MAC Ruby Woo Matte Lipstick",
    description: "The world's best-selling red lipstick. Retro matte finish in a vivid blue-red shade.",
    price: 9500,
    tags: ["makeup", "lipstick", "mac"],
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Jo Malone Wood Sage & Sea Salt Cologne 100ml",
    description: "A fresh and earthy fragrance inspired by windswept cliffs. Ambrette seeds and sea salt create an escape.",
    price: 42000, compare_at_price: 48000,
    tags: ["fragrance", "unisex", "jo-malone"],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Estée Lauder Advanced Night Repair Serum 50ml",
    description: "The #1 repair serum. Reduces lines and wrinkles while boosting radiance overnight.",
    price: 35000, compare_at_price: 42000,
    tags: ["skincare", "serum", "anti-aging", "estee-lauder"],
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Fenty Beauty Pro Filt'r Foundation",
    description: "50 shade range soft matte foundation. Buildable medium-to-full coverage that looks like skin.",
    price: 16000,
    tags: ["makeup", "foundation", "fenty-beauty"],
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Olaplex No. 3 Hair Perfector 100ml",
    description: "The at-home bond-building treatment that strengthens, repairs, and restores damaged hair.",
    price: 12500, compare_at_price: 15000,
    tags: ["haircare", "treatment", "olaplex"],
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Acqua di Gio Profondo EDP 75ml",
    description: "A deeply aquatic masculine fragrance. Mediterranean-inspired freshness with patchouli and amber.",
    price: 38000,
    tags: ["fragrance", "men", "armani"],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "NARS Radiant Creamy Concealer",
    description: "Award-winning concealer with medium-to-full buildable coverage. Hydrating, crease-proof formula.",
    price: 14000,
    tags: ["makeup", "concealer", "nars"],
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "SK-II Facial Treatment Essence 230ml",
    description: "Over 90% Pitera. The iconic essence that transforms skin clarity, texture, and radiance.",
    price: 78000, compare_at_price: 89000,
    tags: ["skincare", "essence", "luxury", "sk-ii"],
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "YSL Libre Eau de Parfum 90ml",
    description: "A daring feminine fragrance. French lavender meets Moroccan orange blossom for fierce elegance.",
    price: 52000,
    tags: ["fragrance", "women", "ysl"],
    image: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Dyson Airwrap Multi-Styler Complete",
    description: "Engineered for multiple hair types. Curl, wave, smooth, and dry with no extreme heat damage.",
    price: 220000, compare_at_price: 250000,
    tags: ["haircare", "styling", "tools", "dyson"],
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Drunk Elephant Protini Polypeptide Cream 50ml",
    description: "Signal peptides, growth factors, and amino acids in a lightweight moisturizer for firm, bright skin.",
    price: 28000,
    tags: ["skincare", "moisturizer", "drunk-elephant"],
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Creed Aventus Eau de Parfum 100ml",
    description: "The king of niche fragrances. Pineapple, birch, and musk create a powerful, confident scent.",
    price: 130000,
    tags: ["fragrance", "men", "luxury", "niche", "creed"],
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Tatcha Dewy Skin Cream 50ml",
    description: "Japanese superfoods and hyaluronic acid create plump, dewy skin. Rich yet weightless texture.",
    price: 32000, compare_at_price: 38000,
    tags: ["skincare", "moisturizer", "tatcha"],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Huda Beauty Desert Dusk Palette",
    description: "18 richly pigmented shades inspired by desert sunsets. Mattes, shimmers, and duo-chrome textures.",
    price: 27000,
    tags: ["makeup", "eyeshadow", "palette", "huda-beauty"],
    image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=800&fit=crop&q=85",
  },
  {
    name: "Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml",
    description: "The cult-favorite fragrance. Jasmine, saffron, and ambergris create an ethereal, crystal-like scent.",
    price: 115000,
    tags: ["fragrance", "unisex", "luxury", "niche", "mfk"],
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&h=800&fit=crop&q=85",
  },
];

async function main() {
  // Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@servicehubuae.com", password: "Admin@123" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data.tokens.accessToken;
  console.log("Logged in as admin");

  const createdIds = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Create product
    const createRes = await fetch(`${API}/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        vendor_id: VENDOR_ID,
        name: p.name,
        description: p.description,
        category_id: CATEGORY_ID,
        price: p.price,
        compare_at_price: p.compare_at_price,
        tags: p.tags,
        is_featured: true,
        status: "published",
      }),
    });
    const createData = await createRes.json();

    if (createData.statusCode !== 201) {
      console.log(`  FAIL [${i+1}] ${p.name}: ${createData.message}`);
      continue;
    }

    const productId = createData.data.id;
    createdIds.push(productId);

    // Add image
    await fetch(`${API}/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: p.image, is_primary: true, alt_text: p.name }),
    });

    // Publish
    await fetch(`${API}/admin/products/${productId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    // Feature
    await fetch(`${API}/admin/products/${productId}/feature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`  OK [${i+1}/20] ${p.name} (${productId})`);
  }

  console.log(`\nCreated ${createdIds.length} products`);
  console.log("Product IDs:", JSON.stringify(createdIds));
}

main().catch(console.error);
