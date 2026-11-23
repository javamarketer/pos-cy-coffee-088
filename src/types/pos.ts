export type Category = 'Coffee' | 'Non-Coffee' | 'Manual Brew' | 'Foods' | 'Snacks' | 'Add-on';

export interface VariantOption {
  id: string;
  name: string;
  priceDelta: number; // e.g. +3000 for Large, +5000 for Extra Shot, 0 for Regular
}

export interface VariantGroup {
  id: string;
  name: string; // e.g. "Suhu" (Hot/Iced), "Ukuran" (Regular/Large), "Gula" (Normal/Less/No)
  options: VariantOption[];
  defaultOptionId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  basePrice: number;
  description?: string;
  isAvailable: boolean;
  variants?: VariantGroup[];
  badge?: string; // e.g. "Best Seller", "Signature", "Baru"
}

export interface SelectedVariant {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string; // unique ID based on item ID and selected options
  menuItemId: string;
  name: string;
  category: Category;
  basePrice: number;
  selectedVariants: SelectedVariant[];
  unitPrice: number; // basePrice + sum(variant priceDelta)
  quantity: number;
  subtotal: number; // unitPrice * quantity
  notes?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface Transaction {
  id: string; // e.g. TRX-20261122-001
  orderNumber: number; // sequential daily order number e.g. #01
  timestamp: string; // ISO string
  items: CartItem[];
  subtotal: number;
  discountType: 'percent' | 'nominal';
  discountValue: number; // raw input (e.g. 10 for 10% or 10000 for Rp10.000)
  discountAmount: number; // calculated rupiah amount
  serviceChargePercent?: number; // Service Charge % (e.g. 5%)
  serviceChargeAmount?: number; // Service Charge Rp
  taxPercent: number; // e.g. 0 or 10 (PB1)
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierName: string;
  customerName?: string;
  tableNumber?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  serviceChargeRate: number; // default 0% or 5% (Service Charge)
  taxRate: number; // default 0% or 10% (PB1)
  receiptFooter: string;
  cashierName: string; // Active cashier name
  cashiers: string[]; // List of available cashier names
  currencyPrefix: string;
}

export interface DailySummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cashRevenue: number;
  qrisRevenue: number;
  transferRevenue: number;
}
