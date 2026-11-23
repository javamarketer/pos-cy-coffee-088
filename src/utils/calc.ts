import type { CartItem } from '../types/pos';

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Calculates cart financial totals safely preventing NaN, negative values, and zero division.
 */
export function calculateTotals(
  items: CartItem[],
  discountType: 'percent' | 'nominal',
  discountValue: number,
  serviceChargePercent: number,
  taxPercent: number
): CartTotals {
  // 1. Calculate raw subtotal
  const subtotal = items.reduce((acc, item) => {
    const qty = Math.max(0, item.quantity || 0);
    const price = Math.max(0, item.unitPrice || 0);
    return acc + qty * price;
  }, 0);

  // 2. Calculate discount safely capped at subtotal
  let discountAmount = 0;
  const safeDiscVal = Math.max(0, isNaN(discountValue) ? 0 : discountValue);

  if (discountType === 'percent') {
    const clampedPercent = Math.min(100, safeDiscVal);
    discountAmount = Math.round((subtotal * clampedPercent) / 100);
  } else {
    discountAmount = Math.min(subtotal, Math.round(safeDiscVal));
  }

  // 3. Subtotal after discount
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

  // 4. Service Charge (persentase dari subtotal setelah diskon)
  const safeServiceChargePercent = Math.max(0, isNaN(serviceChargePercent) ? 0 : serviceChargePercent);
  const serviceChargeAmount = Math.round((subtotalAfterDiscount * safeServiceChargePercent) / 100);

  // 5. Pajak (jumlahnya nilai persentase dikali subtotal)
  const safeTaxPercent = Math.max(0, isNaN(taxPercent) ? 0 : taxPercent);
  const taxableAmount = subtotal;
  const taxAmount = Math.round((subtotal * safeTaxPercent) / 100);

  // 6. Final Total = (Subtotal - Diskon) + Service Charge + Pajak
  const total = Math.max(0, subtotalAfterDiscount + serviceChargeAmount + taxAmount);

  return {
    subtotal,
    discountAmount,
    serviceChargeAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}

/**
 * Calculates change for cash payment safely
 */
export function calculateChange(total: number, amountPaid: number): number {
  const safeTotal = Math.max(0, isNaN(total) ? 0 : total);
  const safePaid = Math.max(0, isNaN(amountPaid) ? 0 : amountPaid);
  if (safePaid < safeTotal) return 0;
  return safePaid - safeTotal;
}

/**
 * Generates human readable unique transaction ID
 * Example: TRX-20261122-0042
 */
export function generateTransactionId(sequence: number): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seqPadded = String(Math.max(1, sequence)).padStart(4, '0');
  return `TRX-${yyyy}${mm}${dd}-${seqPadded}`;
}
