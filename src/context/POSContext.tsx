import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  MenuItem,
  CartItem,
  Transaction,
  StoreSettings,
  SelectedVariant,
  PaymentMethod,
} from '../types/pos';
import { INITIAL_MENU, INITIAL_SETTINGS } from '../data/seedMenu';
import {
  safeGet,
  safeSet,
  STORAGE_KEYS,
  exportAllData,
  importDataFromJson,
  resetAllDataToDefault,
} from '../utils/storage';
import { calculateTotals, generateTransactionId, type CartTotals } from '../utils/calc';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface POSContextType {
  // Menu
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleItemAvailability: (itemId: string) => void;
  deleteMenuItem: (itemId: string) => void;
  resetMenuToDefault: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedVariants?: SelectedVariant[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  discountType: 'percent' | 'nominal';
  setDiscountType: (type: 'percent' | 'nominal') => void;
  discountValue: number;
  setDiscountValue: (val: number) => void;
  serviceChargePercent: number;
  setServiceChargePercent: (rate: number) => void;
  taxPercent: number;
  setTaxPercent: (tax: number) => void;
  totals: CartTotals;

  // Checkout & Transactions
  transactions: Transaction[];
  activeTransaction: Transaction | null;
  setActiveTransaction: (tx: Transaction | null) => void;
  completeTransaction: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    customerName?: string,
    tableNumber?: string
  ) => Transaction;
  clearAllTransactions: () => void;
  deleteTransaction: (id: string) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; message: string };
  resetAllData: () => void;

  // Cashier Management
  cashiers: string[];
  addCashier: (name: string) => boolean;
  updateCashier: (oldName: string, newName: string) => boolean;
  deleteCashier: (name: string) => boolean;
  setActiveCashier: (name: string) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Menu State (automatically filtered from deleted categories and merging any new seed items)
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const loaded = safeGet<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU);
    const cleaned = loaded.filter((item) => (item.category as string) !== 'Pastry & Snack');
    const existingIds = new Set(cleaned.map((i) => i.id));
    const missingSeedItems = INITIAL_MENU.filter((item) => !existingIds.has(item.id));
    return [...cleaned, ...missingSeedItems];
  });

  // 2. Settings State with safe cashier fallbacks
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const loaded = safeGet<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const validCashiers =
      Array.isArray(loaded.cashiers) && loaded.cashiers.length > 0
        ? loaded.cashiers
        : ['Kasir 1', 'Barista Rama', 'Kasir Sarah'];
    const validActive =
      loaded.cashierName && validCashiers.includes(loaded.cashierName)
        ? loaded.cashierName
        : validCashiers[0];

    return {
      ...loaded,
      cashiers: validCashiers,
      cashierName: validActive,
    };
  });

  // 3. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    safeGet<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
  );

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(() =>
    settings.serviceChargeRate !== undefined ? settings.serviceChargeRate : 5
  );
  const [taxPercent, setTaxPercent] = useState<number>(() => settings.taxRate || 0);

  // 5. Active Transaction for Receipt Modal
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  // 6. Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage safely
  useEffect(() => {
    safeSet(STORAGE_KEYS.MENU, menu);
  }, [menu]);

  useEffect(() => {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    safeSet(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  // Recalculate totals
  const totals = useMemo(() => {
    return calculateTotals(cart, discountType, discountValue, serviceChargePercent, taxPercent);
  }, [cart, discountType, discountValue, serviceChargePercent, taxPercent]);

  // Helper to generate unique cart item id
  const getCartItemId = (menuItemId: string, variants: SelectedVariant[] = []) => {
    const variantKey = variants
      .map((v) => `${v.groupId}:${v.optionId}`)
      .sort()
      .join('|');
    return `${menuItemId}_${variantKey || 'plain'}`;
  };

  // CART ACTIONS
  const addToCart = (item: MenuItem, selectedVariants: SelectedVariant[] = [], notes = '') => {
    if (!item.isAvailable) {
      showToast(`${item.name} saat ini sedang habis!`, 'warning');
      return;
    }

    const cartItemId = getCartItemId(item.id, selectedVariants);
    const variantExtraPrice = selectedVariants.reduce((sum, v) => sum + (v.priceDelta || 0), 0);
    const unitPrice = Math.max(0, item.basePrice + variantExtraPrice);

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: newQty * existing.unitPrice,
          notes: notes || existing.notes,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          menuItemId: item.id,
          name: item.name,
          category: item.category,
          basePrice: item.basePrice,
          selectedVariants,
          unitPrice,
          quantity: 1,
          subtotal: unitPrice,
          notes,
        };
        return [...prev, newItem];
      }
    });

    showToast(`+1 ${item.name} ditambahkan`, 'success');
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateItemNotes = (cartItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, notes } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
  };

  // MENU ACTIONS
  const addMenuItem = (newItemData: Omit<MenuItem, 'id'>) => {
    const id = 'custom-' + Date.now().toString(36);
    const newItem: MenuItem = {
      ...newItemData,
      id,
    };
    setMenu((prev) => [newItem, ...prev]);
    showToast(`Menu baru "${newItem.name}" berhasil dibuat!`, 'success');
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenu((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    showToast(`Menu "${updatedItem.name}" berhasil diperbarui.`, 'success');
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenu((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextStatus = !item.isAvailable;
          showToast(
            `${item.name} sekarang ${nextStatus ? 'TERSEDIA' : 'HABIS'}`,
            nextStatus ? 'success' : 'warning'
          );
          return { ...item, isAvailable: nextStatus };
        }
        return item;
      })
    );
  };

  const deleteMenuItem = (itemId: string) => {
    const target = menu.find((m) => m.id === itemId);
    setMenu((prev) => prev.filter((item) => item.id !== itemId));
    showToast(`Menu "${target?.name || ''}" telah dihapus.`, 'info');
  };

  const resetMenuToDefault = () => {
    setMenu(INITIAL_MENU);
    showToast('Daftar menu dikembalikan ke bawaan awal.', 'info');
  };

  // CASHIER MANAGEMENT ACTIONS
  const addCashier = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Nama kasir tidak boleh kosong!', 'warning');
      return false;
    }
    const currentList = settings.cashiers || ['Kasir 1'];
    if (currentList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Nama kasir "${trimmed}" sudah terdaftar!`, 'warning');
      return false;
    }
    const updated = [...currentList, trimmed];
    updateSettings({ cashiers: updated });
    showToast(`Kasir "${trimmed}" berhasil ditambahkan.`, 'success');
    return true;
  };

  const updateCashier = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Nama kasir baru tidak boleh kosong!', 'warning');
      return false;
    }
    const currentList = settings.cashiers || ['Kasir 1'];
    if (
      oldName.toLowerCase() !== trimmed.toLowerCase() &&
      currentList.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      showToast(`Nama kasir "${trimmed}" sudah digunakan!`, 'warning');
      return false;
    }
    const updated = currentList.map((c) => (c === oldName ? trimmed : c));
    const nextActive = settings.cashierName === oldName ? trimmed : settings.cashierName;
    updateSettings({ cashiers: updated, cashierName: nextActive });
    showToast(`Nama kasir "${oldName}" diubah menjadi "${trimmed}".`, 'success');
    return true;
  };

  const deleteCashier = (name: string): boolean => {
    const currentList = settings.cashiers || ['Kasir 1'];
    if (currentList.length <= 1) {
      showToast('Minimal harus ada 1 nama kasir yang terdaftar!', 'warning');
      return false;
    }
    const updated = currentList.filter((c) => c !== name);
    let nextActive = settings.cashierName;
    if (settings.cashierName === name) {
      nextActive = updated[0];
    }
    updateSettings({ cashiers: updated, cashierName: nextActive });
    showToast(`Kasir "${name}" berhasil dihapus.`, 'info');
    return true;
  };

  const setActiveCashier = (name: string) => {
    updateSettings({ cashierName: name });
    showToast(`Kasir aktif saat ini: ${name}`, 'success');
  };

  // CHECKOUT ACTION
  const completeTransaction = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    customerName?: string,
    tableNumber?: string
  ): Transaction => {
    const seq = safeGet<number>(STORAGE_KEYS.LAST_ORDER_SEQ, 0) + 1;
    safeSet(STORAGE_KEYS.LAST_ORDER_SEQ, seq);

    const change = Math.max(0, amountPaid - totals.total);
    const newTransaction: Transaction = {
      id: generateTransactionId(seq),
      orderNumber: seq,
      timestamp: new Date().toISOString(),
      items: [...cart],
      subtotal: totals.subtotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      serviceChargePercent,
      serviceChargeAmount: totals.serviceChargeAmount,
      taxPercent,
      taxAmount: totals.taxAmount,
      total: totals.total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? amountPaid : totals.total,
      change: paymentMethod === 'cash' ? change : 0,
      cashierName: settings.cashierName || 'Kasir',
      customerName: customerName?.trim() || undefined,
      tableNumber: tableNumber?.trim() || undefined,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setActiveTransaction(newTransaction);
    clearCart();
    showToast(`Pesanan #${newTransaction.orderNumber} berhasil dicatat!`, 'success');
    return newTransaction;
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    setActiveTransaction(null);
    safeSet(STORAGE_KEYS.TRANSACTIONS, []);
    safeSet(STORAGE_KEYS.LAST_ORDER_SEQ, 0);
    showToast('Semua data riwayat transaksi berhasil dihapus.', 'info');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    const orderNum = target ? `#${target.orderNumber}` : id;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setActiveTransaction((prev) => (prev?.id === id ? null : prev));
    showToast(`Struk pesanan ${orderNum} berhasil dihapus.`, 'info');
  };

  // SETTINGS & BACKUP ACTIONS
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.serviceChargeRate !== undefined) {
        setServiceChargePercent(newSettings.serviceChargeRate);
      }
      if (newSettings.taxRate !== undefined) {
        setTaxPercent(newSettings.taxRate);
      }
      return merged;
    });
  };

  const exportData = () => {
    return exportAllData();
  };

  const importData = (jsonStr: string) => {
    const res = importDataFromJson(jsonStr);
    if (res.success) {
      setMenu(
        safeGet<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU).filter(
          (item) => (item.category as string) !== 'Pastry & Snack'
        )
      );
      const loadedSettings = safeGet<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      const validCashiers =
        Array.isArray(loadedSettings.cashiers) && loadedSettings.cashiers.length > 0
          ? loadedSettings.cashiers
          : ['Kasir 1', 'Barista Rama', 'Kasir Sarah'];
      const validActive =
        loadedSettings.cashierName && validCashiers.includes(loadedSettings.cashierName)
          ? loadedSettings.cashierName
          : validCashiers[0];

      const mergedSettings = {
        ...loadedSettings,
        cashiers: validCashiers,
        cashierName: validActive,
      };

      setSettings(mergedSettings);
      setServiceChargePercent(mergedSettings.serviceChargeRate ?? 5);
      setTaxPercent(mergedSettings.taxRate ?? 10);
      setTransactions(safeGet<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []));
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const resetAllData = () => {
    resetAllDataToDefault();
    setMenu(INITIAL_MENU);
    setSettings(INITIAL_SETTINGS);
    setTransactions([]);
    setCart([]);
    setDiscountValue(0);
    setServiceChargePercent(INITIAL_SETTINGS.serviceChargeRate);
    setTaxPercent(INITIAL_SETTINGS.taxRate);
    setActiveTransaction(null);
    showToast('Seluruh data berhasil di-reset ke default pabrik!', 'warning');
  };

  return (
    <POSContext.Provider
      value={{
        menu,
        addMenuItem,
        updateMenuItem,
        toggleItemAvailability,
        deleteMenuItem,
        resetMenuToDefault,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        updateItemNotes,
        clearCart,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        serviceChargePercent,
        setServiceChargePercent,
        taxPercent,
        setTaxPercent,
        totals,
        transactions,
        activeTransaction,
        setActiveTransaction,
        completeTransaction,
        clearAllTransactions,
        deleteTransaction,
        settings,
        updateSettings,
        exportData,
        importData,
        resetAllData,
        cashiers: settings.cashiers || ['Kasir 1'],
        addCashier,
        updateCashier,
        deleteCashier,
        setActiveCashier,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
