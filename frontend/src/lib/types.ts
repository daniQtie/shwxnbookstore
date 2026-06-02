export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  price: number;
  stock: number;
  weight_kg: number;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  price: number;
  weight_kg: number;
  quantity: number;
  subtotal: number;
  weight_subtotal: number;
};

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export type Courier = 'jt' | 'lbc' | 'flash' | 'ninjavan' | 'jrs' | 'other' | '';

export type Order = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  items: OrderItem[];
  total: number;
  total_weight_kg: number;
  status: OrderStatus;
  type: string;
  note?: string;
  courier?: Courier;
  tracking_number?: string;
  shipped_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  orders_count?: number;
  total_spent?: number;
  created_at?: string;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_id: string | null;
  status: 'pending' | 'approved' | 'disapproved';
  created_at?: string;
};

// Cart-only type (frontend state, localStorage)
export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  weight_kg: number;
  image_url: string;
  stock: number;
  quantity: number;
};
