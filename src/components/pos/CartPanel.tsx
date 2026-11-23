import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, parseSafeNumber } from '../../utils/format';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Receipt,
  FileText,
  CreditCard,
  Coins,
  Sparkles,
  X,
} from 'lucide-react';

interface CartPanelProps {
  onCheckout: () => void;
  onCloseMobile?: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onCheckout, onCloseMobile }) => {
  const {
    cart,
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
  } = usePOS();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const handleOpenNote = (cartItemId: string, currentNote = '') => {
    setEditingNoteId(cartItemId);
    setNoteDraft(currentNote || '');
  };

  const handleSaveNote = (cartItemId: string) => {
    updateItemNotes(cartItemId, noteDraft.trim());
    setEditingNoteId(null);
    setNoteDraft('');
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseSafeNumber(e.target.value, 0);
    if (discountType === 'percent') {
      setDiscountValue(Math.min(100, Math.max(0, val)));
    } else {
      setDiscountValue(Math.max(0, val));
    }
  };

  const isCartEmpty = cart.length === 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-sm sm:text-base leading-none">
              Pesanan Saat Ini
            </h2>
            <p className="text-[11px] text-stone-500 mt-1">
              {cart.length} jenis item ({cart.reduce((a, b) => a + b.quantity, 0)} total)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCartEmpty && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-medium transition"
              title="Kosongkan Keranjang"
            >
              Reset
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 divide-y divide-stone-100">
        {isCartEmpty ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-stone-700 text-sm">Keranjang Masih Kosong</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Pilih menu di katalog kasir untuk mulai menambahkan pesanan.
              </p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartItemId} className="pt-2.5 first:pt-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                    {item.name}
                  </h4>
                  {/* Selected Variants pill */}
                  {item.selectedVariants && item.selectedVariants.length > 0 && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {item.selectedVariants.map((v) => v.optionName).join(' • ')}
                    </p>
                  )}
                  {/* Item unit price */}
                  <span className="text-[11px] text-stone-500 font-mono">
                    {formatRupiah(item.unitPrice)}
                  </span>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-stone-900 text-xs sm:text-sm font-mono block">
                    {formatRupiah(item.subtotal)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-[11px] text-stone-400 hover:text-rose-600 transition inline-flex items-center gap-0.5 mt-0.5"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Note Line or Trigger */}
              <div className="flex items-center justify-between gap-2">
                {editingNoteId === item.cartItemId ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Contoh: Less ice, gula terpisah..."
                      className="text-xs px-2.5 py-1 rounded-lg border border-emerald-400 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(item.cartItemId)}
                    />
                    <button
                      onClick={() => handleSaveNote(item.cartItemId)}
                      className="text-xs px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-600 shrink-0"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.notes ? (
                      <button
                        onClick={() => handleOpenNote(item.cartItemId, item.notes)}
                        className="text-[11px] text-stone-600 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 rounded-md px-2 py-0.5 flex items-center gap-1 transition text-left"
                      >
                        <FileText className="w-3 h-3 text-emerald-600" />
                        <span className="italic truncate max-w-[170px]">"{item.notes}"</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenNote(item.cartItemId)}
                        className="text-[10px] text-stone-400 hover:text-emerald-700 flex items-center gap-1 transition font-medium"
                      >
                        <FileText className="w-3 h-3" />
                        <span>+ Catatan</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 ml-auto shrink-0 bg-stone-100 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-2xs"
                    title="Kurangi Qty"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-2xs"
                    title="Tambah Qty"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculation & Checkout Footer */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
        {/* Discount, Service Charge & Tax Options */}
        <div className="space-y-2 pt-1">
          {/* Discount line */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs font-medium text-stone-700">Diskon</span>
              <div className="inline-flex rounded-md p-0.5 bg-stone-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setDiscountType('nominal')}
                  className={`px-1.5 py-0.5 rounded ${
                    discountType === 'nominal' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  Rp
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`px-1.5 py-0.5 rounded ${
                    discountType === 'percent' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  %
                </button>
              </div>
            </div>

            <div className="relative w-28">
              <input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : undefined}
                value={discountValue === 0 ? '' : discountValue}
                onChange={handleDiscountChange}
                placeholder="0"
                className="w-full text-right text-xs py-1 px-2 pr-6 rounded-lg border border-stone-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-bold">
                {discountType === 'percent' ? '%' : 'Rp'}
              </span>
            </div>
          </div>

          {/* Service Charge Setting Line */}
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              <span>Service Charge</span>
            </span>
            <div className="flex items-center gap-1">
              {[0, 5, 10].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setServiceChargePercent(pct)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                    serviceChargePercent === pct
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Tax Setting Line */}
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-stone-400" />
              <span>PB1 / Pajak Resto</span>
            </span>
            <div className="flex items-center gap-1">
              {[0, 10, 11].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTaxPercent(pct)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                    taxPercent === pct
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-1 text-xs text-stone-600 pt-2 border-t border-stone-200 font-mono">
          <div className="flex justify-between">
            <span className="font-sans text-stone-500">Subtotal:</span>
            <span>{formatRupiah(totals.subtotal)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span className="font-sans">Diskon:</span>
              <span>-{formatRupiah(totals.discountAmount)}</span>
            </div>
          )}

          {totals.serviceChargeAmount > 0 && (
            <div className="flex justify-between text-stone-600">
              <span className="font-sans">Service Charge ({serviceChargePercent}%):</span>
              <span>+{formatRupiah(totals.serviceChargeAmount)}</span>
            </div>
          )}

          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-stone-500">
              <span className="font-sans">Pajak ({taxPercent}%):</span>
              <span>+{formatRupiah(totals.taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-stone-300 text-stone-900">
            <span className="text-sm font-sans font-bold">Total Bayar:</span>
            <span className="text-lg font-black text-emerald-900 font-mono">
              {formatRupiah(totals.total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          type="button"
          disabled={isCartEmpty}
          onClick={onCheckout}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isCartEmpty
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white shadow-emerald-900/20'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Bayar Sekarang ({formatRupiah(totals.total)})</span>
        </button>
      </div>
    </div>
  );
};
