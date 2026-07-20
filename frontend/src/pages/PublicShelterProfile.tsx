import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Clock, Globe, 
  Heart, Dog, ChevronRight, 
  Image as ImageIcon, ShieldCheck, ChevronLeft, Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { RefugioDTO, MascotaDTO, ToastMessage } from '../types';
import { formatPetImageUrl } from '../utils/imageUtils';
import { BlurFade } from '../components/ui/blur-fade';
import { TextAnimate } from '../components/ui/text-animate';

export default function PublicShelterProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<RefugioDTO | null>(null);
  const [pets, setPets] = useState<MascotaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'mascotas' | 'fotos'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts(prev => [...prev, { id: Math.random().toString(), message, type }]);
  };

  useEffect(() => {
    if (!id) return;

    const fetchShelter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/refugios/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data: RefugioDTO = await res.json();
          setShelter(data);
        } else {
          setShelter({
            id: 0,
            nombre: id,
            direccion: 'Colombia',
            descripcion: 'Organización dedicada al rescate, cuidado y rehabilitación de animales en situación de vulnerabilidad.',
            horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
          });
        }

        const petsRes = await fetch(`/api/refugios/${encodeURIComponent(id)}/mascotas`);
        if (petsRes.ok) {
          const petsData: MascotaDTO[] = await petsRes.json();
          setPets(petsData.filter(p => p.estado !== 'ADOPTADO'));
        }
      } catch (err) {
        console.error('Error cargando refugio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShelter();
  }, [id]);

  const facilityPhotos: string[] = shelter?.fotosLugarUrl 
    ? shelter.fotosLugarUrl.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const displayName = shelter?.nombre || 'Refugio Asociado';
  const displayLocation = shelter?.direccion || 'Colombia';

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-white flex flex-col">
      <Header
        onShowToast={showToast}
        onSelectDrop={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
      />

      {/* Fondo sutil degradado radial */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-gray-50/20 to-white" />

      <main className="relative z-10 flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 pt-28 pb-20">
        {/* Botón Volver estilizado con BlurFade */}
        <BlurFade delay={0.1} inView>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#0B84FF] transition-colors mb-6 group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </button>
        </BlurFade>

        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-[#0B84FF] rounded-full animate-spin" />
            <p className="text-sm font-semibold">Cargando información del refugio...</p>
          </div>
        ) : (
          <BlurFade delay={0.15} inView>
            {/* Tarjeta Principal de Información Limpia (Sin Banner Azul) */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-10 space-y-8">
              {/* Cabecera del Refugio (Avatar + Nombre + Badge) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar del Refugio */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] shadow-md overflow-hidden bg-white shrink-0 flex items-center justify-center border border-gray-100 group relative">
                    {shelter?.logoUrl ? (
                      <img
                        src={formatPetImageUrl(shelter.logoUrl)}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-[#0B84FF]">
                        <Building2 className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Nombre y Ubicación con Animación de Texto */}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <TextAnimate 
                        animation="blurInUp" 
                        by="character" 
                        className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 capitalize tracking-tight"
                      >
                        {displayName}
                      </TextAnimate>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-100" title="Verificado Oficialmente" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-4 h-4 text-[#0B84FF] shrink-0" />
                      <span>{displayLocation}</span>
                    </p>
                  </div>
                </div>

                {/* Badge de Verificación Oficial (Sin botones de WhatsApp ni Llamar) */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs sm:text-sm font-bold shadow-2xs shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Refugio Oficial en Pawtok</span>
                </div>
              </div>

                {/* Navegación de Pestañas Segmentadas */}
                <div className="flex items-center">
                  <div className="flex flex-wrap items-center p-1.5 bg-gray-100/90 backdrop-blur-md rounded-2xl gap-1 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${
                        activeTab === 'info'
                          ? 'bg-white text-[#0B84FF] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Información y Horario</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('mascotas')}
                      className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${
                        activeTab === 'mascotas'
                          ? 'bg-white text-[#0B84FF] shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Dog className="w-4 h-4" />
                      <span>Mascotas en Adopción ({pets.length})</span>
                    </button>

                    {facilityPhotos.length > 0 && (
                      <button
                        onClick={() => setActiveTab('fotos')}
                        className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${
                          activeTab === 'fotos'
                            ? 'bg-white text-[#0B84FF] shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Instalaciones ({facilityPhotos.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Contenido Dinámico según pestaña */}
                <div className="space-y-6 pt-2">
                  {/* PESTAÑA 1: INFORMACIÓN GENERAL */}
                  {activeTab === 'info' && (
                    <div className="space-y-6">
                      {/* Horario de Atención */}
                      <BlurFade delay={0.05} inView>
                        <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-50/60 border border-blue-100/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0B84FF] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0B84FF]/25">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Horario de Atención y Visitas</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                              {shelter?.horario || 'Lunes a Sábado: 8:00 AM - 5:00 PM (Previa coordinación)'}
                            </p>
                            <p className="text-xs text-[#0B84FF] font-semibold mt-2 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Las visitas a las instalaciones se agendan una vez recibida la postulación de adopción.</span>
                            </p>
                          </div>
                        </div>
                      </BlurFade>

                      {/* Sobre nosotros */}
                      <BlurFade delay={0.1} inView>
                        <div className="bg-white border border-gray-100/90 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                              <Heart className="w-5 h-5 fill-rose-500/20" />
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Sobre nosotros</h3>
                              <p className="text-xs text-gray-400 font-medium">Labor, rescate y compromiso</p>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                            {shelter?.descripcion ||
                              'Organización sin ánimo de lucro dedicada a proteger, rehabilitar y encontrar hogares para animales en estado de desamparo. Brindamos amor y segundas oportunidades.'}
                          </p>
                        </div>
                      </BlurFade>

                      {/* Canales de Contacto */}
                      <BlurFade delay={0.15} inView>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Teléfono */}
                          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 sm:p-6 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center border border-blue-100/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs text-gray-400 font-medium block">Teléfono de contacto</span>
                              <span className="text-sm sm:text-base font-bold text-gray-800 block truncate">
                                {shelter?.telefono || 'No disponible'}
                              </span>
                            </div>
                          </div>

                          {/* Correo Electrónico */}
                          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 sm:p-6 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs text-gray-400 font-medium block">Correo electrónico</span>
                              <span className="text-sm sm:text-base font-bold text-gray-800 block truncate">
                                {shelter?.email || 'contacto@pawtok.com'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </BlurFade>

                      {/* Redes Sociales Oficiales */}
                      {shelter?.redesSociales && (
                        <BlurFade delay={0.2} inView>
                          <div className="bg-white border border-gray-100/90 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center">
                                <Globe className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Redes Sociales y Enlaces Oficiales</h3>
                                <p className="text-xs text-gray-400 font-medium">Canales y perfiles verificados</p>
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50/90 border border-gray-100 rounded-2xl text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed break-words">
                              {shelter.redesSociales}
                            </div>
                          </div>
                        </BlurFade>
                      )}
                    </div>
                  )}

                  {/* PESTAÑA 2: MASCOTAS DEL REFUGIO */}
                  {activeTab === 'mascotas' && (
                    <div>
                      {pets.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 space-y-2">
                          <Dog className="w-14 h-14 mx-auto text-gray-300" strokeWidth={1.5} />
                          <p className="text-base font-semibold">Actualmente no hay mascotas publicadas por este refugio.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                          {pets.map((p, idx) => (
                            <BlurFade key={p.id} delay={0.05 * (idx + 1)} inView>
                              <Link
                                to={`/mascotas/${p.id}`}
                                className="group bg-white border border-gray-100/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1 flex flex-col"
                              >
                                <div className="aspect-square relative overflow-hidden bg-gray-100">
                                  <img
                                    src={formatPetImageUrl(p.imagenUrl)}
                                    alt={p.nombre}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600';
                                    }}
                                  />
                                  <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white shadow-xs">
                                    {p.categoria}
                                  </span>
                                </div>
                                <div className="p-5 flex flex-col flex-1 justify-between">
                                  <div>
                                    <h4 className="font-extrabold text-gray-900 text-base sm:text-lg group-hover:text-[#0B84FF] transition-colors truncate">
                                      {p.nombre}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-1 font-medium">
                                      {p.raza} • {p.edad}
                                    </p>
                                  </div>
                                  <span className="mt-4 text-xs sm:text-sm font-bold text-[#0B84FF] flex items-center justify-between border-t border-gray-50 pt-3">
                                    <span>Ver ficha completa</span>
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                  </span>
                                </div>
                              </Link>
                            </BlurFade>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PESTAÑA 3: FOTOS DE LAS INSTALACIONES */}
                  {activeTab === 'fotos' && (
                    <div>
                      {facilityPhotos.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 space-y-2">
                          <ImageIcon className="w-14 h-14 mx-auto text-gray-300" strokeWidth={1.5} />
                          <p className="text-base font-semibold">No se han adjuntado fotos de las instalaciones.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {facilityPhotos.map((url, idx) => (
                            <BlurFade key={idx} delay={0.05 * (idx + 1)} inView>
                              <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 group relative shadow-xs hover:shadow-lg hover:scale-[1.02] transition-all">
                                <img
                                  src={formatPetImageUrl(url)}
                                  alt={`Instalación ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            </BlurFade>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
          </BlurFade>
        )}
      </main>

      <Notification toasts={toasts} onDismiss={(toastId) => setToasts(prev => prev.filter(t => t.id !== toastId))} />
    </div>
  );
}
