-- Actualizar tabla de productos para incluir dimensiones y peso
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL DEFAULT 1.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length INTEGER DEFAULT 10;

-- Actualizar tabla de órdenes para incluir detalles de Shipit y courier seleccionado
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipit_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS flow_token TEXT; -- Asegurar que existe si no estaba
