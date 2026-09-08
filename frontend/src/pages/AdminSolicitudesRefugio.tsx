import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Check, 
  X, 
  FileText, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink,
  Image as ImageIcon,
  Eye,
  Download,
  Files,
  ShieldCheck,
  Clock,
  Globe,
  Camera,
  UserCheck,
  Maximize2
} from 'lucide-react';
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
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modales
  const [modalSolicitud, setModalSolicitud] = useState<any | null>(null);
  const [docPreview, setDocPreview] = useState<{ url: string; title: string; isPdf: boolean } | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [rejectModalSolicitud, setRejectModalSolicitud] = useState<any | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    if (!docPreview || !docPreview.isPdf) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setPdfLoading(false);
      setPdfError(null);
      return;
    }

    let active = true;
    setPdfLoading(true);
    setPdfError(null);

    fetch(docPreview.url, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`No se pudo cargar el archivo (HTTP ${res.status})`);
        }
        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const objUrl = URL.createObjectURL(pdfBlob);
        if (active) {
          setBlobUrl(objUrl);
          setPdfLoading(false);
        } else {
          URL.revokeObjectURL(objUrl);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Error al cargar PDF en visor:", err);
          setPdfError(err.message || 'Error al descargar el PDF');
          setPdfLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [docPreview]);

  const setLightboxImage = (item: { url: string; title: string } | null) => {
    if (!item) setDocPreview(null);
    else openFilePreview(item.url, item.title);
  };

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
      if (res.ok) {
        setSolicitudes(await res.json());
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const resolverSolicitud = async (id: number, accion: 'aprobar' | 'rechazar') => {
    if (accion === 'rechazar') {
      const target = solicitudes.find(s => s.id === id) || (modalSolicitud?.id === id ? modalSolicitud : null);
      setRejectModalSolicitud(target || { id });
      setMotivoRechazo('');
      return;
    }

    if (!await confirm(`¿Seguro que deseas aprobar esta solicitud de refugio?`)) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/solicitudes-refugio/${id}/aprobar`, { 
        method: 'PUT', 
        credentials: 'include' 
      });
      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s.id !== id));
        if (modalSolicitud?.id === id) {
          setModalSolicitud(null);
        }
        handleShowToast('Solicitud aprobada correctamente', 'success');
      } else {
        handleShowToast('Error al procesar solicitud', 'error');
      }
    } catch (err) {
      handleShowToast('Error al procesar solicitud', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmarRechazo = async () => {
    if (!rejectModalSolicitud) return;
    if (!motivoRechazo.trim()) {
      handleShowToast('Por favor escribe el motivo del rechazo para informar al refugio.', 'error');
      return;
    }
    const id = rejectModalSolicitud.id;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/solicitudes-refugio/${id}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ motivo: motivoRechazo.trim() })
      });
      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s.id !== id));
        if (modalSolicitud?.id === id) {
          setModalSolicitud(null);
        }
        setRejectModalSolicitud(null);
        setMotivoRechazo('');
        handleShowToast('Solicitud rechazada y motivo notificado al refugio', 'success');
      } else {
        handleShowToast('Error al rechazar solicitud', 'error');
      }
    } catch (err) {
      handleShowToast('Error al procesar solicitud', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper para normalizar URLs de archivos subidos
  const getFileUrl = (path?: string | null): string => {
    if (!path) return '';
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    // Remover prefijos repetidos o duplicados de /api/files/ o barras dobles
    let clean = trimmed.replace(/^\/?api\/files\/?/, '');
    clean = clean.replace(/\/+/g, '/');
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }
    return clean;
  };

  // Helper para parsear la lista de fotos del lugar
  const parseFotosLugar = (fotosLugarUrl?: string | null): string[] => {
    if (!fotosLugarUrl) return [];
    return fotosLugarUrl
      .split(',')
      .map(u => u.trim())
      .filter(u => u.length > 0)
      .map(u => getFileUrl(u));
  };

  const isPdf = (url: string): boolean => {
    return url.toLowerCase().split('?')[0].endsWith('.pdf');
  };

  const openFilePreview = (url: string, title: string) => {
    const formatted = getFileUrl(url);
    setDocPreview({
      url: formatted,
      title,
      isPdf: isPdf(formatted),
    });
  };

  const countArchivos = (s: any): number => {
    let count = 0;
    if (s.logoUrl) count++;
    if (s.certificadoUrl) count++;
    if (s.documentoRepresentanteUrl) count++;
    const fotos = parseFotosLugar(s.fotosLugarUrl);
    count += fotos.length;
    return count;
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
          <div className="bg-white/90 backdrop-blur-xl border border-gray-100/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Solicitudes Pendientes
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">Organizaciones esperando aprobación para unirse a Pawtok</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200/80 px-3.5 py-1.5 rounded-full font-extrabold shadow-sm">
                {solicitudes.length} Pendiente{solicitudes.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {solicitudes.length > 0 ? (
              <div className="space-y-6">
                {solicitudes.map((s: any) => {
                  const fotosLugar = parseFotosLugar(s.fotosLugarUrl);
                  const totalDocs = countArchivos(s);
                  const logoUrl = getFileUrl(s.logoUrl);
                  const certificadoUrl = getFileUrl(s.certificadoUrl);
                  const docRepUrl = getFileUrl(s.documentoRepresentanteUrl);

                  return (
                    <div
                      key={s.id}
                      className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-5 group"
                    >
                      {/* Top row: Organization Info & Actions */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Logo clickable thumbnail */}
                          <div 
                            onClick={() => {
                              if (logoUrl) {
                                setLightboxImage({ url: logoUrl, title: `Logo - ${s.nombre}` });
                              }
                            }}
                            className={`w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/80 overflow-hidden shrink-0 flex items-center justify-center relative group/logo ${logoUrl ? 'cursor-pointer' : ''}`}
                            title={logoUrl ? "Click para ampliar logo" : ""}
                          >
                            {logoUrl ? (
                              <>
                                <img
                                  src={logoUrl}
                                  alt={s.nombre}
                                  className="w-full h-full object-cover group-hover/logo:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 size={16} />
                                </div>
                              </>
                            ) : (
                              <Building2 size={26} className="text-[#0B84FF]" />
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B84FF] transition-colors break-words break-all [overflow-wrap:anywhere]">
                                {s.nombre}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                                Esperando Verificación
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1.5 break-all">
                                <Mail size={13} className="text-gray-400 shrink-0" /> {s.email}
                              </span>
                              {s.telefono && (
                                <span className="flex items-center gap-1.5 break-all">
                                  <Phone size={13} className="text-gray-400 shrink-0" /> {s.telefono}
                                </span>
                              )}
                              {s.direccion && (
                                <span className="flex items-center gap-1.5 break-words break-all [overflow-wrap:anywhere]">
                                  <MapPin size={13} className="text-gray-400 shrink-0" /> {s.direccion}
                                </span>
                              )}
                            </div>

                            {s.descripcion && (
                              <p className="text-xs text-gray-600 line-clamp-2 pt-0.5 leading-relaxed break-words break-all [overflow-wrap:anywhere]">
                                {s.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Top Right Action Buttons */}
                        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                          <button
                            onClick={() => resolverSolicitud(s.id, 'aprobar')}
                            disabled={actionLoadingId === s.id}
                            className="px-4 py-2.5 bg-green-500 text-white font-bold text-xs rounded-xl shadow-md shadow-green-500/20 hover:bg-green-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check size={16} /> Aprobar Refugio
                          </button>
                          <button
                            onClick={() => resolverSolicitud(s.id, 'rechazar')}
                            disabled={actionLoadingId === s.id}
                            className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200/80 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X size={16} /> Rechazar
                          </button>
                        </div>
                      </div>

                      {/* Bottom row: Documentos y Archivos Adjuntos */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                            <Files size={14} className="text-gray-400" />
                            Archivos ({totalDocs}):
                          </span>

                          {/* 1. Logo */}
                          {logoUrl && (
                            <button
                              type="button"
                              onClick={() => openFilePreview(logoUrl, `Logo - ${s.nombre}`)}
                              className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                              title="Ver logo en visor integrado"
                            >
                              <ImageIcon size={13} /> Logo <Eye size={11} />
                            </button>
                          )}

                          {/* 2. Certificado Legítimo */}
                          {certificadoUrl ? (
                            <button
                              type="button"
                              onClick={() => openFilePreview(certificadoUrl, `Certificado Legítimo - ${s.nombre}`)}
                              className="px-2.5 py-1 bg-blue-50 text-[#0B84FF] border border-blue-100 hover:bg-blue-100 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                              title="Ver certificado en visor integrado"
                            >
                              <FileText size={13} /> Certificado Legítimo <Eye size={11} />
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-xs font-normal">
                              Sin certificado
                            </span>
                          )}

                          {/* 3. Documento de Identidad */}
                          {docRepUrl ? (
                            <button
                              type="button"
                              onClick={() => openFilePreview(docRepUrl, `Doc. Identidad - ${s.nombre}`)}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                              title="Ver documento de identidad en visor integrado"
                            >
                              <UserCheck size={13} /> Doc. Identidad <Eye size={11} />
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-xs font-normal">
                              Sin doc. identidad
                            </span>
                          )}

                          {/* 4. Fotos del Lugar */}
                          {fotosLugar.length > 0 ? (
                            fotosLugar.map((fotoUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => openFilePreview(fotoUrl, `Foto Lugar #${idx + 1} - ${s.nombre}`)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                                title={`Ver foto ${idx + 1} en visor integrado`}
                              >
                                <Camera size={13} /> Foto Lugar {fotosLugar.length > 1 ? `#${idx + 1}` : ''} <Eye size={11} />
                              </button>
                            ))
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-xs font-normal">
                              Sin fotos de instalaciones
                            </span>
                          )}
                        </div>

                        {/* Botón para ver todo el expediente en modal detallado */}
                        <button
                          onClick={() => setModalSolicitud(s)}
                          className="self-start md:self-auto px-3.5 py-1.5 bg-blue-50 text-[#0B84FF] hover:bg-[#0B84FF] hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-blue-100 cursor-pointer shadow-sm shrink-0"
                        >
                          <Eye size={14} /> Ver Todos los Archivos ({totalDocs})
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* MODAL DETALLADO DE EXPEDIENTE DE ARCHIVOS */}
      {modalSolicitud && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center font-bold">
                  <Files size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 break-words break-all [overflow-wrap:anywhere]">
                    Expediente de Documentos
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Pendiente
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium break-words break-all [overflow-wrap:anywhere]">
                    {modalSolicitud.nombre} &bull; {modalSolicitud.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalSolicitud(null)}
                className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Refugio Summary Banner */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 break-words break-all [overflow-wrap:anywhere]">
                {modalSolicitud.direccion && (
                  <span className="flex items-center gap-1.5 font-medium break-words break-all [overflow-wrap:anywhere]">
                    <MapPin size={14} className="text-[#0B84FF]" /> {modalSolicitud.direccion}
                  </span>
                )}
                {modalSolicitud.telefono && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-[#0B84FF]" /> {modalSolicitud.telefono}
                  </span>
                )}
                {modalSolicitud.horario && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-[#0B84FF]" /> {modalSolicitud.horario}
                  </span>
                )}
                {modalSolicitud.redesSociales && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe size={14} className="text-[#0B84FF]" /> {modalSolicitud.redesSociales}
                  </span>
                )}
              </div>

              {/* Documentos Legales & Identidad */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Documentación Oficial y Representación
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card: Logo Oficial */}
                  <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {modalSolicitud.logoUrl ? (
                          <img
                            src={getFileUrl(modalSolicitud.logoUrl)}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-900">Logo de la Organización</p>
                        <p className="text-[11px] text-gray-500">
                          {modalSolicitud.logoUrl ? 'Archivo de imagen subido' : 'No se adjuntó logo'}
                        </p>
                      </div>
                    </div>
                    {modalSolicitud.logoUrl ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openFilePreview(modalSolicitud.logoUrl, `Logo - ${modalSolicitud.nombre}`)}
                          className="w-full py-1.5 px-3 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Eye size={13} /> Ver en Visor Integrado
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No disponible</span>
                    )}
                  </div>

                  {/* Card: Certificado Legítimo */}
                  <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B84FF] border border-blue-100 shrink-0 flex items-center justify-center">
                        <FileText size={22} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-900">Certificado Legítimo</p>
                        <p className="text-[11px] text-gray-500">
                          {modalSolicitud.certificadoUrl 
                            ? (isPdf(modalSolicitud.certificadoUrl) ? 'Documento PDF' : 'Imagen de certificación') 
                            : 'No adjuntado'}
                        </p>
                      </div>
                    </div>
                    {modalSolicitud.certificadoUrl ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openFilePreview(modalSolicitud.certificadoUrl, `Certificado Legítimo - ${modalSolicitud.nombre}`)}
                          className="w-full py-1.5 px-3 bg-[#0B84FF] text-white hover:bg-blue-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Eye size={13} /> Ver Documento (Visor)
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No disponible</span>
                    )}
                  </div>

                  {/* Card: Documento del Representante */}
                  <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0 flex items-center justify-center">
                        <UserCheck size={22} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-900">Doc. Identidad del Representante</p>
                        <p className="text-[11px] text-gray-500">
                          {modalSolicitud.documentoRepresentanteUrl 
                            ? (isPdf(modalSolicitud.documentoRepresentanteUrl) ? 'Documento PDF' : 'Imagen de documento') 
                            : 'No adjuntado'}
                        </p>
                      </div>
                    </div>
                    {modalSolicitud.documentoRepresentanteUrl ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openFilePreview(modalSolicitud.documentoRepresentanteUrl, `Doc. Identidad - ${modalSolicitud.nombre}`)}
                          className="w-full py-1.5 px-3 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Eye size={13} /> Ver Documento (Visor)
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No disponible</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Fotos del Lugar / Instalaciones */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Fotos de las Instalaciones y el Lugar ({parseFotosLugar(modalSolicitud.fotosLugarUrl).length})
                  </h4>
                  <span className="text-[11px] text-gray-400">Espacios donde albergan a los animales</span>
                </div>

                {parseFotosLugar(modalSolicitud.fotosLugarUrl).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {parseFotosLugar(modalSolicitud.fotosLugarUrl).map((fotoUrl, idx) => (
                      <div
                        key={idx}
                        className="group/photo relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 shadow-sm"
                      >
                        <img
                          src={fotoUrl}
                          alt={`Instalación ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => openFilePreview(fotoUrl, `Instalaciones #${idx + 1} - ${modalSolicitud.nombre}`)}
                            className="px-3 py-1.5 bg-white text-gray-800 rounded-xl hover:bg-gray-100 text-xs font-bold transition cursor-pointer shadow flex items-center gap-1.5"
                            title="Ver en visor integrado"
                          >
                            <Eye size={14} /> Ver en visor
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none">
                          Foto #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                    <Camera size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-semibold text-gray-500">No se adjuntaron fotos de las instalaciones físicas.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setModalSolicitud(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl transition cursor-pointer"
              >
                Cerrar Expediente
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => resolverSolicitud(modalSolicitud.id, 'rechazar')}
                  disabled={actionLoadingId === modalSolicitud.id}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200/80 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X size={15} /> Rechazar Solicitud
                </button>
                <button
                  onClick={() => resolverSolicitud(modalSolicitud.id, 'aprobar')}
                  disabled={actionLoadingId === modalSolicitud.id}
                  className="px-5 py-2 bg-green-500 text-white font-bold text-xs rounded-xl shadow-md shadow-green-500/20 hover:bg-green-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check size={15} /> Aprobar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA ESPECIFICAR EL MOTIVO DE RECHAZO */}
      {rejectModalSolicitud && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <X size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Rechazar Solicitud de Refugio</h3>
                  <p className="text-xs text-gray-500 font-medium">Refugio: <span className="font-bold text-gray-800">{rejectModalSolicitud.nombre}</span></p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalSolicitud(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-0 text-xs text-amber-900">
                <p className="font-bold ml-2 mt-1 mb-1">Motivo de rechazo</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Motivo o retroalimentación del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ej: El Certificado legal adjuntado se encuentra vencido o ilegible. Por favor adjunta un documento en formato PDF de alta resolución..."
                  className="w-full bg-slate-50 border border-gray-200 focus:border-red-400 focus:bg-white focus:ring-3 focus:ring-red-100 outline-none rounded-2xl p-3.5 text-sm text-gray-800 placeholder-gray-400 resize-none transition"
                  autoFocus
                />
              </div>

              {/* Sugerencias rápidas */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Motivos frecuentes:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMotivoRechazo('El certificado legal adjunto no es legible o está incompleto. Por favor adjunta un documento en formato PDF de alta resolución.')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  >
                    Certificado ilegible
                  </button>
                  <button
                    type="button"
                    onClick={() => setMotivoRechazo('El documento del representante legal no coincide con el registro oficial o no está vigente.')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  >
                    Doc. Representante inconsistente
                  </button>
                  <button
                    type="button"
                    onClick={() => setMotivoRechazo('Las fotos del lugar deben mostrar las instalaciones y espacios reales destinados a los animales.')}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  >
                    Fotos insuficientes
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalSolicitud(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRechazo}
                disabled={actionLoadingId !== null || !motivoRechazo.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoadingId !== null ? 'Procesando...' : 'Rechazar y Notificar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APARTADO / VISOR INTEGRADO DE DOCUMENTOS Y FOTOS */}
      {docPreview && (
        <div 
          className="fixed inset-0 z-70 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setDocPreview(null)}
        >
          <div 
            className={`relative bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl border ${
              docPreview.isPdf 
                ? 'w-full max-w-5xl h-[88vh] border-gray-200' 
                : 'max-w-4xl max-h-[90vh] bg-gray-900 border-white/10'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar del apartado */}
            <div className={`w-full px-4 py-3 flex items-center justify-between border-b ${
              docPreview.isPdf 
                ? 'bg-gray-50 border-gray-200 text-gray-800' 
                : 'bg-black/70 border-white/10 text-white'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {docPreview.isPdf ? (
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <FileText size={16} />
                  </div>
                ) : (
                  <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg shrink-0">
                    <ImageIcon size={16} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold truncate">
                    {docPreview.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {docPreview.isPdf ? 'Documento PDF • Visor en apartado' : 'Archivo de imagen • Visor en apartado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={docPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    docPreview.isPdf
                      ? 'bg-gray-200/70 hover:bg-gray-200 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Nueva pestaña</span>
                </a>
                <button
                  type="button"
                  onClick={() => setDocPreview(null)}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    docPreview.isPdf
                      ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Cerrar apartado"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenido según tipo: PDF o Imagen */}
            {docPreview.isPdf ? (
              <div className="w-full flex-1 bg-gray-100 relative">
                {pdfLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white text-gray-500">
                    <div className="w-9 h-9 border-3 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold">Cargando documento PDF...</p>
                  </div>
                ) : pdfError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">No se pudo visualizar el PDF aquí</p>
                    <p className="text-xs text-gray-500 max-w-sm">{pdfError}</p>
                    <a
                      href={docPreview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 px-4 py-2 bg-[#0B84FF] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-600 transition inline-flex items-center gap-2"
                    >
                      <ExternalLink size={14} /> Abrir en nueva pestaña
                    </a>
                  </div>
                ) : blobUrl ? (
                  <object
                    data={`${blobUrl}#toolbar=1&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full border-0 bg-white"
                  >
                    <iframe
                      src={`${blobUrl}#toolbar=1&view=FitH`}
                      title={docPreview.title}
                      className="w-full h-full border-0 bg-white"
                    />
                  </object>
                ) : (
                  <iframe
                    src={docPreview.url}
                    title={docPreview.title}
                    className="w-full h-full border-0 bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="p-3 flex items-center justify-center overflow-auto max-h-[80vh] bg-black/40">
                <img
                  src={docPreview.url}
                  alt={docPreview.title}
                  className="max-h-[76vh] w-auto object-contain rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Notification toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminSolicitudesRefugio;
