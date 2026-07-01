import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, Heart, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MascotaDTO } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente PetsSection (Sección de Mascotas)
 * Muestra la lista de mascotas disponibles.
 * Tiene un motor de búsqueda y filtros. Además, si el usuario viene de hacer el "Test de Compatibilidad" (encuesta),
 * este componente ordena automáticamente las mascotas calculando un "Match Score" según sus respuestas.
 */
export default function PetsSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Si el usuario viene de la página de Encuesta, aquí tendremos sus respuestas guardadas.
  const surveyAnswers = location.state?.surveyAnswers as any;

  const [pets, setPets] = useState<MascotaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros (búsqueda de texto y categoría)
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>(surveyAnswers?.tipo || 'all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Al cargar el componente por primera vez, pide las mascotas al backend
  useEffect(() => {
    fetchPets();
    if (user) fetchFavoriteIds(); // Si el usuario inició sesión, trae sus likes
  }, []);

  /**
   * Trae los IDs de las mascotas a las que el usuario le ha dado "Me gusta".
   */
  const fetchFavoriteIds = async () => {
    try {
      const res = await fetch('/api/favoritos/ids', { credentials: 'include' });
      if (res.ok) {
        const ids: number[] = await res.json();
        setFavorites(new Set(ids));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  /**
   * Trae TODAS las mascotas del backend, pero filtra en el frontend para no mostrar
   * a los que ya fueron "ADOPTADOS".
   */
  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mascotas');
      if (res.ok) {
        const data = await res.json();
        setPets(data.filter((p: any) => p.estado !== 'ADOPTADO'));
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dar / Quitar Like a una mascota.
   */
  const toggleFavorite = async (id: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      await fetch(`/api/favoritos/${id}`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedType('all');
  };

  /**
   * ESTE ES EL CEREBRO DE LA BÚSQUEDA Y LA ENCUESTA.
   * `useMemo` significa que React solo vuelve a calcular esta lista si cambian las mascotas, 
   * lo que escribes en la búsqueda, o tus respuestas de la encuesta.
   */
  const filteredPets = useMemo(() => {
    // 1. Filtro normal (Barra de búsqueda y botones de perro/gato)
    let result = pets.filter(pet => {
      const nombre = pet.nombre?.toLowerCase() || '';
      const raza = pet.raza?.toLowerCase() || '';
      const refugioNombre = (pet.refugioNombre || 'Refugio Pawtok').toLowerCase();
      
      const textMatch = !searchText || 
        nombre.includes(searchText.toLowerCase()) || 
        raza.includes(searchText.toLowerCase()) || 
        refugioNombre.includes(searchText.toLowerCase());

      const typeMatch = selectedType === 'all' || (pet.categoria?.toLowerCase() === selectedType);
      
      return textMatch && typeMatch;
    });

    // 2. Si venimos de la Encuesta, aplicamos el Motor de "Match"
    if (surveyAnswers) {
      result = result.map(pet => {
        let score = 50; // Puntaje base
        
        // --- Lógica del Algoritmo de Compatibilidad ---

        // Si buscó perro y la mascota es perro, suma puntos
        if (surveyAnswers.tipo && pet.categoria?.toLowerCase() === surveyAnswers.tipo.toLowerCase()) {
          score += 20;
        }

        // Vivienda
        const tamano = pet.tamano?.toLowerCase() || '';
        if (surveyAnswers.vivienda === 'apartamento') {
          if (tamano === 'grande') score -= 25;
          if (tamano === 'pequeño' || tamano === 'pequeña') score += 15;
        } else if (surveyAnswers.vivienda === 'finca') {
          if (tamano === 'grande') score += 20;
        }

        // Niños
        const conNinos = pet.conNinos?.toLowerCase() || '';
        if (surveyAnswers.tiene_ninos) {
          if (conNinos === 'sí' || conNinos === 'si') score += 20;
          else score -= 30; // Strongly penalize if has kids but pet is not good with kids
        }

        // Tiempo solo
        if (surveyAnswers.tiempo_solo === 'mucho') {
          if (pet.categoria?.toLowerCase() === 'perro' && (pet.edad?.toLowerCase().includes('cachorro') || pet.energia?.toLowerCase() === 'alta')) {
            score -= 25;
          }
          if (pet.categoria?.toLowerCase() === 'gato') score += 15;
        }

        // Experiencia
        if (surveyAnswers.es_principiante || surveyAnswers.experiencia === 'principiante') {
          if (pet.personalidad?.toLowerCase().includes('difícil') || pet.energia?.toLowerCase() === 'alta') {
            score -= 20;
          } else {
            score += 10;
          }
        }

        // Cap score between 10 and 99 (para que no salga un 120% ni un -5%)
        score = Math.max(10, Math.min(99, score));

        return { ...pet, matchScore: score };
      });

      // Finalmente, ordenamos la lista para que los que tengan mayor puntuación (MatchScore)
      // aparezcan primero en la pantalla.
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return result;
  }, [pets, searchText, selectedType, surveyAnswers]);

  const inputClass = "w-full rounded-2xl pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200/90 focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 transition-all text-sm text-gray-700 placeholder-gray-400 outline-none backdrop-blur-md";

  return (
    <section id="mascotas-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-12 text-center md:text-center"
      >
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4 tracking-tight">
          {surveyAnswers ? 'Resultados del ' : 'Encuentra tu Compañero '}
          <span className="text-[#0B84FF]">
            {surveyAnswers ? 'Test de Compatibilidad' : 'Perfecto'}
          </span>
        </h2>
        <p className="text-gray-500 max-w-2xl text-lg mx-auto">
          {surveyAnswers 
            ? 'Hemos ordenado a estas mascotas basándonos en tu perfil y estilo de vida.' 
            : 'Explora cientos de mascotas que buscan una segunda oportunidad y un hogar lleno de amor.'}
        </p>
      </motion.div>

      {surveyAnswers && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#0B84FF] rounded-full flex items-center justify-center text-white">
               <Search className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-gray-800">Tus resultados personalizados</p>
               <p className="text-sm text-gray-500">Filtrando por {surveyAnswers.tipo ? surveyAnswers.tipo : 'todas las mascotas'} y afinidad a tu hogar.</p>
             </div>
          </div>
          <button onClick={() => navigate('/encuesta')} className="text-sm font-medium text-[#0B84FF] hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">Volver a intentar</button>
        </motion.div>
      )}

        {/* Filters Box */}
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(11,132,255,0.08)] p-5"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Bar */}
            <div className="relative group w-full md:w-1/2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B84FF] transition-colors z-10 pointer-events-none">
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre, raza o refugio..." 
                value={searchText} 
                onChange={e => setSearchText(e.target.value)} 
                className="w-full rounded-2xl pl-12 pr-4 py-3 bg-white/80 border border-gray-200/90 focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 transition-all text-base text-gray-800 placeholder-gray-500 outline-none backdrop-blur-md font-medium" 
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {['all', 'perro', 'gato', 'otro'].map(type => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${selectedType === type ? 'bg-[#ecf6ff] text-[#027efa] border-[#57abff] shadow-lg shadow-blue-500/20' : 'bg-white/80 text-gray-500 border-gray-100 hover:text-[#0B84FF] hover:border-blue-100'}`}
                >
                  {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

      <motion.div 
        initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between mt-12 mb-6"
      >
        <h3 className="text-xl font-semibold text-gray-500">Mascotas disponibles</h3>
        <p className="text-sm font-medium text-gray-500">{filteredPets.length} resultado{filteredPets.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#0B84FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPets.map((pet, idx) => {
              const tipo = pet.categoria?.toLowerCase() || 'otro';
              let badgeColors = "bg-pink-50 text-pink-500 border-pink-100";
              if (tipo === 'perro') badgeColors = "bg-blue-50 text-[#0B84FF] border-blue-100";
              if (tipo === 'gato') badgeColors = "bg-orange-50 text-orange-500 border-orange-100";

              const isCat = tipo === 'gato';
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
              const isFav = favorites.has(pet.id);
              const isAdmin = user?.rol === 'ADMIN';

              return (
                <motion.article
                  layout
                  key={`${selectedType}-${pet.id}`}
                  onClick={() => navigate(`/mascotas/${pet.id}`)}
                  initial={{ opacity: 0, filter: 'blur(12px)', y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(12px)', y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut', layout: { duration: 0.4 } }}
                  className="rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden relative group hover:shadow-[0_8px_30px_rgba(11,132,255,0.12)] transition-all duration-300 h-[340px] flex flex-col justify-end cursor-pointer"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0">
                    <img src={fotoUrl} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
                    
                    {/* Glassmorphism blur fade at the bottom */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backdropFilter: 'blur(32px)',
                        WebkitBackdropFilter: 'blur(32px)',
                        maskImage: 'linear-gradient(to top, black 0%, transparent 50%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 50%)'
                      }}
                    />
                    
                    {/* Dark Gradient to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                  </div>

                  {pet.matchScore && (
                    <div className="absolute top-4 left-4 z-30">
                      <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {pet.matchScore}% Match
                      </div>
                    </div>
                  )}


                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pet.id);
                    }}
                    className="absolute top-4 right-4 p-2 transition-all z-30 cursor-pointer drop-shadow-md hover:scale-110 active:scale-95"
                  >
                    <Heart className={`w-6 h-6 transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-white hover:text-red-400'}`} />
                  </button>

                  {/* Text Information Overlay */}
                  <div className="relative z-10 p-5 flex flex-col gap-1 text-left w-full transition-transform duration-300 pb-6">
                    <h3 className="text-[22px] font-semibold text-white leading-tight truncate drop-shadow-md">{pet.nombre}</h3>
                    <p className="text-[14px] text-gray-300 font-medium drop-shadow-sm">{pet.raza || pet.categoria}</p>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {!loading && filteredPets.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-800">No se encontraron mascotas</h3>
          <p className="text-gray-500 mt-2">Prueba ajustando los filtros de búsqueda.</p>
        </div>
      )}
    </section>
  );
}
