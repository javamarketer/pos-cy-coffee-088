import React, { useState } from 'react';
import type { MenuItem, SelectedVariant, VariantGroup } from '../../types/pos';
import { formatRupiah } from '../../utils/format';
import { Plus, Sparkles } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart } = usePOS();

  // Initialize default selected variants if present
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(() => {
    if (!item.variants || item.variants.length === 0) return [];
    return item.variants.map((group) => {
      const defaultOpt =
        group.options.find((o) => o.id === group.defaultOptionId) || group.options[0];
      return {
        groupId: group.id,
        groupName: group.name,
        optionId: defaultOpt?.id || '',
        optionName: defaultOpt?.name || '',
        priceDelta: defaultOpt?.priceDelta || 0,
      };
    });
  });

  // Calculate current price with variants
  const extraPrice = selectedVariants.reduce((sum, v) => sum + (v.priceDelta || 0), 0);
  const currentPrice = item.basePrice + extraPrice;

  const handleVariantSelect = (group: VariantGroup, optionId: string) => {
    const option = group.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedVariants((prev) => {
      const filtered = prev.filter((v) => v.groupId !== group.id);
      return [
        ...filtered,
        {
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        },
      ];
    });
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    addToCart(item, selectedVariants);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        item.isAvailable
          ? 'border-stone-200 hover:border-emerald-400 hover:shadow-lg shadow-sm hover:-translate-y-0.5'
          : 'border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Top Header Card */}
      <div className="p-3.5 sm:p-4">
        {/* Badges */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            {item.category}
          </span>
          <div className="flex items-center gap-1">
            {item.badge && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                {item.badge}
              </span>
            )}
            {!item.isAvailable && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Habis
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug line-clamp-1 group-hover:text-emerald-800 transition">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Quick Variant Pills (If Available) */}
        {item.variants && item.variants.length > 0 && item.isAvailable && (
          <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-2">
            {item.variants.map((group) => {
              const currentSelected = selectedVariants.find((v) => v.groupId === group.id);
              return (
                <div key={group.id} className="text-left">
                  <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">
                    {group.name}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.options.map((opt) => {
                      const isSelected = currentSelected?.optionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVariantSelect(group, opt.id);
                          }}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition ${
                            isSelected
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {opt.name}
                          {opt.priceDelta > 0 ? ` (+${opt.priceDelta / 1000}k)` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer: Price & Add Button */}
      <div className="p-3 sm:p-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
        <div>
          <span className="block text-[10px] text-stone-400 font-medium">Harga</span>
          <span className="text-sm sm:text-base font-extrabold text-stone-900 font-mono">
            {formatRupiah(currentPrice)}
          </span>
        </div>

        <button
          type="button"
          disabled={!item.isAvailable}
          onClick={handleAdd}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            item.isAvailable
              ? 'bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white shadow-emerald-900/10'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
          title={item.isAvailable ? 'Tambah ke Pesanan' : 'Menu Habis'}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah</span>
        </button>
      </div>
    </div>
  );
};
