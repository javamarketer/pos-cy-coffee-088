import React, { useState, useEffect, useRef } from 'react';
import { Coffee, ShoppingBag, UtensilsCrossed, BarChart3, Settings, Clock, ChevronDown, Check, UserPlus } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export type ActiveTab = 'pos' | 'menu' | 'orders' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openMobileCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openMobileCart }) => {
  const { settings, cart, cashiers, setActiveCashier } = usePOS();
  const [time, setTime] = useState<string>('');
  const [isCashierMenuOpen, setIsCashierMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCashierMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'pos' as ActiveTab, label: 'Kasir (POS)', icon: ShoppingBag },
    { id: 'menu' as ActiveTab, label: 'Menu Toko', icon: UtensilsCrossed },
    { id: 'orders' as ActiveTab, label: 'Laporan & Riwayat', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-stone-900 border-b border-stone-800 text-stone-200 sticky top-0 z-40 select-none no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Cashier Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight text-white tracking-tight flex items-center gap-2">
                {settings.storeName || 'CY Coffee'}
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  POS Cloud
                </span>
              </h1>

              {/* Cashier Quick Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCashierMenuOpen(!isCashierMenuOpen)}
                  className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1.5 leading-none mt-0.5 group transition"
                  title="Klik untuk ganti kasir bertugas"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span className="font-medium group-hover:underline">
                    {settings.cashierName || 'Kasir'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-500 group-hover:text-stone-300" />
                </button>

                {isCashierMenuOpen && (
                  <div className="absolute left-0 top-6 z-50 w-56 bg-stone-900 border border-stone-700/80 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                      Ganti Kasir Bertugas
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {cashiers.map((c) => {
                        const isSelected = settings.cashierName === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setActiveCashier(c);
                              setIsCashierMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition ${
                              isSelected
                                ? 'bg-emerald-800/80 text-white font-bold'
                                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{c}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCashierMenuOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-stone-800/80 rounded-lg font-medium transition"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Kelola Kasir di Pengaturan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-950/70 p-1 rounded-xl border border-stone-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Time & Mobile Cart Button */}
          <div className="flex items-center gap-2.5">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-stone-300 bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-700/60">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{time || '--:--:--'}</span>
            </div>

            {/* Mobile Cart Trigger Button */}
            {activeTab === 'pos' && (
              <button
                onClick={openMobileCart}
                className="lg:hidden relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">Keranjang</span>
                {totalCartQty > 0 && (
                  <span className="w-5 h-5 rounded-full bg-stone-950 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartQty}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
