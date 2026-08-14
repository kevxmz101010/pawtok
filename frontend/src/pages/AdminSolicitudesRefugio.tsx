import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Check, X, FileText, Building2, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';
import Header from '../components/Header';
import AdminHeaderNav from '../components/AdminHeaderNav';
import Notification from '../components/Notification';
import { ToastMessage } from '../types';

const AdminSolicitudesRefugio = () => {
  const confirm = useConfirm();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), type, message }]);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/solicitudes-refugio', { credentials: 'include' });
      if (res.ok) setSolicitudes(await res.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resolverSolicitud = async (id: number, accion: 'aprobar' | 'rechazar') => {
    if (!await confirm(`¿Seguro que deseas ${accion} esta solicitud?`)) return;
    try {
      const res = await fetch(`/api/admin/solicitudes-refugio/${id}/${accion}`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      if (res.ok) {
        setSolicitudes(solicitudes.filter(s => s.id !== id));
        handleShowToast(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente`, 'success');
      }
    } catch (err) {
      handleShowToast('Error al procesar solicitud', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Cargando solicitudes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50/50 selection:bg-[#0B84FF] selection:text-white pb-20 relative">
      
      {/* GLOBAL HEADER */}
      <Header
        onShowToast={handleShowToast}
        onSelectDrop={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        
        {/* ADMIN PROFILE & TAB NAV HEADER */}
        <AdminHeaderNav activeTab="solicitudes" title="Solicitudes de Refugio" subtitle="Verificación y revisión de organizaciones" />

        <BlurFade delay={0.15} inView>
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Solicitudes Pendientes
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">Organizaciones esperando aprobación</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200/80 px-3 py-1 rounded-full font-extrabold">
                {solicitudes.length} Pendientes
              </span>
            </div>
            
            {solicitudes.length > 0 ? (
              <div className="space-y-4">
                {solicitudes.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-6 rounded-2xl border border-gray-100 bg-white/70 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {s.logoUrl ? (
                          <img
                            src={s.logoUrl?.startsWith('http') ? s.logoUrl : `/api/files/${s.logoUrl}`}
                            alt={s.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 size={24} className="text-[#0B84FF]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B84FF] transition-colors">
                          {s.nombre}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Mail size={13} className="text-gray-400" /> {s.email}
                          </span>
                          {s.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone size={13} className="text-gray-400" /> {s.telefono}
                            </span>
                          )}
                          {s.direccion && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-gray-400" /> {s.direccion}
                            </span>
                          )}
                        </div>

                        {/* Documentos */}
                        <div className="flex items-center gap-3 pt-2">
                          {s.certificadoUrl && (
                            <a
                              href={s.certificadoUrl?.startsWith('http') ? s.certificadoUrl : `/api/files/${s.certificadoUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-blue-50 text-[#0B84FF] border border-blue-100 hover:bg-blue-100 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                            >
                              <FileText size={13} /> Certificado Legítimo <ExternalLink size={11} />
                            </a>
                          )}
                          {s.documentoRepresentanteUrl && (
                            <a
                              href={s.documentoRepresentanteUrl?.startsWith('http') ? s.documentoRepresentanteUrl : `/api/files/${s.documentoRepresentanteUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                            >
                              <FileText size={13} /> Doc. Identidad <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <button
                        onClick={() => resolverSolicitud(s.id, 'aprobar')}
                        className="px-4 py-2.5 bg-green-500 text-white font-bold text-xs rounded-xl shadow-md shadow-green-500/20 hover:bg-green-600 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={16} /> Aprobar Refugio
                      </button>
                      <button
                        onClick={() => resolverSolicitud(s.id, 'rechazar')}
                        className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200/80 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <X size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500/60" />
                <p className="font-bold text-lg text-gray-800">¡Todo al día!</p>
                <p className="text-sm text-gray-400 mt-1">No hay solicitudes de refugio pendientes por revisar.</p>
              </div>
            )}
          </div>
        </BlurFade>

      </main>

      <Notification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminSolicitudesRefugio;
