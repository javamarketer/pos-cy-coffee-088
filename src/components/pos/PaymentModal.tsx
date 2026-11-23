import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import type { PaymentMethod } from '../../types/pos';
import { formatRupiah, parseSafeNumber } from '../../utils/format';
import { calculateChange } from '../../utils/calc';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  User,
  Hash,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { totals, completeTransaction, showToast } = usePOS();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totals.total);
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');

  // Sync cashTendered whenever totals change or modal opens
  useEffect(() => {
    if (isOpen) {
      setCashTendered(totals.total);
      setCustomerName('');
      setTableNumber('');
      setMethod('cash');
    }
  }, [isOpen, totals.total]);

  if (!isOpen) return null;

  const total = totals.total;
  const change = calculateChange(total, cashTendered);
  const isCashInsufficient = method === 'cash' && cashTendered < total;

  // Preset cash denominations
  const quickCashOptions = [
    { label: 'Uang Pas', amount: total },
    { label: 'Rp 20.000', amount: 20000 },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
  ].filter((opt) => opt.amount >= total || opt.label === 'Uang Pas');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'cash' && isCashInsufficient) {
      showToast('Uang tunai yang diterima kurang dari total pembayaran!', 'error');
      return;
    }

    completeTransaction(
      method,
      method === 'cash' ? cashTendered : total,
      customerName,
      tableNumber
    );

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              Pembayaran Transaksi
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Pilih metode bayar dan input nominal yang diterima kasir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Total Tag Display */}
          <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-2xl p-4 text-center shadow-inner">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-200/80">
              Total Tagihan
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-emerald-100">
              {formatRupiah(total)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Banknote className="w-6 h-6 mb-1 text-emerald-700" />
                <span className="text-xs">Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                  method === 'qris'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <QrCode className="w-6 h-6 mb-1 text-emerald-700" />
                <span className="text-xs">QRIS Instan</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                  method === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-1 text-emerald-700" />
                <span className="text-xs">Debit / Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Quick Buttons */}
          {method === 'cash' && (
            <div className="space-y-3 bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Uang Diterima Kasir:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={cashTendered === 0 ? '' : cashTendered}
                    onChange={(e) => setCashTendered(parseSafeNumber(e.target.value, 0))}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-lg font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCashTendered(opt.amount)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 text-stone-700 transition"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isCashInsufficient ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="text-xs font-semibold">
                    {isCashInsufficient ? 'Uang Kurang:' : 'Kembalian:'}
                  </span>
                </div>
                <span className="font-mono font-black text-base">
                  {isCashInsufficient
                    ? formatRupiah(total - cashTendered)
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {/* QRIS Display Mode */}
          {method === 'qris' && (
            <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4 text-center space-y-3">
              <div className="inline-block p-3 bg-white rounded-xl shadow-sm border border-stone-200">
                <div className="w-40 h-40 bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
                  <QrCode className="w-24 h-24 text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-widest mt-1">QRIS STANDAR</span>
                  <span className="text-[9px] text-stone-400">NMID: ID1029384756</span>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Arahkan pelanggan scan kode QRIS di atas melalui GoPay, OVO, BCA, atau bank lain.
              </p>
            </div>
          )}

          {/* Debit/Transfer Display Mode */}
          {method === 'transfer' && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 text-xs text-stone-600">
              <p className="font-semibold text-stone-800">Instruksi Pembayaran Debit / EDC:</p>
              <p>1. Gesek atau masukkan kartu debit/kredit pelanggan pada mesin EDC.</p>
              <p>2. Pastikan nominal pembayaran adalah <span className="font-bold font-mono text-stone-900">{formatRupiah(total)}</span>.</p>
              <p>3. Setelah struk EDC keluar sukses, tekan tombol konfirmasi di bawah.</p>
            </div>
          )}

          {/* Optional Order Details: Customer Name & Table */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                Nama Pelanggan (Opsional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Dimas"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-stone-400" />
                No. Meja / Dine-in (Opsional)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Meja 05 / Take Away"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={method === 'cash' && isCashInsufficient}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                method === 'cash' && isCashInsufficient
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi & Cetak Struk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
