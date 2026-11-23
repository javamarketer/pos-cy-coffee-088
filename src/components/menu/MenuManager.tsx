import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import type { MenuItem, Category, VariantGroup } from '../../types/pos';
import { formatRupiah, parseSafeNumber } from '../../utils/format';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Coffee',
  'Non-Coffee',
  'Manual Brew',
  'Foods',
  'Snacks',
  'Add-on',
];

export const MenuManager: React.FC = () => {
  const { menu, addMenuItem, updateMenuItem, toggleItemAvailability, deleteMenuItem, resetMenuToDefault } =
    usePOS();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'Semua' | Category>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Coffee');
  const [basePrice, setBasePrice] = useState<number>(20000);
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Quick variant presets generator
  const [includeTempVariant, setIncludeTempVariant] = useState(false);
  const [includeSizeVariant, setIncludeSizeVariant] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Coffee');
    setBasePrice(20000);
    setDescription('');
    setBadge('');
    setIsAvailable(true);
    setIncludeTempVariant(false);
    setIncludeSizeVariant(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setBasePrice(item.basePrice);
    setDescription(item.description || '');
    setBadge(item.badge || '');
    setIsAvailable(item.isAvailable);

    const hasTemp = item.variants?.some((v) => v.id === 'temp') || false;
    const hasSize = item.variants?.some((v) => v.id === 'size') || false;
    setIncludeTempVariant(hasTemp);
    setIncludeSizeVariant(hasSize);

    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build variants
    const variants: VariantGroup[] = [];
    if (includeTempVariant) {
      variants.push({
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      });
    }
    if (includeSizeVariant) {
      variants.push({
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 4000 },
        ],
        defaultOptionId: 'reg',
      });
    }

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: name.trim(),
        category,
        basePrice: Math.max(0, basePrice),
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
        isAvailable,
        variants: variants.length > 0 ? variants : undefined,
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category,
        basePrice: Math.max(0, basePrice),
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
        isAvailable,
        variants: variants.length > 0 ? variants : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${itemName}" dari daftar menu?`)) {
      deleteMenuItem(id);
    }
  };

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = selectedCat === 'Semua' || item.category === selectedCat;
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menu, selectedCat, search]);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Manajemen Menu & Kategori
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola ketersediaan stok, harga dasar, dan varian menu kopi & makanan
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (confirm('Kembalikan seluruh menu ke daftar default bawaan? Menu kustom Anda akan terganti.')) {
                resetMenuToDefault();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['Semua', ...CATEGORIES] as ('Semua' | Category)[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Menu Items Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Menu & Deskripsi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga Dasar</th>
                <th className="py-3.5 px-4">Varian Aktif</th>
                <th className="py-3.5 px-4 text-center">Status Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">
                    Tidak ada menu ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/80 transition ${
                      !item.isAvailable ? 'bg-stone-50/40 text-stone-400' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-medium text-stone-600">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-stone-900 text-sm">
                      {formatRupiah(item.basePrice)}
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.variants.map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded px-1.5 py-0.5"
                            >
                              {v.name} ({v.options.length})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Klik untuk ubah ketersediaan"
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersedia</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Menu"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* MODAL: ADD / EDIT MENU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">
                {editingItem ? 'Edit Menu Kopi / Makanan' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Menu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Caramel Latte / Aren Cold Brew"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Harga Dasar (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseSafeNumber(e.target.value, 0))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tasting notes, bahan baku, atau takaran..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Badge Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Contoh: Signature, Best Seller, Baru"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Varian Cepat Checklist */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2">
                <span className="block text-xs font-bold text-stone-700">Aktifkan Varian Cepat:</span>
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTempVariant}
                    onChange={(e) => setIncludeTempVariant(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span>Suhu (Iced / Hot)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSizeVariant}
                    onChange={(e) => setIncludeSizeVariant(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span>Ukuran (Regular / Large +Rp4.000)</span>
                </label>
              </div>

              {/* Status Tersedia */}
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <span>Menu langsung tersedia untuk dipesan di kasir</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
