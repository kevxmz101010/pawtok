import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Home, Heart, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, 
  SlidersHorizontal, Dog, Cat, Building2, TreePine, Baby, PawPrint, Clock, 
  Award, Activity, Maximize2, Calendar, Zap, Shield, Coffee, Footprints,
  ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MascotaDTO } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import PassportPetCard from './PassportPetCard';
import { formatPetImageUrl } from '../utils/imageUtils';

/**
 * Funciones auxiliares de normalización y categorización para compatibilidad
 */
const normalizeText = (str?: string | null): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const getPetSizeCategory = (tamano?: string, peso?: string): 'pequeno' | 'mediano' | 'grande' => {
  const norm = normalizeText(tamano);
  const pesoNorm = normalizeText(peso);
  if (norm.includes('peque') || norm.includes('pequ') || norm.includes('chico') || norm.includes('mini')) return 'pequeno';
  if (norm.includes('gran') || norm.includes('gigant')) return 'grande';
  if (pesoNorm) {
    const num = parseFloat(pesoNorm.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      if (num < 10) return 'pequeno';
      if (num > 25) return 'grande';
      return 'mediano';
    }
  }
  return 'mediano';
};

const getPetEnergyCategory = (energia?: string): 'baja' | 'media' | 'alta' => {
  const norm = normalizeText(energia);
  if (norm.includes('alt') || norm.includes('enérg') || norm.includes('energ')) return 'alta';
  if (norm.includes('baj') || norm.includes('calm') || norm.includes('tranquil')) return 'baja';
  return 'media';
};

const getPetAgeCategory = (edad?: any): 'cachorro' | 'adulto' | 'senior' => {
  if (!edad) return 'adulto';
  const norm = normalizeText(String(edad));
  if (norm.includes('cachorr') || norm.includes('mes') || norm.includes('bebe') || norm.includes('puppy')) return 'cachorro';
  if (norm.includes('senior') || norm.includes('ancian') || norm.includes('viej') || norm.includes('abuel')) return 'senior';
  const num = parseFloat(norm.replace(/[^0-9.]/g, ''));
  if (!isNaN(num)) {
    if (num < 1.5) return 'cachorro';
    if (num >= 8) return 'senior';
    return 'adulto';
  }
  return 'adulto';
};

const isGoodWithKids = (conNinos?: string): 'yes' | 'no' | 'unknown' => {
  const norm = normalizeText(conNinos);
  if (norm.includes('no')) return 'no';
  if (norm.includes('si') || norm.includes('s') || norm === 's??' || norm.startsWith('s')) return 'yes';
  return 'unknown';
};

