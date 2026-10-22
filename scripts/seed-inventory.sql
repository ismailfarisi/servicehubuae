BEGIN;

-- Create a default warehouse in Dubai
INSERT INTO warehouses (id, name, code, address_line_1, city, emirate, country_code, is_active, is_default)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ServiceHubUAE Dubai Warehouse',
  'DXB-MAIN',
  'Dubai Investment Park, Warehouse 42',
  'Dubai',
  'Dubai',
  'AE',
  true,
  true
);

-- Add inventory for all products with random realistic stock levels
-- Fragrance/luxury items: lower stock (10-50)
-- Skincare/everyday items: higher stock (30-100)
INSERT INTO inventory (product_id, variant_id, vendor_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available, low_stock_threshold)
SELECT
  p.id,
  NULL,
  p.vendor_id,
  'a0000000-0000-0000-0000-000000000001',
  CASE
    WHEN p.price >= 50000 THEN 10 + floor(random() * 25)::int  -- luxury: 10-34
    WHEN p.price >= 20000 THEN 20 + floor(random() * 40)::int  -- mid: 20-59
    ELSE 30 + floor(random() * 70)::int                         -- affordable: 30-99
  END as qty_on_hand,
  0,
  CASE
    WHEN p.price >= 50000 THEN 10 + floor(random() * 25)::int
    WHEN p.price >= 20000 THEN 20 + floor(random() * 40)::int
    ELSE 30 + floor(random() * 70)::int
  END as qty_available,
  CASE
    WHEN p.price >= 50000 THEN 3
    WHEN p.price >= 20000 THEN 5
    ELSE 10
  END
FROM products p
WHERE p.deleted_at IS NULL AND p.status = 'published';

-- Make quantity_available match quantity_on_hand (fix random mismatch)
UPDATE inventory SET quantity_available = quantity_on_hand WHERE quantity_reserved = 0;

COMMIT;
