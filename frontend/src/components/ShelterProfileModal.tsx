import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Building2, MapPin, Phone, Mail, Clock, Globe, 
  Heart, Dog, ChevronRight, 
  Image as ImageIcon, ExternalLink, ShieldCheck, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RefugioDTO, MascotaDTO } from '../types';
import { formatPetImageUrl } from '../utils/imageUtils';
import { BlurFade } from './ui/blur-fade';
import { TextAnimate } from './ui/text-animate';

interface ShelterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelterIdentifier?: string | number | null;
  fallbackName?: string;
  fallbackLocation?: string;
}

export default function ShelterProfileModal({
  isOpen,
  onClose,
  shelterIdentifier,
  fallbackName = 'Refugio Asociado',
  fallbackLocation = 'Colombia',
}: ShelterProfileModalProps) {
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<RefugioDTO | null>(null);
  const [pets, setPets] = useState<MascotaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'mascotas' | 'fotos'>('info');

  useEffect(() => {
    if (!isOpen || !shelterIdentifier) return;

    const fetchShelterData = async () => {
      try {
        setLoading(true);
        const identifierStr = String(shelterIdentifier).trim();

        // 1. Obtener datos públicos del refugio
        const shelterRes = await fetch(`/api/refugios/${encodeURIComponent(identifierStr)}`);
        if (shelterRes.ok) {
          const shelterData: RefugioDTO = await shelterRes.json();
          setShelter(shelterData);
        } else {
          // Si no se encuentra por identificador directo, inicializar con fallback básico
          setShelter({
            id: typeof shelterIdentifier === 'number' ? shelterIdentifier : 0,
            nombre: fallbackName,
            direccion: fallbackLocation,
            descripcion: 'Organización dedicada al rescate, cuidado y rehabilitación de animales en situación de vulnerabilidad.',
            horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
          });
        }

        // 2. Obtener mascotas pertenecientes a este refugio
        const petsRes = await fetch(`/api/refugios/${encodeURIComponent(identifierStr)}/mascotas`);
        if (petsRes.ok) {
          const petsData: MascotaDTO[] = await petsRes.json();
          setPets(petsData.filter(p => p.estado !== 'ADOPTADO'));
        } else {
          // Fallback: traer de /api/mascotas y filtrar por nombre o ID
          const allPetsRes = await fetch('/api/mascotas');
          if (allPetsRes.ok) {
            const allPets: MascotaDTO[] = await allPetsRes.json();
            const filtered = allPets.filter(p => {
              if (p.estado === 'ADOPTADO') return false;
              if (p.idRefugio && String(p.idRefugio) === identifierStr) return true;
              if (p.refugioNombre && p.refugioNombre.toLowerCase() === identifierStr.toLowerCase()) return true;
              if ((p as any).refugio && String((p as any).refugio).toLowerCase() === identifierStr.toLowerCase()) return true;
              return false;
            });
            setPets(filtered);
          }
        }
      } catch (err) {
        console.error('Error cargando perfil del refugio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShelterData();
  }, [isOpen, shelterIdentifier, fallbackName, fallbackLocation]);

  if (!isOpen) return null;

  // Formateador de fotos de las instalaciones
  const facilityPhotos: string[] = shelter?.fotosLugarUrl 
    ? shelter.fotosLugarUrl.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const displayName = shelter?.nombre || fallbackName;
  const displayLocation = shelter?.direccion || fallbackLocation;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop con desenfoque de cristal estilo Apple */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl cursor-pointer"
        />

        {/* Contenedor Modal con diseño Pawtok glassmorphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100 z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Cabecera Superior Limpia (Sin Banner Azul) */}
          <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100 bg-white/90">
            {/* Fila superior: Badge Oficial y Botón Cerrar */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-full text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Refugio Oficial en Pawtok</span>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fila de Perfil: Avatar + Nombre + Botón Ver Página */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Logo / Avatar del Refugio */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.75rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-md shrink-0 flex items-center justify-center group relative">
                  {shelter?.logoUrl ? (
                    <img
                      src={formatPetImageUrl(shelter.logoUrl)}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-50 to-indigo-100 flex items-center justify-center text-[#0B84FF]">
                      <Building2 className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Nombre con Animación de Texto y Ubicación */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <TextAnimate 
                      animation="blurInUp" 
                      by="character" 
                      className="text-xl sm:text-2xl font-black text-gray-900 capitalize tracking-tight"
                    >
                      {displayName}
                    </TextAnimate>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" title="Refugio Verificado" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
                    <span className="truncate">{displayLocation}</span>
                  </p>
                </div>
              </div>

              {/* Botón Ver Página (Sin WhatsApp ni Llamar) */}
              {shelter?.id && (
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/refugios/${shelter.id}`);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 shrink-0"
                  title="Abrir página completa"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  <span>Ver página</span>
                </button>
              )}
            </div>
          </div>

          {/* Navegación de Pestañas Segmentadas */}
          <div className="px-6 sm:px-8 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center shrink-0">
            <div className="flex items-center p-1 bg-gray-200/60 backdrop-blur-md rounded-2xl gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
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
                className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
                  activeTab === 'mascotas'
                    ? 'bg-white text-[#0B84FF] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Dog className="w-4 h-4" />
                <span>Mascotas ({pets.length})</span>
              </button>

              {facilityPhotos.length > 0 && (
                <button
                  onClick={() => setActiveTab('fotos')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
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

          {/* Contenido con Scroll Interior y Fades */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="w-9 h-9 border-3 border-blue-200 border-t-[#0B84FF] rounded-full animate-spin" />
                <p className="text-xs font-semibold">Cargando información del refugio...</p>
              </div>
            ) : (
              <>
                {/* PESTAÑA 1: INFORMACIÓN GENERAL */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* Tarjeta de Horario de Atención */}
                    <BlurFade delay={0.05} inView>
                      <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-50/60 border border-blue-100/90 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0B84FF] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0B84FF]/25">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900">Horario de Atención y Visitas</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                            {shelter?.horario || 'Lunes a Sábado: 8:00 AM - 5:00 PM (Previa coordinación)'}
                          </p>
                          <p className="text-[11px] sm:text-xs text-[#0B84FF] font-semibold mt-2 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Las visitas para conocer a las mascotas se agendan previa solicitud de adopción.</span>
                          </p>
                        </div>
                      </div>
                    </BlurFade>

                    {/* Descripción y Misión del Refugio */}
                    <BlurFade delay={0.1} inView>
                      <div className="bg-white border border-gray-100/90 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                            <Heart className="w-4 h-4 fill-rose-500/20" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-gray-900">Sobre este refugio</h4>
                            <p className="text-[11px] text-gray-400 font-medium">Misión, rescate y labor diaria</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                          {shelter?.descripcion || 
                            'Organización sin ánimo de lucro comprometida con el rescate, cuidado veterinario y adopción responsable de animales sin hogar. Brindamos amor y segundas oportunidades.'}
                        </p>
                      </div>
                    </BlurFade>

                    {/* Canales de Contacto Directo */}
                    <BlurFade delay={0.15} inView>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Teléfono */}
                        <div className="bg-white border border-gray-100/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 hover:border-blue-200 hover:shadow-sm transition-all group">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0B84FF] flex items-center justify-center border border-blue-100/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[11px] text-gray-400 font-medium block">Teléfono de contacto</span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 block truncate">
                              {shelter?.telefono || 'No especificado'}
                            </span>
                          </div>
                        </div>

                        {/* Correo Electrónico */}
                        <div className="bg-white border border-gray-100/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 hover:border-indigo-200 hover:shadow-sm transition-all group">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[11px] text-gray-400 font-medium block">Correo electrónico</span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 block truncate">
                              {shelter?.email || 'contacto@pawtok.com'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </BlurFade>

                    {/* Redes Sociales Oficiales */}
                    {shelter?.redesSociales && (
                      <BlurFade delay={0.2} inView>
                        <div className="bg-white border border-gray-100/90 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B84FF] flex items-center justify-center">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-gray-900">Redes Sociales y Enlaces Oficiales</h4>
                              <p className="text-[11px] text-gray-400 font-medium">Perfiles y canales oficiales</p>
                            </div>
                          </div>
                          <div className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed break-words">
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
                      <div className="py-16 text-center text-gray-400 space-y-2">
                        <Dog className="w-12 h-12 mx-auto text-gray-300" strokeWidth={1.5} />
                        <p className="text-sm font-semibold">Actualmente no hay otras mascotas publicadas por este refugio.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pets.map((p, idx) => (
                          <BlurFade key={p.id} delay={0.05 * (idx + 1)} inView>
                            <div
                              onClick={() => {
                                onClose();
                                navigate(`/mascotas/${p.id}`);
                              }}
                              className="group bg-white border border-gray-100/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
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
                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white shadow-xs">
                                  {p.categoria}
                                </span>
                              </div>
                              <div className="p-4 flex flex-col flex-1 justify-between">
                                <div>
                                  <h5 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-[#0B84FF] transition-colors truncate">
                                    {p.nombre}
                                  </h5>
                                  <p className="text-xs text-gray-500 truncate mt-1 font-medium">
                                    {p.raza} • {p.edad}
                                  </p>
                                </div>
                                <span className="mt-3.5 text-xs font-bold text-[#0B84FF] flex items-center justify-between border-t border-gray-50 pt-2.5">
                                  <span>Ver detalles</span>
                                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                              </div>
                            </div>
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
                      <div className="py-16 text-center text-gray-400 space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-300" strokeWidth={1.5} />
                        <p className="text-sm font-semibold">No se han adjuntado fotos de las instalaciones.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
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
              </>
            )}
          </div>

          {/* Pie del Modal */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
