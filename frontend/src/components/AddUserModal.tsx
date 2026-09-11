import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, User, Phone, Heart } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: any) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AddUserModal({ isOpen, onClose, onUserAdded, onShowToast }: AddUserModalProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          password,
          rol: 'USUARIO', // Estrictamente Adoptante
          telefono: telefono.trim() || null,
          bio: 'Adoptante registrado por el administrador',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al registrar el adoptante');
      }

      const createdUser = await res.json();
      onShowToast(`Adoptante ${createdUser.nombre} registrado con éxito`, 'success');
      onUserAdded(createdUser);
      
      // Reset form
      setNombre('');
      setEmail('');
      setPassword('');
      setTelefono('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el adoptante');
      onShowToast(err.message || 'Error al crear el adoptante', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100 z-10 my-auto flex flex-col"
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center shadow-2xs shrink-0">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Agregar Nuevo Adoptante</h3>
                <p className="text-xs text-gray-400 font-medium">Registra una nueva cuenta de adoptante particular en Pawtok</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-4 overflow-y-auto max-h-[75vh]">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            {/* Badge de Rol Fijo: Adoptante */}
            <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-[#0B84FF] flex items-center justify-center shadow-2xs">
                  <Heart size={14} className="fill-[#0B84FF]/20 text-[#0B84FF]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Cuenta de Adoptante Particular</div>
                  <div className="text-[10px] text-gray-500">Podrá consultar mascotas y solicitar citas de adopción</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-[#0B84FF] text-[10px] font-extrabold uppercase rounded-full shadow-2xs border border-blue-100">
                Rol: USUARIO
              </span>
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Nombre Completo del Adoptante
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Martínez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] transition"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="adoptante@pawtok.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] transition"
                />
              </div>
            </div>

            {/* Contraseña Inicial */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Contraseña Inicial</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] transition"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Teléfono de Contacto (Opcional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+57 300 1234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B84FF]/20 focus:border-[#0B84FF] transition"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0B84FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-2xl transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Registrar Adoptante</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
