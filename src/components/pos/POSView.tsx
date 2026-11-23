import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import type { Category } from '../../types/pos';
import { MenuCard } from './MenuCard';
import { CartPanel } from './CartPanel';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { Search, X } from 'lucide-react';

const CATEGORIES: ('Semua' | Category)[] = [
  'Semua',
  'Coffee',
  'Non-Coffee',
  'Manual Brew',
  'Foods',
  'Snacks',
  'Add-on',
];

interface POSViewProps {
  isMobileCartOpen: boolean;
  setIsMobileCartOpen: (open: boolean) => void;
}

export const POSView: React.FC<POSViewProps> = ({ isMobileCartOpen, setIsMobileCartOpen }) => {
  const { menu, activeTransaction, setActiveTransaction } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<'Semua' | Category>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[calc(100vh-4rem)]">
      {/* LEFT SECTION: CATALOG & SEARCH (Span 7 or 8 on desktop) */}
      <section className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
        {/* Search Bar & Quick Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, latte, makanan, snack, add-on..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] text-stone-500 font-medium px-2 shrink-0">
            Menampilkan <span className="font-bold text-stone-800">{filteredMenu.length}</span> menu
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/70'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Menu Cards Grid */}
        <div className="flex-1">
          {filteredMenu.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-bold text-stone-700 text-sm">Tidak ada menu yang cocok</p>
              <p className="text-xs text-stone-400 max-w-xs">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredMenu.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT SECTION: CART PANEL (Desktop Sticky, Span 5 or 4) */}
      <section className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20 h-[calc(100vh-6rem)]">
        <CartPanel onCheckout={() => setIsPaymentModalOpen(true)} />
      </section>

      {/* MOBILE SLIDE-OVER CART DRAWER */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <CartPanel
              onCheckout={() => {
                setIsMobileCartOpen(false);
                setIsPaymentModalOpen(true);
              }}
              onCloseMobile={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
        }}
      />

      {/* Receipt Modal (after order is completed or view old receipt) */}
      <ReceiptModal
        isOpen={activeTransaction !== null}
        transaction={activeTransaction}
        onClose={() => setActiveTransaction(null)}
        onNewTransaction={() => setActiveTransaction(null)}
      />
    </div>
  );
};
