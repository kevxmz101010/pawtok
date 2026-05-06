import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Users, PawPrint, CheckCircle, Mail, Check, X, FileText } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

const AdminSolicitudesRefugio = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'ADMIN') {
      navigate('/');
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
    if (!window.confirm(`¿Seguro que deseas ${accion} esta solicitud?`)) return;
    try {
      const res = await fetch(`/api/admin/solicitudes-refugio/${id}/${accion}`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      if (res.ok) {
        setSolicitudes(solicitudes.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">Cargando...</div>;

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans selection:bg-[#0B84FF] selection:text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/80 backdrop-blur-2xl border-r border-white/50 flex flex-col shadow-[15px_0_30px_-15px_rgba(0,0,0,0.05)] relative z-20 h-full">
        <div className="p-8 pb-4">
          <Link to="/" className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#0B84FF] to-[#005bb5] drop-shadow-sm flex items-center gap-2">
            Pawtok <span className="text-[#0B84FF]">.</span>
          </Link>
          <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel</div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <BarChart size={22} />
            <span>Resumen</span>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</div>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <Users size={22} />
            <span>Usuarios & Refugios</span>
          </Link>
          <Link to="/admin/mascotas" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <PawPrint size={22} />
            <span>Mascotas</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0B84FF] text-white rounded-2xl shadow-md font-semibold">
            <CheckCircle size={22} />
            <span>Solicitudes</span>
          </div>
          <Link to="/admin/mensajes" className="flex items-center gap-3 px-4 py-3 text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-[#0B84FF] transition font-semibold">
            <Mail size={22} />
            <span>Mensajes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B84FF] to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">Admin</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10 p-8 lg:p-12">
        <BlurFade delay={0.1} inView>
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Solicitudes de Refugios</h1>
              <p className="text-gray-500 mt-2 font-medium">Revisa y aprueba nuevos refugios en Pawtok.</p>
            </div>
          </header>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black tracking-tight text-gray-900 mb-6 flex items-center gap-2">
              Refugios Pendientes
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold ml-2">{solicitudes.length}</span>
            </h2>
            
            {solicitudes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-2 font-semibold">Refugio</th>
                      <th className="px-4 py-2 font-semibold">Contacto</th>
                      <th className="px-4 py-2 font-semibold">Dirección</th>
                      <th className="px-4 py-2 font-semibold">Documentos</th>
                      <th className="px-4 py-2 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-600">
                    {solicitudes.map((s: any) => (
                      <tr key={s.id} className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl transition hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] group">
                        <td className="px-4 py-4 rounded-l-2xl border-l-4 border-transparent group-hover:border-[#0B84FF]">
                          <div className="flex items-center gap-3">
                            <img src={s.logoUrl?.startsWith('http') ? s.logoUrl : `/api/files/${s.logoUrl}`} alt={s.nombre} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-gray-900">{s.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{s.email}</div>
                          <div className="text-gray-400 text-xs">{s.telefono}</div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate" title={s.direccion}>{s.direccion}</td>
                        <td className="px-4 py-4">
                           <div className="flex flex-col gap-1">
                             {s.certificadoUrl && (
                               <a href={s.certificadoUrl?.startsWith('http') ? s.certificadoUrl : `/api/files/${s.certificadoUrl}`} target="_blank" rel="noreferrer" className="text-xs text-[#0B84FF] hover:underline flex items-center gap-1">
                                 <FileText size={12}/> Certificado
                               </a>
                             )}
                             {s.documentoRepresentanteUrl && (
                               <a href={s.documentoRepresentanteUrl?.startsWith('http') ? s.documentoRepresentanteUrl : `/api/files/${s.documentoRepresentanteUrl}`} target="_blank" rel="noreferrer" className="text-xs text-[#0B84FF] hover:underline flex items-center gap-1">
                                 <FileText size={12}/> Identidad
                               </a>
                             )}
                           </div>
                        </td>
                        <td className="px-4 py-4 rounded-r-2xl text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => resolverSolicitud(s.id, 'aprobar')} className="p-2 text-green-500 bg-green-50 hover:bg-green-100 rounded-xl transition" title="Aprobar">
                              <Check size={18} />
                            </button>
                            <button onClick={() => resolverSolicitud(s.id, 'rechazar')} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition" title="Rechazar">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No hay solicitudes de refugio pendientes</p>
              </div>
            )}
          </div>
        </BlurFade>
      </main>
    </div>
  );
};

export default AdminSolicitudesRefugio;
