import type { MenuItem, StoreSettings, Transaction } from '../types/pos';
import { INITIAL_MENU, INITIAL_SETTINGS } from '../data/seedMenu';

export const STORAGE_KEYS = {
  MENU: 'cy_coffee_menu_v1',
  TRANSACTIONS: 'cy_coffee_transactions_v1',
  SETTINGS: 'cy_coffee_settings_v1',
  LAST_ORDER_SEQ: 'cy_coffee_order_seq_v1',
};

/**
 * Safely retrieves and parses data from localStorage with fallback
 */
export function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (error) {
    console.warn(`[storage] Error reading key "${key}", using fallback:`, error);
    return fallback;
  }
}

/**
 * Safely serializes and saves data to localStorage
 */
export function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[storage] Error saving key "${key}":`, error);
    return false;
  }
}

/**
 * Generates an exportable JSON payload of all application data
 */
export function exportAllData(): string {
  const data = {
    app: 'CY Coffee POS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    menu: safeGet<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU),
    transactions: safeGet<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []),
    settings: safeGet<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Validates and imports JSON payload into localStorage
 */
export function importDataFromJson(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Format file JSON tidak valid.' };
    }

    if (Array.isArray(parsed.menu)) {
      safeSet(STORAGE_KEYS.MENU, parsed.menu);
    }
    if (Array.isArray(parsed.transactions)) {
      safeSet(STORAGE_KEYS.TRANSACTIONS, parsed.transactions);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      safeSet(STORAGE_KEYS.SETTINGS, parsed.settings);
    }

    return { success: true, message: 'Data berhasil diimpor dengan aman!' };
  } catch (error) {
    return {
      success: false,
      message: `Gagal membaca file: ${error instanceof Error ? error.message : 'Format rusak'}`,
    };
  }
}

/**
 * Resets menu and settings back to original initial defaults
 */
export function resetAllDataToDefault(): void {
  try {
    safeSet(STORAGE_KEYS.MENU, INITIAL_MENU);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(STORAGE_KEYS.TRANSACTIONS, []);
    safeSet(STORAGE_KEYS.LAST_ORDER_SEQ, 0);
  } catch (err) {
    console.error('[storage] Failed resetting data:', err);
  }
}
