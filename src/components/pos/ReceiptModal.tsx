import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Transaction } from '../../types/pos';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, formatDateTime } from '../../utils/format';
import { Printer, PlusCircle, X, CheckCircle, Coffee, FileText, ScrollText } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

type PrintPaperSize = 'thermal' | 'a6';

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  const { settings } = usePOS();
  const [paperSize, setPaperSize] = useState<PrintPaperSize>('thermal');

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Tunai (Cash)';
      case 'qris':
        return 'QRIS';
      case 'transfer':
        return 'Debit / Transfer';
      default:
        return method;
    }
  };

  // =========================================================================
  // CONTENT RENDERER: THERMAL RECEIPT
  // =========================================================================
  const renderThermalReceipt = (isPrintVersion = false) => (
    <div
      className={`font-mono text-stone-900 text-xs bg-white ${
        isPrintVersion
          ? 'single-page-receipt mode-thermal'
          : 'p-5 overflow-y-auto max-h-[60vh]'
      }`}
    >
      {/* Header Store */}
      <div className="text-center space-y-0.5 pb-2.5 border-b border-dashed border-stone-400">
        <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-1 no-print">
          <Coffee className="w-3.5 h-3.5" />
        </div>
        <h2 className="font-extrabold text-sm uppercase tracking-tight text-black">
          {settings.storeName}
        </h2>
        {settings.tagline && (
          <p className="text-[10px] text-stone-500 italic leading-none">{settings.tagline}</p>
        )}
        <p className="text-[10px] text-stone-600 leading-tight whitespace-pre-line pt-0.5">
          {settings.address}
        </p>
        {settings.phone && (
          <p className="text-[10px] text-stone-600">Telp: {settings.phone}</p>
        )}
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span>Order:</span>
          <span className="font-bold">#{transaction.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Trx ID:</span>
          <span className="text-[10px]">{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{formatDateTime(transaction.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction.cashierName}</span>
        </div>
        {transaction.customerName && (
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span className="font-semibold">{transaction.customerName}</span>
          </div>
        )}
        {transaction.tableNumber && (
          <div className="flex justify-between">
            <span>Meja:</span>
            <span className="font-semibold">{transaction.tableNumber}</span>
          </div>
        )}
      </div>

      {/* Items breakdown */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-1.5 text-[11px]">
        {transaction.items.map((item, index) => (
          <div key={index} className="space-y-0.5">
            <div className="flex justify-between font-bold leading-tight">
              <span className="truncate max-w-[190px]">{item.name}</span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
            {item.selectedVariants && item.selectedVariants.length > 0 && (
              <p className="text-[10px] text-stone-500 leading-none">
                {item.selectedVariants.map((v) => v.optionName).join(', ')}
              </p>
            )}
            {item.notes && (
              <p className="text-[10px] italic text-stone-600 leading-none">Note: {item.notes}</p>
            )}
            <div className="text-[10px] text-stone-500">
              {item.quantity} x {formatRupiah(item.unitPrice)}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Totals */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(transaction.subtotal)}</span>
        </div>

        {transaction.discountAmount > 0 && (
          <div className="flex justify-between text-stone-600">
            <span>
              Diskon {transaction.discountType === 'percent' ? `(${transaction.discountValue}%)` : ''}:
            </span>
            <span>-{formatRupiah(transaction.discountAmount)}</span>
          </div>
        )}

        {(transaction.serviceChargeAmount || 0) > 0 && (
          <div className="flex justify-between text-stone-600">
            <span>Service Charge ({transaction.serviceChargePercent}%):</span>
            <span>+{formatRupiah(transaction.serviceChargeAmount)}</span>
          </div>
        )}

        {transaction.taxAmount > 0 && (
          <div className="flex justify-between text-stone-600">
            <span>PB1 ({transaction.taxPercent}%):</span>
            <span>+{formatRupiah(transaction.taxAmount)}</span>
          </div>
        )}

        <div className="flex justify-between pt-1 border-t border-stone-300 font-bold text-sm text-black">
          <span>TOTAL:</span>
          <span>{formatRupiah(transaction.total)}</span>
        </div>

        <div className="flex justify-between pt-0.5">
          <span>Metode:</span>
          <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
        </div>

        {transaction.paymentMethod === 'cash' && (
          <>
            <div className="flex justify-between">
              <span>Diterima:</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembalian:</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer Receipt Note */}
      <div className="pt-2 text-center text-[10px] text-stone-500 space-y-0.5 leading-tight">
        <p className="whitespace-pre-line">{settings.receiptFooter}</p>
        <p className="text-[9px] text-stone-400 pt-0.5">Powered by CY Coffee POS Cloud</p>
      </div>
    </div>
  );

  // =========================================================================
  // CONTENT RENDERER: A6 INVOICE / NOTA PENJUALAN
  // =========================================================================
  const renderA6Receipt = (isPrintVersion = false) => (
    <div
      className={`text-stone-900 bg-white space-y-2.5 ${
        isPrintVersion
          ? 'single-page-receipt mode-a6'
          : 'p-5 overflow-y-auto max-h-[60vh] text-xs'
      }`}
    >
      {/* Header: Store Info (Left) & Invoice Meta (Right) */}
      <div className="flex items-start justify-between border-b-2 border-stone-800 pb-2 gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <h2 className="font-black text-sm uppercase tracking-tight text-black">
              {settings.storeName}
            </h2>
          </div>
          {settings.tagline && (
            <p className="text-[9px] text-stone-500 italic leading-none">{settings.tagline}</p>
          )}
          <p className="text-[9px] text-stone-600 leading-tight max-w-[210px]">
            {settings.address}
          </p>
          {settings.phone && (
            <p className="text-[9px] text-stone-600 font-mono">Telp: {settings.phone}</p>
          )}
        </div>

        <div className="text-right space-y-0.5">
          <div className="inline-block bg-stone-900 text-white font-extrabold text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded">
            NOTA PENJUALAN
          </div>
          <div className="text-[11px] font-mono font-bold text-stone-900">
            Order <span className="text-emerald-800">#{transaction.orderNumber}</span>
          </div>
          <div className="text-[9px] text-stone-500 font-mono">{transaction.id}</div>
          <div className="text-[9px] text-stone-600">{formatDateTime(transaction.timestamp)}</div>
        </div>
      </div>

      {/* Customer & Cashier info bar */}
      <div className="grid grid-cols-3 gap-1 bg-stone-50 p-1.5 rounded border border-stone-200 text-[9px]">
        <div>
          <span className="text-stone-400 block font-semibold uppercase text-[8px]">Kasir</span>
          <span className="font-bold text-stone-800 truncate block">{transaction.cashierName}</span>
        </div>
        <div>
          <span className="text-stone-400 block font-semibold uppercase text-[8px]">Pelanggan</span>
          <span className="font-bold text-stone-800 truncate block">{transaction.customerName || '-'}</span>
        </div>
        <div>
          <span className="text-stone-400 block font-semibold uppercase text-[8px]">Meja / Posisi</span>
          <span className="font-bold text-stone-800 truncate block">{transaction.tableNumber || 'Take Away'}</span>
        </div>
      </div>

      {/* A6 Item Table */}
      <div className="border border-stone-400 rounded overflow-hidden">
        <table className="w-full text-left text-[9px] border-collapse">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-400 font-bold uppercase text-stone-800">
              <th className="py-1 px-1.5 w-5 text-center">No</th>
              <th className="py-1 px-1.5">Menu & Varian</th>
              <th className="py-1 px-1.5 text-center w-8">Qty</th>
              <th className="py-1 px-1.5 text-right w-16">Harga</th>
              <th className="py-1 px-1.5 text-right w-18">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-300">
            {transaction.items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-0.5 px-1.5 text-center text-stone-500 font-mono">{idx + 1}</td>
                <td className="py-0.5 px-1.5">
                  <div className="font-bold text-stone-900 leading-tight">{item.name}</div>
                  {item.selectedVariants && item.selectedVariants.length > 0 && (
                    <div className="text-[8px] text-stone-500 leading-none">
                      {item.selectedVariants.map((v) => v.optionName).join(' • ')}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-[8px] italic text-emerald-800 leading-none">
                      Note: {item.notes}
                    </div>
                  )}
                </td>
                <td className="py-0.5 px-1.5 text-center font-mono font-semibold">{item.quantity}</td>
                <td className="py-0.5 px-1.5 text-right font-mono text-stone-600">
                  {formatRupiah(item.unitPrice)}
                </td>
                <td className="py-0.5 px-1.5 text-right font-mono font-bold text-stone-900">
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Split: Left Message/Sign & Right Totals */}
      <div className="grid grid-cols-12 gap-2 pt-0.5">
        {/* Left sign-off (Span 6) */}
        <div className="col-span-6 flex flex-col justify-between text-[9px] text-stone-600 pr-1">
          <div className="space-y-0.5">
            <p className="font-semibold text-stone-800 text-[8.5px]">Catatan:</p>
            <p className="whitespace-pre-line leading-tight italic text-stone-500 text-[8.5px]">
              {settings.receiptFooter}
            </p>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[8px] text-stone-400 mb-4">Hormat Kami / Kasir,</p>
            <p className="font-bold text-[9px] border-t border-stone-300 pt-0.5 inline-block min-w-[90px] text-stone-800">
              ( {transaction.cashierName} )
            </p>
          </div>
        </div>

        {/* Right Financial summary (Span 6) */}
        <div className="col-span-6 space-y-0.5 text-[9px] font-mono border-l border-stone-200 pl-2">
          <div className="flex justify-between text-stone-600">
            <span className="font-sans">Subtotal:</span>
            <span>{formatRupiah(transaction.subtotal)}</span>
          </div>

          {transaction.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span className="font-sans">
                Diskon {transaction.discountType === 'percent' ? `(${transaction.discountValue}%)` : ''}:
              </span>
              <span>-{formatRupiah(transaction.discountAmount)}</span>
            </div>
          )}

          {(transaction.serviceChargeAmount || 0) > 0 && (
            <div className="flex justify-between text-stone-600">
              <span className="font-sans">Service Charge ({transaction.serviceChargePercent}%):</span>
              <span>+{formatRupiah(transaction.serviceChargeAmount)}</span>
            </div>
          )}

          {transaction.taxAmount > 0 && (
            <div className="flex justify-between text-stone-600">
              <span className="font-sans">PB1 ({transaction.taxPercent}%):</span>
              <span>+{formatRupiah(transaction.taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between pt-0.5 border-t-2 border-stone-800 font-black text-[11px] text-black">
            <span className="font-sans">TOTAL:</span>
            <span>{formatRupiah(transaction.total)}</span>
          </div>

          <div className="flex justify-between pt-0.5 text-stone-600">
            <span className="font-sans">Metode:</span>
            <span className="font-sans font-semibold">
              {getPaymentMethodLabel(transaction.paymentMethod)}
            </span>
          </div>

          {transaction.paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between text-stone-600">
                <span className="font-sans">Diterima:</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 border-t border-dashed border-stone-300 pt-0.5">
                <span className="font-sans">Kembalian:</span>
                <span>{formatRupiah(transaction.change)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center text-[8px] text-stone-400 pt-1 border-t border-stone-100">
        Dicetak via CY Coffee POS Cloud • Kertas A6 (105 × 148 mm)
      </div>
    </div>
  );

  const printRoot = typeof document !== 'undefined' ? document.getElementById('receipt-print-root') : null;

  return (
    <>
      {/* 1. PORTAL: RENDERED DIRECTLY INTO #receipt-print-root (OUTSIDE #root) FOR PRINTING */}
      {printRoot &&
        createPortal(
          <>
            {/* Dynamic CSS rule to lock strictly 1 page in browser print preview */}
            <style>
              {paperSize === 'a6'
                ? `@page { size: A6 portrait; margin: 4mm; }`
                : `@page { size: 80mm auto; margin: 0; }`}
            </style>
            {paperSize === 'thermal' ? renderThermalReceipt(true) : renderA6Receipt(true)}
          </>,
          printRoot
        )}

      {/* 2. ON-SCREEN MODAL: PREVIEW FOR USER INTERACTION (INSIDE #root, HIDDEN ON PRINT) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 no-print">
        <div
          className={`bg-white rounded-3xl border border-stone-200 shadow-2xl w-full overflow-hidden flex flex-col my-auto transition-all duration-300 ${
            paperSize === 'a6' ? 'max-w-lg' : 'max-w-sm'
          }`}
        >
          {/* Modal Top Actions */}
          <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Transaksi Sukses</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Paper Size Switcher Tabs */}
          <div className="px-4 py-2 bg-stone-100/90 border-b border-stone-200/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-stone-600 shrink-0">Ukuran Kertas:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-stone-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaperSize('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  paperSize === 'thermal'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Thermal 58/80mm</span>
              </button>

              <button
                type="button"
                onClick={() => setPaperSize('a6')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  paperSize === 'a6'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Printer Biasa (A6)</span>
              </button>
            </div>
          </div>

          {/* Visual on-screen preview */}
          {paperSize === 'thermal' ? renderThermalReceipt(false) : renderA6Receipt(false)}

          {/* Modal Bottom Actions */}
          <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>
                Cetak 1 Lembar ({paperSize === 'thermal' ? 'Thermal Roll' : 'Kertas A6'})
              </span>
            </button>

            <button
              type="button"
              onClick={onNewTransaction}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Transaksi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
