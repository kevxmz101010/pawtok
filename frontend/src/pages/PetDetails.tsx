import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Home, Syringe, Bug, Calendar, FileText, Check, Plus, X } from 'lucide-react';
import Notification from '../components/Notification';
import { ToastMessage, MascotaDTO } from '../types';
import { RainbowButton } from '../components/ui/rainbow-button';
import { BlurFade } from '../components/ui/blur-fade';
import { Carousel, CarouselIndicator } from '../components/ui/simple-carousel';
import { DatePicker } from '../components/ui/date-picker';
import { AnimatedCheckbox } from '../components/ui/animated-checkbox';
import Autoplay from 'embla-carousel-autoplay';
import { useAuth } from '../context/AuthContext';

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<MascotaDTO | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add Medical Record State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFecha, setNewFecha] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newVacuna, setNewVacuna] = useState(false);
  const [newDesparasitacion, setNewDesparasitacion] = useState(false);
  const [isSubmittingHistorial, setIsSubmittingHistorial] = useState(false);

  const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const nextToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, nextToast]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/mascotas/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPet(data);
        } else {
          setPet({
            id: Number(id),
            nombre: 'Rocky',
            raza: 'Mestizo',
            edad: 2,
            descripcion: 'Rocky es un perro lleno de vida y energía. Fue rescatado de las calles hace unos meses y ha demostrado ser el compañero más leal. Le encanta jugar a buscar la pelota y dar largos paseos por el parque. Es muy inteligente y aprende rápido nuevos trucos.',
            imagenUrl: '',
            categoria: 'perro',
            estado: 'DISPONIBLE',
            energia: 'Media',
            conNinos: 'Sí',
            refugio: 'Refugio Pawtok',
            ubicacion: 'Bogotá, Colombia',
            creadoEn: new Date().toISOString()
          });
        }
        
        try {
          const resHistorial = await fetch(`/api/mascotas/${id}/historial`);
          if (resHistorial.ok) {
            setHistorial(await resHistorial.json());
          }
        } catch (e) { console.error('Error fetching historial:', e); }

      } catch (err) {
        console.error('Error fetching pet details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  const isCat = pet.categoria?.toLowerCase() === 'gato';
  const dogPlaceholders = [
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800",
    "https://images.unsplash.com/photo-1537151608804-ea2f14cb3966?q=80&w=800",
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800"
  ];
  const catPlaceholders = [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800",
    "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=800",
    "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=800"
  ];
  const placeholders = isCat ? catPlaceholders : dogPlaceholders;
  const fallbackImg = placeholders[pet.id % placeholders.length];

  // Colección estricta de fotos reales subidas para esta mascota
  const allImages: string[] = [];
  if (pet.imagenUrl && pet.imagenUrl.trim() !== '') {
    const mainImg = pet.imagenUrl.startsWith('http') ? pet.imagenUrl : `http://localhost:8080/uploads/${pet.imagenUrl}`;
    allImages.push(mainImg);
  }
  if (pet.galeria && Array.isArray(pet.galeria)) {
    pet.galeria.forEach((img) => {
      if (img && img.trim() !== '') {
        const gUrl = img.startsWith('http') ? img : `http://localhost:8080/uploads/${img}`;
        if (!allImages.includes(gUrl)) {
          allImages.push(gUrl);
        }
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push(fallbackImg);
  }

  const fotoUrl = allImages[0];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden relative">
      
      {/* HEADER: Minimalist Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-10 min-h-screen flex flex-col items-center">
        
        {/* APP ICON (Pet Profile) */}
        <BlurFade delay={0.1} inView>
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-[32px] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.12)] border border-gray-100 bg-white">
            <img src={fotoUrl} alt={pet.nombre} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
          </div>
          <p className="text-center mt-3 text-sm font-semibold text-gray-500">{(pet as any).refugioNombre || `Refugio #${pet.idRefugio || 'Pawtok'}`}</p>
        </BlurFade>

        {/* TITLE & DESCRIPTION */}
        <BlurFade delay={0.2} inView>
          <div className="text-center mt-8 md:mt-10 max-w-lg mx-auto">
            <h1 className="text-3xl md:text-6xl font-semibold tracking-tighter text-black capitalize leading-tight">
              {pet.nombre}
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-6 font-medium leading-relaxed whitespace-pre-wrap">
              {pet.descripcion}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {pet.raza && <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">{pet.raza}</span>}
              {pet.edad && <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-full">{pet.edad}{String(pet.edad).match(/^\d+$/) ? ' años' : (!String(pet.edad).toLowerCase().includes('año') && !String(pet.edad).toLowerCase().includes('mes') ? ' años' : '')}</span>}
              {pet.peso && <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full">{pet.peso} kg</span>}
              {pet.tamano && <span className="px-3 py-1 text-sm font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-full">{pet.tamano}</span>}
              {pet.energia && <span className="px-3 py-1 text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full">{pet.energia}</span>}
              {pet.conNinos && (
                <span className={`px-3 py-1 text-sm font-semibold border rounded-full ${(pet.conNinos.toLowerCase() === 'sí' || pet.conNinos.toLowerCase() === 'si') ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                  Niños: {pet.conNinos}
                </span>
              )}
              {pet.personalidad && pet.personalidad.split(',').map((p, i) => {
                const colors = [
                  "text-pink-600 bg-pink-50 border-pink-200",
                  "text-indigo-600 bg-indigo-50 border-indigo-200",
                  "text-teal-600 bg-teal-50 border-teal-200",
                  "text-yellow-600 bg-yellow-50 border-yellow-200",
                  "text-red-600 bg-red-50 border-red-200",
                  "text-cyan-600 bg-cyan-50 border-cyan-200"
                ];
                const c = colors[i % colors.length];
                return (
                  <span key={i} className={`px-3 py-1 text-sm font-semibold border rounded-full ${c}`}>
                    {p.trim()}
                  </span>
                );
              })}
            </div>
            
            {/* NEW LOCATION & SHELTER INFO */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 pt-6 border-t border-gray-100">
               <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="text-[#0B84FF] w-5 h-5"/> 
                  <span className="font-medium text-sm md:text-base">{pet.ubicacion || 'Bogotá, Colombia'}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-600">
                  <Home className="text-[#0B84FF] w-5 h-5"/> 
                  <span className="font-medium text-sm md:text-base">{(pet as any).refugioNombre || `Refugio #${pet.idRefugio || 'Pawtok'}`}</span>
               </div>
            </div>
          </div>
        </BlurFade>

        {/* 1. GALERÍA DE FOTOS */}
        <BlurFade delay={0.3} inView className="w-full mt-10 mb-10 overflow-hidden flex flex-col items-center">
          <div className="mx-auto max-w-md md:max-w-lg w-full relative px-6 md:px-12">
            {allImages.length === 1 ? (
              // Vista de foto única limpia
              <div className="overflow-hidden aspect-square rounded-3xl shadow-sm border border-gray-100 bg-white">
                <img 
                  alt={pet.nombre} 
                  src={allImages[0]} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                  onError={(e) => { e.currentTarget.src = fallbackImg; }} 
                />
              </div>
            ) : (
              // Carrusel interactivo para múltiples fotos
              <Carousel.Root 
                opts={{ loop: false, align: 'center' }} 
                setApi={(api) => {
                  if (!api) return;
                  api.on("select", () => {
                    window.dispatchEvent(new CustomEvent('carousel-select', { detail: api.selectedScrollSnap() + 1 }));
                  });
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('carousel-init', { detail: api.scrollSnapList().length }));
                  }, 100);
                }} 
                className="w-full"
              >
                <Carousel.Content>
                  {allImages.map((imgUrl, idx) => (
                    <Carousel.Item key={idx} className="basis-full">
                      <div className="overflow-hidden aspect-square rounded-3xl shadow-sm border border-gray-100 bg-white">
                        <img 
                          alt={`${pet.nombre} ${idx + 1}`} 
                          src={imgUrl} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                          onError={(e) => { e.currentTarget.src = fallbackImg; }} 
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel.Content>

                <Carousel.PrevTrigger className="absolute top-1/2 -left-12 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
                </Carousel.PrevTrigger>
                <Carousel.NextTrigger className="absolute top-1/2 -right-12 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
                </Carousel.NextTrigger>

                <SlideCounter totalCount={allImages.length} />
              </Carousel.Root>
            )}
          </div>
        </BlurFade>

        {/* 2. HISTORIAL MÉDICO */}
        <BlurFade delay={0.35} inView className="w-full mt-1 mb-10 max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Historial Médico</h3>
                <p className="text-sm text-gray-500 mt-1">Registro de vacunas y tratamientos</p>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <motion.button
                    whileHover="hover"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-[#abd5ff] hover:bg-[#97cbff] text-blue-900 font-bold rounded-full shadow-inner shadow-white/80 transition-colors text-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <motion.span
                      variants={{
                        hover: { rotate: 180, scale: 1.15 }
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="inline-flex items-center justify-center"
                    >
                      {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                    </motion.span>
                    <span>{showAddForm ? 'Cancelar' : 'Agregar Registro'}</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* FORMULARIO AGREGAR REGISTRO MÉDICO */}
            {showAddForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newDesc.trim()) return;
                  setIsSubmittingHistorial(true);
                  try {
                    const res = await fetch(`/api/mascotas/${id}/historial`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        fecha: newFecha,
                        descripcion: newDesc,
                        vacuna: newVacuna,
                        desparasitacion: newDesparasitacion
                      })
                    });
                    if (res.ok) {
                      handleShowToast('Registro médico agregado con éxito', 'success');
                      setNewDesc('');
                      setShowAddForm(false);
                      const resH = await fetch(`/api/mascotas/${id}/historial`);
                      if (resH.ok) setHistorial(await resH.json());
                    } else {
                      handleShowToast('Error al guardar el registro médico', 'error');
                    }
                  } catch (err) {
                    handleShowToast('Error de conexión', 'error');
                  } finally {
                    setIsSubmittingHistorial(false);
                  }
                }}
                className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 block mb-1">Fecha</label>
                    <DatePicker
                      value={newFecha}
                      onChange={setNewFecha}
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-5">
                    <AnimatedCheckbox 
                      checked={newVacuna} 
                      onChange={setNewVacuna} 
                      label="Vacuna"
                      activeColor="blue"
                    />
                    <AnimatedCheckbox 
                      checked={newDesparasitacion} 
                      onChange={setNewDesparasitacion} 
                      label="Desparasitación"
                      activeColor="purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Descripción / Tratamiento</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ej. Vacuna Quintuple aplicada. Próxima dosis en 1 año."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingHistorial}
                  className="self-end px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingHistorial ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </form>
            )}

            <div className="p-6 md:p-8">
              {historial.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {historial.map((reg, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-50 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 bg-white shadow-xl/2 transition hover:bg-[#f3f3f3f6]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">{new Date(reg.fecha).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{reg.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                          {reg.vacuna && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                              <Syringe className="w-3 h-3" /> Vacuna <Check className="w-3 h-3" />
                            </span>
                          )}
                          {reg.desparasitacion && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                              <Bug className="w-3 h-3" /> Desparasitación <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Sin registros médicos</p>
                </div>
              )}
            </div>
          </div>
        </BlurFade>

        {/* 3. MAPA Y UBICACIÓN DEL REFUGIO */}
        <BlurFade delay={0.4} inView className="w-full mt-4 mb-10 max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ubicación del Refugio</h3>
                <p className="text-sm text-gray-500 mt-1">{pet.ubicacion || 'Bogotá, Colombia'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#0B84FF]">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
            <div className="h-72 relative bg-gray-100">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(pet.ubicacion || 'Bogotá, Colombia')}&output=embed`}
                className="w-full h-full absolute inset-0"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </BlurFade>

        {/* 4. BOTÓN DE EMPEZAR ADOPCIÓN */}
        <BlurFade delay={0.45} inView className="mt-8 mb-12 flex justify-center">
          <RainbowButton 
            onClick={() => navigate(`/adoptar/${id}`)}
            className="px-10 py-4 h-auto text-lg font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Empezar Adopción
          </RainbowButton>
        </BlurFade>

      </main>

      <Notification toasts={toasts} onDismiss={(tId) => setToasts(prev => prev.filter(t => t.id !== tId))} />
    </div>
  );
}

function SlideCounter({ totalCount = 1 }: { totalCount?: number }) {
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(totalCount);

  useEffect(() => {
    setCount(totalCount);
    const onSelect = (e: any) => setCurrent(e.detail);
    const onInit = (e: any) => setCount(e.detail || totalCount);
    
    window.addEventListener('carousel-select', onSelect);
    window.addEventListener('carousel-init', onInit);
    
    return () => {
      window.removeEventListener('carousel-select', onSelect);
      window.removeEventListener('carousel-init', onInit);
    };
  }, [totalCount]);

  if (count <= 1) return null;

  return (
    <div className="py-3 text-center text-xs font-bold text-gray-400 select-none">
      Foto {current} de {count}
    </div>
  );
}
