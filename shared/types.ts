export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type Role = 'Admin' | 'Manager' | 'Driver';
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  joinDate: string; // ISO 8601 date string
  status: 'Active' | 'Inactive';
  password?: string;
}
export interface Customer {
  id: string;
  name: string;
  address: string;
  contact: string;
  bottleBalance: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  createdAt?: string; // ISO 8601 date string
}
export interface Product {
  id: string;
  name: string; // e.g., "19L Bottle", "1.5L Bottle"
  price: number;
  stock: {
    full: number;
    empty: number;
    defective: number;
  };
}
export interface Order {
  id: string;
  customerId: string;
  items: { productId: string; quantity: number }[];
  deliveryDate: string; // ISO 8601 date string
  status: 'Pending' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid';
  assignedDriverId?: string;
  notes?: string;
  createdAt?: string; // ISO 8601 date string
}
export interface Delivery {
  id: string;
  orderId: string;
  driverId: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Failed';
  deliveryProofUrl?: string; // URL to an uploaded photo
  timestamp: string; // ISO 8601 date string
}
export interface Transaction {
  id: string;
  orderId?: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  date: string; // ISO 8601 date string
  description: string;
  category: 'Sales' | 'Fuel' | 'Rent' | 'Salaries' | 'Maintenance' | 'Other';
}
export interface Setting {
  id: string; // e.g., 'logoUrl'
  value: any;
}
export interface BackupData {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  employees: Employee[];
}