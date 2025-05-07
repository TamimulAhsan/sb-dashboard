
// Product type based on products table
export interface Product {
  product_id: number;
  product_name: string;
  details: string | null;
  image: string | null;
  price: number;
}

// Order type based on orders table
export interface Order {
  userID: number;
  username: string;
  product_id: number;
  quantity: number;
  amount: number;
  invoice_id: string;
  delivery_method: string | null;
  delivery_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  order_number: string;
  order_status: string | null;
}

// Wishlist type based on wishlist table
export interface Wishlist {
  userID: number;
  username: string;
  product_id: number;
}

// Extended types with additional fields for UI
export interface ProductWithDetails extends Product {
  totalSold?: number;
  inWishlist?: boolean;
}

export interface OrderWithDetails extends Order {
  product?: Product;
  statusColor?: string;
}

// Analytics types
export interface RevenueData {
  date: string;
  amount: number;
}

export interface ProductPerformance {
  product_name: string;
  sales: number;
  revenue: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  sales: number;
}
