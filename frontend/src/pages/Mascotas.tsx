import Header from '../components/Header';
import PetsSection from '../components/PetsSection';
import Notification from '../components/Notification';
import { useState } from 'react';
import { ToastMessage } from '../types';

export default function Mascotas() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const nextToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, nextToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-semibold flex flex-col">
      <Header
        onShowToast={handleShowToast}
        onSelectDrop={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* Background layer for aesthetics */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-gray-50/20 to-white" />

      <main className="relative z-10 flex-grow pt-24">
        <PetsSection />
      </main>

      <Notification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