interface PetsSectionProps {
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * Componente PetsSection (Sección de Mascotas)
 * Muestra la lista de mascotas disponibles.
 * Integra el motor de compatibilidad avanzado cuando el usuario realiza el test en /encuesta.
 */
export default function PetsSection({ onShowToast }: PetsSectionProps = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Si el usuario viene de la página de Encuesta o la tiene en su sesión activa (exclusivo para adoptantes)
  const [surveyAnswers, setSurveyAnswers] = useState<any>(() => {
    if (user && user.rol !== 'USUARIO') {
      try {
        sessionStorage.removeItem('pawtok_survey');
        sessionStorage.removeItem('pawtok_survey_user_id');
        localStorage.removeItem('pawtok_survey');
      } catch {}
      return null;
    }

    try {
      const savedUserId = sessionStorage.getItem('pawtok_survey_user_id');
      const expectedId = user ? String(user.id) : 'guest';
      if (savedUserId && savedUserId !== expectedId) {
        sessionStorage.removeItem('pawtok_survey');
        sessionStorage.removeItem('pawtok_survey_user_id');
        localStorage.removeItem('pawtok_survey');
        return null;
      }
    } catch {}

    if (location.state?.surveyAnswers) return location.state.surveyAnswers;
    try {
      const saved = sessionStorage.getItem('pawtok_survey');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Reaccionar inmediatamente si el usuario cambia de cuenta o de rol
  useEffect(() => {
    if (user && user.rol !== 'USUARIO') {
      setSurveyAnswers(null);
      setShowOnlyMatches(false);
      try {
        sessionStorage.removeItem('pawtok_survey');
        sessionStorage.removeItem('pawtok_survey_user_id');
        localStorage.removeItem('pawtok_survey');
      } catch {}
    } else if (user) {
      try {
        const savedUserId = sessionStorage.getItem('pawtok_survey_user_id');
        if (savedUserId && savedUserId !== String(user.id)) {
          setSurveyAnswers(null);
          setShowOnlyMatches(false);
          sessionStorage.removeItem('pawtok_survey');
          sessionStorage.removeItem('pawtok_survey_user_id');
          localStorage.removeItem('pawtok_survey');
        }
      } catch {}
    }
  }, [user]);

  const [pets, setPets] = useState<MascotaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros (búsqueda de texto, categoría y modo solo compatibles)
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>(surveyAnswers?.tipo || 'all');
  const [showOnlyMatches, setShowOnlyMatches] = useState<boolean>(Boolean(surveyAnswers));
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showAllPreferences, setShowAllPreferences] = useState(false);

  // Lista estructurada de preferencias del usuario a partir del test
  const preferencesList = useMemo(() => {
    if (!surveyAnswers) return [];
    const list: { id: string; label: string; icon: React.ReactNode }[] = [];

    if (surveyAnswers.tipo) {
      list.push({
        id: 'tipo',
        label: surveyAnswers.tipo === 'perro' ? 'Solo Perros' : 'Solo Gatos',
        icon: surveyAnswers.tipo === 'perro' ? (
          <Dog className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
        ) : (
          <Cat className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        ),
      });
    }

    if (surveyAnswers.vivienda) {
      const v = surveyAnswers.vivienda;
      list.push({
        id: 'vivienda',
        label: v.charAt(0).toUpperCase() + v.slice(1),
        icon: v === 'apartamento' ? (
          <Building2 className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
        ) : v === 'finca' ? (
          <TreePine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <Home className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
        ),
      });
    }

    if (surveyAnswers.actividad) {
      const act = surveyAnswers.actividad;
      list.push({
        id: 'actividad',
        label: act === 'activo' ? 'Ritmo activo' : act === 'tranquilo' ? 'Ritmo tranquilo' : 'Ritmo moderado',
        icon: act === 'activo' ? (
          <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        ) : act === 'tranquilo' ? (
          <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <Footprints className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        ),
      });
    }

    if (surveyAnswers.tamano_preferido) {
      list.push({
        id: 'tamano',
        label: surveyAnswers.tamano_preferido === 'cualquiera' ? 'Cualquier tamaño' : `Tamaño ${surveyAnswers.tamano_preferido}`,
        icon: <Maximize2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />,
      });
    }

    if (surveyAnswers.etapa_vida) {
      list.push({
        id: 'etapa',
        label: surveyAnswers.etapa_vida === 'cualquiera' ? 'Cualquier edad' : `Etapa ${surveyAnswers.etapa_vida}`,
        icon: <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />,
      });
    }

    if (surveyAnswers.personalidad_deseada) {
      list.push({
        id: 'personalidad',
        label: surveyAnswers.personalidad_deseada === 'cualquiera' ? 'Cualquier personalidad' : `Perfil ${surveyAnswers.personalidad_deseada}`,
        icon: <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
      });
    }

    if (surveyAnswers.tiene_ninos) {
      list.push({
        id: 'ninos',
        label: 'Apto con niños',
        icon: <Baby className="w-3.5 h-3.5 text-orange-500 shrink-0" />,
      });
    }

    if (surveyAnswers.tiene_mascotas) {
      list.push({
        id: 'mascotas',
        label: 'Sociable con mascotas',
        icon: <PawPrint className="w-3.5 h-3.5 text-purple-600 shrink-0" />,
      });
    }

    if (surveyAnswers.tiempo_solo) {
      list.push({
        id: 'tiempo',
        label: surveyAnswers.tiempo_solo === 'poco' ? '< 4h a solas' : surveyAnswers.tiempo_solo === 'medio' ? '4 a 8h a solas' : '> 8h a solas',
        icon: <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
      });
    }

    if (surveyAnswers.es_principiante || surveyAnswers.experiencia) {
      const isPrinc = surveyAnswers.es_principiante || surveyAnswers.experiencia === 'principiante';
      list.push({
        id: 'experiencia',
        label: isPrinc ? 'Principiante' : 'Con experiencia',
        icon: <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
      });
    }

    return list;
  }, [surveyAnswers]);

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
   * Elimina las respuestas del test de compatibilidad, limpiando storage y reseteando filtros.
   */
  const handleClearSurvey = () => {
    try {
      sessionStorage.removeItem('pawtok_survey');
      localStorage.removeItem('pawtok_survey');
    } catch (e) {
      console.error('Error clearing survey from storage:', e);
    }
    setSurveyAnswers(null);
    setShowOnlyMatches(false);
    setSelectedType('all');
    navigate('/mascotas', { replace: true, state: {} });
    if (onShowToast) {
      onShowToast('Resultados del test eliminados', 'info');
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
    setShowOnlyMatches(false);
  };

  /**
   * CÁLCULO DE COMPATIBILIDAD (MATCH SCORE)
   * Evalúa exhaustivamente todas las características de la mascota:
   * categoría, energía, tamaño, peso, edad, seguridad con niños,
   * rasgos de personalidad, vivienda, tiempo a solas y nivel de experiencia.
   */
  const scoredPets = useMemo(() => {
    return pets.map(pet => {
      if (!surveyAnswers) {
        return { ...pet, matchScore: undefined, matchReason: undefined, isDisqualified: false };
      }

      const petType = (pet.categoria || '').toLowerCase();
      const requiredType = (surveyAnswers.tipo || '').toLowerCase();

      // 1. Especie estricta: Si buscó perro, solo perros. Si buscó gato, solo gatos.
      if (requiredType && petType !== requiredType) {
        return { ...pet, matchScore: 0, isDisqualified: true };
      }

      // 2. Seguridad estricta con niños: Si tiene niños pequeños y la mascota explícitamente no es apta
      const kidsStatus = isGoodWithKids(pet.conNinos);
      if (surveyAnswers.tiene_ninos && kidsStatus === 'no') {
        return { ...pet, matchScore: 0, isDisqualified: true };
      }

      let score = 58; // Puntuación base calibrada
      const reasons: string[] = [];

      const petEnergy = getPetEnergyCategory(pet.energia);
      const petSize = getPetSizeCategory(pet.tamano, pet.peso);
      const petAge = getPetAgeCategory(pet.edad);
      const persNorm = normalizeText(pet.personalidad + ' ' + (pet.descripcion || ''));

      // 3. Nivel de Actividad Diaria vs Energía de la mascota
      if (surveyAnswers.actividad) {
        if (surveyAnswers.actividad === 'activo') {
          if (petEnergy === 'alta') {
            score += 20;
            reasons.push('Excelente para tu estilo de vida activo');
          } else if (petEnergy === 'media') {
            score += 12;
          } else {
            score -= 10;
          }
        } else if (surveyAnswers.actividad === 'tranquilo') {
          if (petEnergy === 'baja') {
            score += 20;
            reasons.push('Ritmo tranquilo y sereno para tu hogar');
          } else if (petEnergy === 'media') {
            score += 10;
          } else {
            score -= 22; // Incompatible: adoptante tranquilo con mascota hiperactiva
          }
        } else if (surveyAnswers.actividad === 'moderado') {
          if (petEnergy === 'media') {
            score += 18;
            reasons.push('Nivel de energía equilibrado');
          } else {
            score += 10;
          }
        }
      }

      // 4. Preferencia explícita de Tamaño vs petSize
      if (surveyAnswers.tamano_preferido && surveyAnswers.tamano_preferido !== 'cualquiera') {
        if (surveyAnswers.tamano_preferido === petSize) {
          score += 15;
          reasons.push(`Tamaño ${petSize} como prefieres`);
        } else if (
          (surveyAnswers.tamano_preferido === 'pequeño' && petSize === 'grande') ||
          (surveyAnswers.tamano_preferido === 'grande' && petSize === 'pequeño')
        ) {
          score -= 18;
        } else {
          score -= 6;
        }
      } else {
        score += 8; // Abierto a cualquier tamaño
      }

      // 5. Espacio de Vivienda vs Tamaño y Energía
      if (surveyAnswers.vivienda === 'apartamento') {
        if (petSize === 'pequeno') {
          score += 16;
          reasons.push('Tamaño perfecto para apartamento');
        } else if (petSize === 'mediano') {
          if (petEnergy === 'baja' || petEnergy === 'media') {
            score += 12;
            reasons.push('Buena adaptación a apartamento');
          } else {
            score -= 10;
          }
        } else if (petSize === 'grande') {
          if (petEnergy === 'alta') {
            score -= 22;
          } else {
            score -= 12;
          }
        }
      } else if (surveyAnswers.vivienda === 'finca') {
        if (petSize === 'grande' || petEnergy === 'alta') {
          score += 18;
          reasons.push('Ideal para espacios abiertos y correr libre');
        } else {
          score += 12;
        }
      } else { // casa
        score += 14;
        reasons.push('Ideal para el espacio de una casa');
      }

      // 6. Preferencia explícita de Etapa de Vida / Edad
      if (surveyAnswers.etapa_vida && surveyAnswers.etapa_vida !== 'cualquiera') {
        if (surveyAnswers.etapa_vida === petAge) {
          score += 16;
          if (petAge === 'cachorro') reasons.push('Etapa joven lista para educar');
          else if (petAge === 'adulto') reasons.push('Edad adulta con carácter estable');
          else if (petAge === 'senior') reasons.push('Compañero senior noble y apacible');
        } else {
          score -= 8;
        }
      } else {
        score += 8;
      }

      // 7. Personalidad Deseada vs pet.personalidad / descripcion
      if (surveyAnswers.personalidad_deseada && surveyAnswers.personalidad_deseada !== 'cualquiera') {
        const p = surveyAnswers.personalidad_deseada;
        if (p === 'carinoso' && (persNorm.includes('carin') || persNorm.includes('apeg') || persNorm.includes('dulc') || persNorm.includes('amor') || persNorm.includes('mimos'))) {
          score += 16;
          reasons.push('Personalidad cariñosa y cercana');
        } else if (p === 'tranquilo' && (persNorm.includes('tranquil') || persNorm.includes('calm') || persNorm.includes('pacien') || persNorm.includes('seren') || persNorm.includes('repos'))) {
          score += 16;
          reasons.push('Temperamento tranquilo y paciente');
        } else if (p === 'jugueton' && (persNorm.includes('juguet') || persNorm.includes('alegr') || persNorm.includes('divert') || persNorm.includes('activ') || persNorm.includes('curios'))) {
          score += 16;
          reasons.push('Carácter alegre y juguetón');
        } else if (p === 'protector' && (persNorm.includes('protect') || persNorm.includes('leal') || persNorm.includes('guardian') || persNorm.includes('atent') || persNorm.includes('fiel'))) {
          score += 16;
          reasons.push('Leal y protector del hogar');
        } else {
          score += 5;
        }
      }

      // 8. Niños en el hogar
      if (surveyAnswers.tiene_ninos) {
        if (kidsStatus === 'yes' || persNorm.includes('nino') || persNorm.includes('pacien') || persNorm.includes('docil')) {
          score += 15;
          reasons.push('Excelente convivencia con niños');
        }
      }

      // 9. Convivencia con otras mascotas
      if (surveyAnswers.tiene_mascotas) {
        if (persNorm.includes('sociab') || persNorm.includes('mascot') || persNorm.includes('perro') || persNorm.includes('gato') || persNorm.includes('amigab')) {
          score += 14;
          reasons.push('Sociable con otras mascotas');
        }
      }

      // 10. Tiempo a solas
      if (surveyAnswers.tiempo_solo === 'mucho') {
        if (petType === 'gato' || persNorm.includes('independ') || persNorm.includes('autonom')) {
          score += 16;
          reasons.push('Independiente en sus horas a solas');
        } else if (petEnergy === 'alta' || petAge === 'cachorro') {
          score -= 22; // Un cachorro o perro muy activo a solas >8h sufre ansiedad
        } else {
          score += 6;
        }
      } else if (surveyAnswers.tiempo_solo === 'poco') {
        if (petEnergy === 'alta' || persNorm.includes('apeg') || persNorm.includes('juguet')) {
          score += 12;
          reasons.push('Disfruta de compañía continua');
        }
      }

      // 11. Experiencia del adoptante
      if (surveyAnswers.es_principiante || surveyAnswers.experiencia === 'principiante') {
        if (persNorm.includes('obed') || persNorm.includes('docil') || persNorm.includes('facil') || persNorm.includes('noble')) {
          score += 12;
          reasons.push('Ideal para adoptantes primerizos');
        } else if (petEnergy === 'alta' && petSize === 'grande') {
          score -= 16;
        }
      } else {
        score += 8;
      }

      // Delimitar entre 35% y 99%
      score = Math.max(35, Math.min(99, score));
      const mainReason = reasons[0] || (score >= 85 ? 'Alta afinidad con tu estilo de vida' : 'Compatible con tus preferencias');

      return {
        ...pet,
        matchScore: score,
        matchReason: mainReason,
        isDisqualified: false,
      };
    });
  }, [pets, surveyAnswers]);

  // Conteo de mascotas compatibles (afinidad >= 70%)
  const compatibleMatchesCount = useMemo(() => {
    return scoredPets.filter(p => !(p as any).isDisqualified && ((p.matchScore || 0) >= 70)).length;
  }, [scoredPets]);

  /**
   * FILTRO FINAL DE MASCOTAS
   */
  const filteredPets = useMemo(() => {
    let list = scoredPets;

    // 1. Si venimos de la Encuesta y está activo el filtro de solo compatibles
    if (surveyAnswers && showOnlyMatches) {
      list = list.filter(p => !(p as any).isDisqualified && ((p.matchScore || 0) >= 70));
    } else {
      // Filtro tradicional por categoría
      if (selectedType !== 'all') {
        list = list.filter(p => p.categoria?.toLowerCase() === selectedType.toLowerCase());
      }
    }

    // 2. Filtro por barra de búsqueda
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      list = list.filter(p => {
        const nombre = p.nombre?.toLowerCase() || '';
        const raza = p.raza?.toLowerCase() || '';
        const refugio = (p.refugioNombre || '').toLowerCase();
        return nombre.includes(q) || raza.includes(q) || refugio.includes(q);
      });
    }

    // 3. Ordenar por Match Score si venimos de la encuesta
    if (surveyAnswers) {
      list = [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return list;
  }, [scoredPets, surveyAnswers, showOnlyMatches, selectedType, searchText]);

  return (
    <section id="mascotas-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(10px)', y: 22 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 text-center md:text-center"
      >
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4 tracking-tight">
          {surveyAnswers ? 'Resultados del ' : 'Encuentra tu Compañero '}
          <span className="text-[#0B84FF]">
            {surveyAnswers ? 'Test de Compatibilidad' : 'Perfecto'}
          </span>
        </h2>
        <p className="text-gray-500 max-w-2xl text-lg mx-auto">
          {surveyAnswers 
            ? 'Hemos evaluado tu estilo de vida y seleccionado las mascotas con las que tendrás mayor conexión y afinidad mutua.' 
            : 'Explora cientos de mascotas que buscan una segunda oportunidad y un hogar lleno de amor.'}
        </p>
      </motion.div>

      {/* Banner de Resultados de Encuesta */}
      {surveyAnswers && (
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white border border-blue-100/90 p-5 md:p-6 rounded-2xl shadow-xs mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    Tu Perfil de Compatibilidad
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {showOnlyMatches 
                      ? 'Mostrando mascotas con alta afinidad (≥70%) según tus respuestas.' 
                      : 'Explorando todo el catálogo de mascotas con porcentajes de compatibilidad calculados.'}
                  </p>
                </div>
              </div>

              {/* Preferencias resumidas y limpias (Sin saturar la vista) */}
              {preferencesList.length > 0 && (
                <div className="space-y-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-xs text-gray-400 font-medium mr-0.5">Filtros clave:</span>
                    {preferencesList.slice(0, 3).map((pref) => (
                      <span 
                        key={pref.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-blue-100 rounded-full font-medium text-gray-700 shadow-2xs"
                      >
                        {pref.icon}
                        <span>{pref.label}</span>
                      </span>
                    ))}

                    {preferencesList.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllPreferences(prev => !prev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/60 text-[#0B84FF] font-semibold rounded-full transition-colors cursor-pointer text-xs"
                      >
                        <span>{showAllPreferences ? 'Ocultar extras' : `+${preferencesList.length - 3} preferencias`}</span>
                        {showAllPreferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Panel expandible suave con las preferencias secundarias */}
                  <AnimatePresence>
                    {showAllPreferences && preferencesList.length > 3 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center gap-2 pt-1.5 pb-0.5">
                          {preferencesList.slice(3).map((pref) => (
                            <span 
                              key={pref.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/80 border border-blue-100/80 rounded-full text-xs font-medium text-gray-600 shadow-2xs"
                            >
                              {pref.icon}
                              <span>{pref.label}</span>
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Botones de acción compactos */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
              <button
                onClick={() => {
                  setShowOnlyMatches(prev => !prev);
                  if (showOnlyMatches) {
                    setSelectedType('all');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-2xs cursor-pointer ${
                  showOnlyMatches 
                    ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                    : 'bg-[#0B84FF] text-white hover:bg-blue-600 shadow-blue-500/20 shadow-md'
                }`}
              >
                {showOnlyMatches ? `Ver todo (${pets.length})` : `Solo compatibles (${compatibleMatchesCount})`}
              </button>

              <div className="flex flex-col sm:flex-col gap-1.5">
                <button
                  onClick={() => navigate('/encuesta')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-[#0B84FF] hover:bg-blue-100 border border-blue-200/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repetir test</span>
                </button>
                <button
                  onClick={handleClearSurvey}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Borrar resultados del test y volver al catálogo completo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar resultados</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters Box */}
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(10px)', y: 22 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(11,132,255,0.08)] p-5"
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
            {surveyAnswers && (
              <button
                onClick={() => {
                  setShowOnlyMatches(true);
                  setSelectedType(surveyAnswers.tipo || 'all');
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOnlyMatches 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-400 text-white' 
                    : 'bg-white/80 text-gray-600 border-gray-200 hover:text-[#0B84FF] hover:border-blue-200'
                }`}
              >
                <span>Mis Matches ({compatibleMatchesCount})</span>
              </button>
            )}

            {['all', 'perro', 'gato', 'otro'].map(type => {
              const isSelected = !showOnlyMatches && selectedType === type;
              return (
                <button 
                  key={type}
                  onClick={() => {
                    setShowOnlyMatches(false);
                    setSelectedType(type);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#ecf6ff] text-[#027efa] border-[#57abff] shadow-lg shadow-blue-500/20' 
                      : 'bg-white/80 text-gray-500 border-gray-100 hover:text-[#0B84FF] hover:border-blue-100'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mt-10 mb-6"
      >
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          {surveyAnswers && showOnlyMatches ? 'Compañeros compatibles contigo' : 'Mascotas disponibles'}
          {surveyAnswers && showOnlyMatches && (
            <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Afinidad alta
            </span>
          )}
        </h3>
        <p className="text-sm font-medium text-gray-500">
          {filteredPets.length} resultado{filteredPets.length !== 1 ? 's' : ''}
        </p>
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

              const fotoUrl = formatPetImageUrl(pet.imagenUrl, fallbackImg);
              const isFav = favorites.has(pet.id);
              const isAdmin = user?.rol === 'ADMIN';

              return (
                <motion.div
                  layout
                  key={`${selectedType}-${pet.id}`}
                  initial={{ opacity: 0, y: 28, filter: 'blur(12px)', scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(8px)', scale: 0.94 }}
                  transition={{ 
                    duration: 0.45, 
                    delay: 0.2 + Math.min(idx * 0.045, 0.45), 
                    ease: [0.16, 1, 0.3, 1], 
                    layout: { duration: 0.35, ease: 'easeOut' } 
                  }}
                >
                  <PassportPetCard
                    pet={pet}
                    fotoUrl={fotoUrl}
                    fallbackImg={fallbackImg}
                    isFav={isFav}
                    onToggleFavorite={(_id, e) => toggleFavorite(pet.id)}
                    onClick={() => navigate(`/mascotas/${pet.id}`, { state: { surveyAnswers, matchScore: pet.matchScore } })}
                  />
                </motion.div>
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
