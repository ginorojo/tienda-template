-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- In CLP (pesos chilenos)
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_order_id TEXT UNIQUE, -- Flow.cl Payment Order ID
  status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  total INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  customer_name TEXT,
  customer_email TEXT,
  region TEXT,
  comuna TEXT,
  address TEXT,
  payment_method TEXT, -- flow, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price at the time of purchase
  product_name TEXT -- Cached product name in case product is deleted
);

-- RLS (Row Level Security) - Basic Setup
-- Allow anyone to read products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);

-- Admin policies (assuming an 'admin' role or specific UID)
-- For this boilerplate, we'll suggest using Supabase Auth and checking for admin role in metadata
CREATE POLICY "Admins can manage products" ON products 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders should be private to admin or the user who created them (if tracking users)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

--------------------------------------------------------------------------------
-- TRIGGER for stock update (Optional but recommended)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_stock_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    UPDATE products p
    SET stock = p.stock - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_payment();
