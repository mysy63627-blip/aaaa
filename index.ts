export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  region: string;
  items: OrderItem[];
  total_price: number;
  delivery_price: number;
  grand_total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  region: string;
  total_orders: number;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
}

export interface DeliveryRegion {
  id: string;
  region_name: string;
  price: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
}
