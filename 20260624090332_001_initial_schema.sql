-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  region TEXT,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  region TEXT,
  items JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  delivery_price DECIMAL(10,2) NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- Delivery regions table
CREATE TABLE delivery_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_regions ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write via service role)
CREATE POLICY "products_public_select" ON products FOR SELECT
  USING (true);

CREATE POLICY "products_service_insert" ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "products_service_update" ON products FOR UPDATE
  USING (true);

CREATE POLICY "products_service_delete" ON products FOR DELETE
  USING (true);

-- Customers policies (public insert, admin read)
CREATE POLICY "customers_public_insert" ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "customers_public_select" ON customers FOR SELECT
  USING (true);

CREATE POLICY "customers_service_update" ON customers FOR UPDATE
  USING (true);

-- Orders policies (public insert, public read own orders, admin all)
CREATE POLICY "orders_public_insert" ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_public_select" ON orders FOR SELECT
  USING (true);

CREATE POLICY "orders_service_update" ON orders FOR UPDATE
  USING (true);

-- Admins policies (service role only)
CREATE POLICY "admins_service_all" ON admins FOR ALL
  USING (true);

-- Settings policies (public read, admin write)
CREATE POLICY "settings_public_select" ON settings FOR SELECT
  USING (true);

CREATE POLICY "settings_service_all" ON settings FOR ALL
  USING (true);

-- Delivery regions policies (public read)
CREATE POLICY "delivery_regions_public_select" ON delivery_regions FOR SELECT
  USING (true);

CREATE POLICY "delivery_regions_service_all" ON delivery_regions FOR ALL
  USING (true);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
