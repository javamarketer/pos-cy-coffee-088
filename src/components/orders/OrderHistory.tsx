import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import type { Transaction } from '../../types/pos';
import { formatRupiah, formatDateTime } from '../../utils/format';
import { ReceiptModal } from '../pos/ReceiptModal';
import {
  BarChart3,
  Banknote,
  QrCode,
  CreditCard,
  Eye,
  Search,
  Receipt,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { transactions, clearAllTransactions, deleteTransaction } = usePOS();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'all'>('today');
  const [search, setSearch] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return transactions.filter((tx) => {
      // Date filter
      const txDateStr = tx.timestamp.slice(0, 10);
      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = txDateStr === todayStr;
      } else if (dateFilter === '7days') {
        matchDate = new Date(tx.timestamp) >= sevenDaysAgo;
      }

      // Search filter (ID, orderNumber, customerName)
      const matchSearch =
        !search.trim() ||
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.orderNumber).includes(search) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(search.toLowerCase()));

      return matchDate && matchSearch;
    });
  }, [transactions, dateFilter, search]);

  // Calculate Metrics from filtered transactions
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let cashRevenue = 0;
    let qrisRevenue = 0;
    let transferRevenue = 0;

    filteredTransactions.forEach((tx) => {
      totalRevenue += tx.total;
      if (tx.paymentMethod === 'cash') cashRevenue += tx.total;
      else if (tx.paymentMethod === 'qris') qrisRevenue += tx.total;
      else if (tx.paymentMethod === 'transfer') transferRevenue += tx.total;
    });

    const totalOrders = filteredTransactions.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      cashRevenue,
      qrisRevenue,
      transferRevenue,
    };
  }, [filteredTransactions]);

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
            <Banknote className="w-3 h-3 text-amber-700" />
            Tunai
          </span>
        );
      case 'qris':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
            <QrCode className="w-3 h-3 text-emerald-700" />
            QRIS
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
            <CreditCard className="w-3 h-3 text-blue-700" />
            Debit
          </span>
        );
      default:
        return m;
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Riwayat Transaksi & Rekap Penjualan
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Ringkasan omzet, rata-rata belanja, dan arsip struk pembayaran digital
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Date Filter Tabs */}
          <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === '7days' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              Semua Periode
            </button>
          </div>

          {/* Reset All Transactions Button */}
          <button
            type="button"
            disabled={transactions.length === 0}
            onClick={() => setIsResetModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              transactions.length === 0
                ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                : 'border-rose-200 text-rose-600 bg-rose-50/70 hover:bg-rose-100 hover:border-rose-300 active:scale-95 shadow-2xs'
            }`}
            title={
              transactions.length === 0
                ? 'Belum ada transaksi tersimpan'
                : 'Hapus dan bersihkan semua riwayat transaksi'
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data Transaksi</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Omzet</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-stone-900">
              {formatRupiah(summary.totalRevenue)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Dari {summary.totalOrders} total transaksi
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Jumlah Order</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-stone-900">
              {summary.totalOrders} <span className="text-xs font-normal text-stone-400">Order</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Struk tersimpan</p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Order</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-stone-900">
              {formatRupiah(summary.averageOrderValue)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Rata-rata per pelanggan</p>
          </div>
        </div>

        {/* Breakdown by Payment Method */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Rincian Metode Bayar
          </span>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center text-amber-900">
              <span className="font-sans text-[11px] text-stone-500">Tunai (Cash):</span>
              <span className="font-bold">{formatRupiah(summary.cashRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-900">
              <span className="font-sans text-[11px] text-stone-500">QRIS:</span>
              <span className="font-bold">{formatRupiah(summary.qrisRevenue)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-900">
              <span className="font-sans text-[11px] text-stone-500">Debit / Trf:</span>
              <span className="font-bold">{formatRupiah(summary.transferRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
            Daftar Riwayat Struk ({filteredTransactions.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID / No Order / Pelanggan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl border-stone-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">No. Order & ID</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Item Pesanan</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Struk & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400 text-xs">
                    Belum ada transaksi tercatat untuk periode ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 font-mono">#{tx.orderNumber}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{tx.id}</div>
                      {tx.customerName && (
                        <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                          Pelanggan: {tx.customerName} {tx.tableNumber ? `(${tx.tableNumber})` : ''}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      {formatDateTime(tx.timestamp)}
                    </td>

                    <td className="py-3 px-3 max-w-xs text-stone-700">
                      <div className="truncate">
                        {tx.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {tx.items.reduce((sum, item) => sum + item.quantity, 0)} total item
                      </div>
                    </td>

                    <td className="py-3 px-3">{getMethodBadge(tx.paymentMethod)}</td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                      {formatRupiah(tx.total)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition active:scale-95"
                          title="Lihat & Cetak Ulang Struk"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus struk pesanan #${tx.orderNumber}?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-95"
                          title={`Hapus Struk #${tx.orderNumber}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Old Receipt Modal */}
      {selectedTx && (
        <ReceiptModal
          isOpen={true}
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onNewTransaction={() => setSelectedTx(null)}
        />
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-stone-900 text-base leading-tight">
                Hapus Semua Data Transaksi?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tindakan ini akan menghapus seluruh{' '}
                <span className="font-bold text-stone-800 font-mono">
                  {transactions.length} riwayat pesanan
                </span>{' '}
                secara permanen dari browser. Rekap omzet akan kembali ke Rp 0 dan urutan nomor order berikutnya akan di-reset ke #1.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition active:scale-95"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllTransactions();
                  setIsResetModalOpen(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm active:scale-95 shadow-rose-900/20"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
