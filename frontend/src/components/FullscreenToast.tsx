import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  msg: string | null;
  type: 'success' | 'error' | 'info' | null;
}

export default function FullscreenToast({ toast }: { toast: ToastProps | null }) {
  return (
    <AnimatePresence>
      {toast && toast.msg && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className={`bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border ${
              toast.type === 'success' ? 'border-green-100' : toast.type === 'error' ? 'border-red-100' : 'border-blue-100'
            }`}
          >
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
              toast.type === 'success' ? 'bg-green-50 text-green-500' : toast.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-10 h-10" />}
              {toast.type === 'error' && <AlertCircle className="w-10 h-10" />}
              {toast.type === 'info' && <Info className="w-10 h-10" />}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {toast.type === 'success' ? '¡Éxito!' : toast.type === 'error' ? '¡Error!' : 'Aviso'}
            </h3>
            
            <p className="text-gray-500 font-medium">{toast.msg}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
