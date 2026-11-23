import React, { useState } from 'react';
import { POSProvider } from './context/POSContext';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { POSView } from './components/pos/POSView';
import { MenuManager } from './components/menu/MenuManager';
import { OrderHistory } from './components/orders/OrderHistory';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-emerald-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openMobileCart={() => setIsMobileCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'pos' && (
          <POSView
            isMobileCartOpen={isMobileCartOpen}
            setIsMobileCartOpen={setIsMobileCartOpen}
          />
        )}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'orders' && <OrderHistory />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Toast Feedback notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <POSProvider>
        <AppContent />
      </POSProvider>
    </ErrorBoundary>
  );
}
