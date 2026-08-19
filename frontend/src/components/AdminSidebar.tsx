import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, PawPrint, CheckCircle2, Mail, LogOut, Menu, X, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  activeTab?: 'resumen' | 'mascotas' | 'solicitudes' | 'mensajes';
}

export default function AdminSidebar({ activeTab = 'resumen' }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: BarChart3,
      path: '/admin',
    },
    {
      id: 'mascotas',
      label: 'Mascotas',
      icon: PawPrint,
      path: '/admin/mascotas',
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes Refugio',
      icon: CheckCircle2,
      path: '/admin/solicitudes-refugio',
    },
    {
      id: 'mensajes',
      label: 'Mensajes',
      icon: Mail,
      path: '/admin/mensajes',
    },
  ];

  const currentTab = activeTab || (
    location.pathname.includes('/mascotas') ? 'mascotas' :
    location.pathname.includes('/solicitudes') ? 'solicitudes' :
    location.pathname.includes('/mensajes') ? 'mensajes' : 'resumen'
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 flex items-center justify-between z-40 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Pawtok Logo" className="w-7 h-7 object-contain" />
          <span className="text-lg font-bold text-gray-900 tracking-tight">Pawtok</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 text-[#0B84FF] rounded-full border border-blue-100">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600 hover:text-black bg-gray-50 rounded-xl transition"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-2xl border-r border-gray-100/80 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header & Logo */}
          <div className="p-6 pb-6 border-b border-gray-100/60">
            <Link to="/" className="flex items-center gap-3 group active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B84FF] to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 p-2">
                <img src="/logo.png" alt="Pawtok" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-gray-900">Pawtok</span>
                  <span className="w-2 h-2 rounded-full bg-[#0B84FF] animate-pulse" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} className="text-[#0B84FF]" /> Admin Control
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Navegación
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0B84FF] text-white shadow-lg shadow-blue-500/25 scale-[1.01]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#0B84FF] transition-colors'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-white/80" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Admin User Badge */}
          <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-gray-50/80 to-blue-50/30 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B84FF] to-blue-400 flex items-center justify-center text-white font-extrabold shadow-sm shrink-0">
                {user?.nombre && user.nombre.toLowerCase() !== 'admin' && user.nombre.toLowerCase() !== 'administrador' ? user.nombre.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {(user?.nombre && user.nombre.toLowerCase() !== 'admin' && user.nombre.toLowerCase() !== 'administrador') ? user.nombre : 'kj'}
                </div>
                <div className="text-xs text-gray-400 truncate">{user?.email || 'admin@pawtok.com'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
