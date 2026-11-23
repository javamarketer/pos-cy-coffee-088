/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 25000 -> "Rp 25.000"
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return `Rp ${formatted}`;
}

/**
 * Format numbers with dots as thousands separator (e.g. 50000 -> "50.000")
 */
export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Formats ISO date string to Indonesian readable date and time
 * Example: "2026-11-22T19:05:00.000Z" -> "22 Nov 2026, 19:05"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString || '-';
  }
}

/**
 * Formats date only (e.g. "22 Nov 2026")
 */
export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString || '-';
  }
}

/**
 * Parses numeric inputs safely, preventing NaN and negative values where inappropriate
 */
export function parseSafeNumber(val: string | number, fallback = 0, allowNegative = false): number {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return allowNegative ? val : Math.max(0, val);
  }
  if (!val || typeof val !== 'string') return fallback;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  return allowNegative ? parsed : Math.max(0, parsed);
}
