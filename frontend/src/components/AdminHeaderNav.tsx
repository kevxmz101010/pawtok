import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PawPrint, CheckCircle2, Mail, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BlurFade } from './ui/blur-fade';

interface AdminHeaderNavProps {
  activeTab: 'resumen' | 'mascotas' | 'solicitudes' | 'mensajes';
  title?: string;
  subtitle?: string;
}

export default function AdminHeaderNav({ activeTab, title, subtitle }: AdminHeaderNavProps) {
  const { user } = useAuth();

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

  return (
    <BlurFade delay={0.1} inView>
      <div className="flex flex-col items-center text-center mb-8">
        {/* Admin Shield Avatar */}
        <div className="relative w-28 h-28 mb-4 group">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0B84FF] via-blue-500 to-indigo-500 p-1 shadow-xl shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center text-[#0B84FF]">
              <Shield size={38} strokeWidth={2.2} />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
            <Sparkles size={14} className="text-white" />
          </span>
        </div>

        {/* Title & Email */}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {title || 'Panel de Administración'}
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          {subtitle || `${(user?.nombre && user.nombre.toLowerCase() !== 'admin' && user.nombre.toLowerCase() !== 'administrador') ? user.nombre : 'kj'} · ${user?.email || 'admin@pawtok.com'}`}
        </p>

        {/* Horizontal Navigation Tabs */}
        <div className="mt-8 flex items-center justify-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-2xl w-full overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0B84FF] text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </BlurFade>
  );
}
