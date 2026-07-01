import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Home } from 'lucide-react';
import Notification from '../components/Notification';
import { ToastMessage, MascotaDTO } from '../types';
import { RainbowButton } from '../components/ui/rainbow-button';
import { BlurFade } from '../components/ui/blur-fade';
import { Carousel, CarouselIndicator } from '../components/ui/simple-carousel';
import Autoplay from 'embla-carousel-autoplay';

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<MascotaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const fotoUrl = (pet.imagenUrl && pet.imagenUrl.trim() !== '') ? (pet.imagenUrl.startsWith('http') ? pet.imagenUrl : `http://localhost:8080/uploads/${pet.imagenUrl}`) : fallbackImg;

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
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-[32px] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.12)] border border-gray-100">
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

        {/* ACTION BUTTON */}
        <BlurFade delay={0.3} inView>
            <div className="mt-10 flex justify-center">
            <RainbowButton 
                onClick={() => navigate(`/adoptar/${id}`)}
                className="px-8 py-3.5 h-auto text-base font-bold shadow-lg"
              >
                Empezar Adopción
            </RainbowButton>
            </div>
        </BlurFade>

        {/* MAP & SHELTER BOX */}
        <BlurFade delay={0.35} inView className="w-full mt-16 max-w-2xl mx-auto px-6">
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

        {/* SHADCN STYLE CAROUSEL - Show uploaded gallery or placeholders */}
        {pet.galeria && pet.galeria.length > 0 && (
          <BlurFade delay={0.4} inView className="w-full mt-4 mb-10 overflow-hidden flex flex-col items-center">
            <div className="text-center mb-8">
            </div>
          
          <div className="mx-auto max-w-md md:max-w-lg w-full relative px-6 md:px-12">
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
            }} className="w-full">
              <Carousel.Content>
                {pet.galeria && pet.galeria.length > 0 ? (
                  pet.galeria.map((imgName, idx) => {
                    const imgUrl = (imgName.startsWith('http') ? imgName : `http://localhost:8080/uploads/${imgName}`);
                    return (
                      <Carousel.Item key={idx} className="basis-full">
                        <div className="overflow-hidden aspect-square rounded-3xl">
                          <img alt={`Mascota ${idx}`} src={imgUrl} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
                        </div>
                      </Carousel.Item>
                    );
                  })
                ) : (
                  <>
                      <Carousel.Item className="basis-full">
                        <div className="overflow-hidden aspect-square rounded-3xl">
                          <img alt="Mascota" src={fotoUrl} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
                        </div>
                      </Carousel.Item>
                      <Carousel.Item className="basis-full">
                        <div className="overflow-hidden aspect-square rounded-3xl">
                          <img alt="Imagen 2" src="https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                        </div>
                      </Carousel.Item>
                      <Carousel.Item className="basis-full">
                        <div className="overflow-hidden aspect-square rounded-3xl">
                          <img alt="Imagen 3" src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                        </div>
                      </Carousel.Item>
                  </>
                )}
              </Carousel.Content>

              <Carousel.PrevTrigger className="absolute top-1/2 -left-12 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5" />
              </Carousel.PrevTrigger>
              <Carousel.NextTrigger className="absolute top-1/2 -right-12 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronRight className="w-5 h-5" />
              </Carousel.NextTrigger>
            </Carousel.Root>
            
            {/* Custom Slide Counter */}
            <SlideCounter />
          </div>

          </BlurFade>
        )}

      </main>

      <Notification toasts={toasts} onDismiss={(tId) => setToasts(prev => prev.filter(t => t.id !== tId))} />
    </div>
  );
}

function SlideCounter() {
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(3);

  useEffect(() => {
    const onSelect = (e: any) => setCurrent(e.detail);
    const onInit = (e: any) => setCount(e.detail);
    
    window.addEventListener('carousel-select', onSelect);
    window.addEventListener('carousel-init', onInit);
    
    return () => {
      window.removeEventListener('carousel-select', onSelect);
      window.removeEventListener('carousel-init', onInit);
    };
  }, []);

  return (
    <div className="py-4 text-center text-sm text-gray-500 font-medium">
      Slide {current} of {count}
    </div>
  );
}
