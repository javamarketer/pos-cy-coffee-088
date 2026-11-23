import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { parseSafeNumber } from '../../utils/format';
import {
  Store,
  FileDown,
  FileUp,
  RotateCcw,
  Save,
  Cloud,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetAllData,
    cashiers,
    addCashier,
    updateCashier,
    deleteCashier,
    setActiveCashier,
    showToast,
  } = usePOS();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Local State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [serviceChargeRate, setServiceChargeRate] = useState(
    settings.serviceChargeRate !== undefined ? settings.serviceChargeRate : 5
  );
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  // Cashier Management Local State
  const [newCashierInput, setNewCashierInput] = useState('');
  const [editingCashierOldName, setEditingCashierOldName] = useState<string | null>(null);
  const [editingCashierNewName, setEditingCashierNewName] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      serviceChargeRate: Math.max(0, serviceChargeRate),
      taxRate: Math.max(0, taxRate),
      receiptFooter: receiptFooter.trim(),
    });
    showToast('Pengaturan toko berhasil disimpan.', 'success');
  };

  const handleAddCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (addCashier(newCashierInput)) {
      setNewCashierInput('');
    }
  };

  const startEditCashier = (name: string) => {
    setEditingCashierOldName(name);
    setEditingCashierNewName(name);
  };

  const saveEditCashier = () => {
    if (!editingCashierOldName) return;
    if (updateCashier(editingCashierOldName, editingCashierNewName)) {
      setEditingCashierOldName(null);
      setEditingCashierNewName('');
    }
  };

  const cancelEditCashier = () => {
    setEditingCashierOldName(null);
    setEditingCashierNewName('');
  };

  const handleDeleteCashier = (name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kasir "${name}"?`)) {
      deleteCashier(name);
    }
  };

  const handleExportJson = () => {
    try {
      const jsonStr = exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `cy-coffee-pos-backup-${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('File backup JSON berhasil diunduh.', 'success');
    } catch (err) {
      showToast('Gagal mengunduh file backup: ' + (err instanceof Error ? err.message : 'Error'), 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm('Import data ini akan memperbarui daftar menu, riwayat transaksi, dan pengaturan toko Anda. Lanjutkan?')) {
        const result = importData(content);
        if (result.success) {
          // Sync local form state
          setStoreName(settings.storeName);
          setAddress(settings.address);
          setServiceChargeRate(settings.serviceChargeRate !== undefined ? settings.serviceChargeRate : 5);
          setTaxRate(settings.taxRate);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin me-reset SEMUA data (menu, riwayat transaksi, pengaturan, kasir) ke kondisi awal default pabrik?')) {
      resetAllData();
      setStoreName('CY Coffee & Roastery');
      setTagline('Artisan Coffee & Good Vibes');
      setAddress('Jl. Senopati No. 8, Jakarta Selatan');
      setPhone('0812-3456-7890');
      setServiceChargeRate(5);
      setTaxRate(10);
      setReceiptFooter('Terima kasih atas kunjungan Anda!\nFollow @cycoffee.id');
    }
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Pengaturan Toko & Manajemen Data
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Konfigurasi identitas coffee shop, manajemen kasir, tarif Service Charge & PB1, dan backup JSON
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <Store className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT / CENTER: STORE SETTINGS & CASHIER MANAGER (Col span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. KASIR / STAFF MANAGEMENT SECTION */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Manajemen Nama Kasir / Barista</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tambah, ubah, atau hapus nama kasir toko dan tentukan kasir yang aktif bertugas
                </p>
              </div>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                {cashiers.length} Kasir Terdaftar
              </span>
            </div>

            {/* Form Tambah Kasir Baru */}
            <form onSubmit={handleAddCashier} className="flex items-center gap-2">
              <input
                type="text"
                value={newCashierInput}
                onChange={(e) => setNewCashierInput(e.target.value)}
                placeholder="Ketik nama kasir baru (misal: Barista Dimas)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Kasir</span>
              </button>
            </form>

            {/* List of Cashiers */}
            <div className="space-y-2 pt-1 divide-y divide-stone-100">
              {cashiers.map((name) => {
                const isActive = settings.cashierName === name;
                const isEditing = editingCashierOldName === name;

                return (
                  <div
                    key={name}
                    className={`pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl transition ${
                      isActive ? 'bg-emerald-50/70 border border-emerald-200/80' : 'hover:bg-stone-50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCashierNewName}
                          onChange={(e) => setEditingCashierNewName(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditCashier();
                            if (e.key === 'Escape') cancelEditCashier();
                          }}
                        />
                        <button
                          type="button"
                          onClick={saveEditCashier}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs"
                          title="Simpan Perubahan"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditCashier}
                          className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {name}
                          </p>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sedang Bertugas (Aktif)
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => setActiveCashier(name)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                            title="Jadikan kasir aktif"
                          >
                            Pilih / Aktifkan
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Aktif
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => startEditCashier(name)}
                          className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Ubah Nama Kasir"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={cashiers.length <= 1}
                          onClick={() => handleDeleteCashier(name)}
                          className={`p-1.5 rounded-lg transition ${
                            cashiers.length <= 1
                              ? 'text-stone-300 cursor-not-allowed'
                              : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={
                            cashiers.length <= 1
                              ? 'Minimal harus ada 1 nama kasir'
                              : 'Hapus Kasir'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. STORE IDENTITY & RATES SECTION */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Identitas Coffee Shop & Tarif Pajak
              </h3>
              <p className="text-xs text-stone-500">
                Informasi ini akan tercetak langsung pada bagian atas dan bawah struk transaksi
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Coffee Shop *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Contoh: Artisan Coffee & Good Vibes"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Alamat Toko</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kasir Aktif Saat Ini
                  </label>
                  <select
                    value={settings.cashierName}
                    onChange={(e) => setActiveCashier(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {cashiers.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Charge & PB1 Tax Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Service Charge (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={serviceChargeRate}
                      onChange={(e) => setServiceChargeRate(parseSafeNumber(e.target.value, 0))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">Biaya layanan toko (misal: 5%, 0% jika tidak ada)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Pajak Resto / PB1 (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseSafeNumber(e.target.value, 0))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">Tarif PB1 restoran (misal: 10%, 0% jika tanpa pajak)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Catatan Footer Struk (Thermal Receipt Note)
                </label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: BACKUP, RESTORE & CLOUDFLARE INFO (Col span 1) */}
        <div className="space-y-5">
          {/* Backup & Restore JSON */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Cadangan & Pemulihan (JSON)</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Simpan file cadangan transaksi, daftar kasir & menu ke komputer Anda
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
              >
                <FileDown className="w-4 h-4 text-emerald-700" />
                <span>Ekspor Backup JSON</span>
              </button>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
                >
                  <FileUp className="w-4 h-4 text-blue-700" />
                  <span>Impor / Pulihkan JSON</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset ke Default Pabrik</span>
              </button>
            </div>
          </div>

          {/* Cloudflare Pages Deploy Info */}
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Cloud className="w-4 h-4" />
              <span>Deploy ke Cloudflare</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Aplikasi ini 100% statis & bebas server backend rumit. Siap di-deploy langsung ke Cloudflare Pages.
            </p>

            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 space-y-1">
              <p className="text-emerald-400"># 1. Build</p>
              <p>npm run build</p>
              <p className="text-emerald-400 pt-1"># 2. Output directory</p>
              <p className="text-emerald-300">dist</p>
              <p className="text-emerald-400 pt-1"># 3. SPA Routing</p>
              <p className="text-stone-400">_redirects sudah tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
