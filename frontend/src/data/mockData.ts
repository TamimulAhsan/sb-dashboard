
import { Order, Product, RevenueData, ProductPerformance, TopProduct } from '@/types';

// Mock Products
export const mockProducts: Product[] = [
  {
    product_id: 1,
    product_name: 'Wireless Headphones',
    details: 'High-quality wireless headphones with noise cancellation',
    image: '/placeholder.svg',
    price: 129.99,
  },
  {
    product_id: 2,
    product_name: 'Smart Watch',
    details: 'Fitness tracker with heart rate monitor and sleep tracking',
    image: '/placeholder.svg',
    price: 199.99,
  },
  {
    product_id: 3,
    product_name: 'Bluetooth Speaker',
    details: 'Waterproof speaker with 20-hour battery life',
    image: '/placeholder.svg',
    price: 89.99,
  },
  {
    product_id: 4,
    product_name: 'Laptop Backpack',
    details: 'Water-resistant backpack with USB charging port',
    image: '/placeholder.svg',
    price: 59.99,
  },
  {
    product_id: 5,
    product_name: 'Wireless Charging Pad',
    details: 'Fast wireless charging for compatible devices',
    image: '/placeholder.svg',
    price: 39.99,
  },
  {
    product_id: 6,
    product_name: 'Digital Camera',
    details: '24MP digital camera with 4K video recording',
    image: '/placeholder.svg',
    price: 549.99,
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    userID: 1,
    username: 'john_doe',
    product_id: 1,
    quantity: 1,
    amount: 129.99,
    invoice_id: 'INV-2024-001',
    delivery_method: 'Standard Shipping',
    delivery_address: '123 Main St, Anytown, USA',
    payment_method: 'Credit Card',
    payment_status: 'Paid',
    order_number: 'ORD-2024-001',
    order_status: 'Delivered',
  },
  {
    userID: 2,
    username: 'jane_smith',
    product_id: 2,
    quantity: 1,
    amount: 199.99,
    invoice_id: 'INV-2024-002',
    delivery_method: 'Express Shipping',
    delivery_address: '456 Elm St, Othertown, USA',
    payment_method: 'PayPal',
    payment_status: 'Paid',
    order_number: 'ORD-2024-002',
    order_status: 'Processing',
  },
  {
    userID: 3,
    username: 'michael_brown',
    product_id: 3,
    quantity: 2,
    amount: 179.98,
    invoice_id: 'INV-2024-003',
    delivery_method: 'Standard Shipping',
    delivery_address: '789 Oak St, Somewhere, USA',
    payment_method: 'Credit Card',
    payment_status: 'Paid',
    order_number: 'ORD-2024-003',
    order_status: 'Shipped',
  },
  {
    userID: 4,
    username: 'emily_jones',
    product_id: 4,
    quantity: 1,
    amount: 59.99,
    invoice_id: 'INV-2024-004',
    delivery_method: 'Standard Shipping',
    delivery_address: '101 Pine St, Nowhere, USA',
    payment_method: 'Credit Card',
    payment_status: 'Pending',
    order_number: 'ORD-2024-004',
    order_status: 'Pending',
  },
  {
    userID: 5,
    username: 'david_wilson',
    product_id: 5,
    quantity: 3,
    amount: 119.97,
    invoice_id: 'INV-2024-005',
    delivery_method: 'Express Shipping',
    delivery_address: '202 Cedar St, Elsewhere, USA',
    payment_method: 'PayPal',
    payment_status: 'Paid',
    order_number: 'ORD-2024-005',
    order_status: 'Delivered',
  },
];

// Revenue data for charts
export const mockRevenueData: RevenueData[] = [
  { date: 'Jan', amount: 1200 },
  { date: 'Feb', amount: 1900 },
  { date: 'Mar', amount: 1500 },
  { date: 'Apr', amount: 2400 },
  { date: 'May', amount: 2800 },
  { date: 'Jun', amount: 1700 },
  { date: 'Jul', amount: 3100 },
  { date: 'Aug', amount: 2900 },
  { date: 'Sep', amount: 3500 },
  { date: 'Oct', amount: 3000 },
  { date: 'Nov', amount: 3800 },
  { date: 'Dec', amount: 4200 },
];

// Top selling products data
export const mockTopProducts: TopProduct[] = [
  { product_id: 2, product_name: 'Smart Watch', sales: 250 },
  { product_id: 1, product_name: 'Wireless Headphones', sales: 200 },
  { product_id: 6, product_name: 'Digital Camera', sales: 150 },
  { product_id: 3, product_name: 'Bluetooth Speaker', sales: 130 },
  { product_id: 5, product_name: 'Wireless Charging Pad', sales: 120 },
];

// Product performance data
export const mockProductPerformance: ProductPerformance[] = [
  { product_name: 'Smart Watch', sales: 250, revenue: 49997.50 },
  { product_name: 'Wireless Headphones', sales: 200, revenue: 25998.00 },
  { product_name: 'Digital Camera', sales: 150, revenue: 82498.50 },
  { product_name: 'Bluetooth Speaker', sales: 130, revenue: 11698.70 },
  { product_name: 'Wireless Charging Pad', sales: 120, revenue: 4798.80 },
  { product_name: 'Laptop Backpack', sales: 100, revenue: 5999.00 },
];

// Helper function to get order status color
export const getOrderStatusColor = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'warning';
    case 'pending':
      return 'muted';
    case 'cancelled':
      return 'destructive';
    default:
      return 'muted';
  }
};

// Helper to get payment status color
export const getPaymentStatusColor = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    default:
      return 'muted';
  }
};
