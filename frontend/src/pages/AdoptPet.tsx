import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Calendar, Clock, Home as HomeIcon, Briefcase, DollarSign, Phone, MapPin } from 'lucide-react';
import { MascotaDTO } from '../types';
import { BlurFade } from '../components/ui/blur-fade';
import { RainbowButton } from '../components/ui/rainbow-button';
import { DatePicker } from '../components/ui/date-picker';
import { HeadlessListbox } from '../components/ui/headless-listbox';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPetImageUrl } from '../utils/imageUtils';

function parseShelterSchedule(horarioStr?: string | null) {
  const defaultHours = [
    { value: '08:00', label: '08:00 AM' },
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:00', label: '05:00 PM' },
    { value: '18:00', label: '06:00 PM' },
  ];

  if (!horarioStr || !horarioStr.trim()) {
    return {
      allowedDays: [1, 2, 3, 4, 5, 6], // Lun - Sáb
      hours: defaultHours,
    };
  }

  const h = horarioStr.toLowerCase();
  let allowedDays: number[] = [];

  if (h.includes('todos los d') || h.includes('todos los dias')) {
    allowedDays = [0, 1, 2, 3, 4, 5, 6];
  } else if (h.includes('lun a dom') || h.includes('lunes a domingo')) {
    allowedDays = [0, 1, 2, 3, 4, 5, 6];
  } else if (h.includes('lun a s') || h.includes('lunes a sabado') || h.includes('lunes a sábado')) {
    allowedDays = [1, 2, 3, 4, 5, 6];
  } else if (h.includes('lun a vie') || h.includes('lunes a viernes')) {
    allowedDays = [1, 2, 3, 4, 5];
  } else {
    if (h.includes('lun')) allowedDays.push(1);
    if (h.includes('mar')) allowedDays.push(2);
    if (h.includes('mié') || h.includes('mie')) allowedDays.push(3);
    if (h.includes('jue')) allowedDays.push(4);
    if (h.includes('vie')) allowedDays.push(5);
    if (h.includes('sáb') || h.includes('sab')) allowedDays.push(6);
    if (h.includes('dom')) allowedDays.push(0);
    if (allowedDays.length === 0) {
      allowedDays = [1, 2, 3, 4, 5, 6];
    }
  }

  let startHour = 8;
  let endHour = 18;

  const timeMatch = horarioStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–—a]\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let sh = parseInt(timeMatch[1], 10);
    const sampm = timeMatch[3]?.toLowerCase();
    let eh = parseInt(timeMatch[4], 10);
    const eampm = timeMatch[6]?.toLowerCase();

    if (sampm === 'pm' && sh < 12) sh += 12;
    if (sampm === 'am' && sh === 12) sh = 0;
    if (eampm === 'pm' && eh < 12) eh += 12;
    if (eampm === 'am' && eh === 12) eh = 0;

    if (sh >= 6 && sh <= 22) startHour = sh;
    if (eh >= sh && eh <= 23) endHour = eh;
  }

  const generatedHours: { value: string; label: string }[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const val = `${hour < 10 ? '0' + hour : hour}:00`;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const label = `${h12 < 10 ? '0' + h12 : h12}:00 ${ampm}`;
    generatedHours.push({ value: val, label });
  }

  return {
    allowedDays,
    hours: generatedHours.length > 0 ? generatedHours : defaultHours,
  };
}

/**
 * Formulario de Solicitud de Adopción (AdoptPet.tsx)
 * Es la pantalla donde un Adoptante llena sus datos (ingresos, vivienda, cita, etc.)
 * para aplicar a la adopción de una mascota específica.
 */
export default function AdoptPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { showToast } = useToast();
  const [pet, setPet] = useState<MascotaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shelterSchedule = useMemo(() => {
    return parseShelterSchedule(pet?.refugioHorario);
  }, [pet?.refugioHorario]);

  // Form State
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');

  // Ajustar hora seleccionada según disponibilidad
  useEffect(() => {
    if (shelterSchedule.hours.length > 0) {
      const exists = shelterSchedule.hours.some(h => h.value === hora);
      if (!exists) {
        setHora(shelterSchedule.hours[0].value);
      }
    }
  }, [shelterSchedule, hora]);

  // Función para deshabilitar días no laborables del refugio en el calendario
  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    return !shelterSchedule.allowedDays.includes(day);
  };
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [direccion, setDireccion] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [ingresos, setIngresos] = useState('Menos de 1SMMLV');
  // Prellenar vivienda y otras mascotas si el adoptante realizó la encuesta de compatibilidad
  const [vivienda, setVivienda] = useState(() => {
    try {
      const savedUserId = sessionStorage.getItem('pawtok_survey_user_id');
      if (savedUserId && user && savedUserId !== String(user.id)) return 'Casa';
      const saved = sessionStorage.getItem('pawtok_survey');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.vivienda === 'apartamento') return 'Apartamento';
        if (s.vivienda === 'finca') return 'Finca';
        if (s.vivienda === 'casa') return 'Casa';
      }
    } catch {}
    return 'Casa';
  });
  const [otrasMascotas, setOtrasMascotas] = useState(() => {
    try {
      const savedUserId = sessionStorage.getItem('pawtok_survey_user_id');
      if (savedUserId && user && savedUserId !== String(user.id)) return '';
      const saved = sessionStorage.getItem('pawtok_survey');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.tiene_mascotas) return 'Sí, tengo otras mascotas en casa';
        if (s.tiene_mascotas === false) return 'No tengo otras mascotas';
      }
    } catch {}
    return '';
  });
  const [motivo, setMotivo] = useState('');
  const [hasPendingApplication, setHasPendingApplication] = useState(false);

  useEffect(() => {
    if (user?.telefono && !telefono) {
      setTelefono(user.telefono);
    }
  }, [user]);

  // Redirigir al Login si no ha iniciado sesión o si no es rol adoptante
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { returnUrl: `/adoptar/${id}` } });
      } else if (user && user.rol !== 'USUARIO') {
        showToast('Los perfiles de refugio y administradores no pueden postularse a adopciones.', 'error');
        navigate(`/mascotas/${id}`, { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, id, showToast]);

  /**
   * Pide al backend la información del perrito para mostrarla al lado del formulario.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/mascotas/${id}`);
        if (!res.ok) throw new Error("Mascota no encontrada");
        const data = await res.json();
        setPet(data);

        // Verificar si el usuario ya tiene una solicitud pendiente para esta mascota
        try {
          const adopcionesRes = await fetch('/api/adopciones/mis-adopciones', { credentials: 'include' });
          if (adopcionesRes.ok) {
            const adopciones: any[] = await adopcionesRes.json();
            const yaSolicitada = adopciones.some((a: any) => 
              (a.mascotaId === Number(id) || a.mascota?.id === Number(id)) && 
              String(a.estado).toUpperCase() !== 'RECHAZADA'
            );
            if (yaSolicitada) {
              setHasPendingApplication(true);
              setError('Ya has enviado una solicitud de adopción para esta mascota. Puedes consultar su avance en tu cuenta.');
            }
          }
        } catch (e) {
          console.error("Error al consultar solicitudes existentes:", e);
        }
      } catch (err) {
        navigate('/mascotas');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchPet();
    }
  }, [id, navigate, isAuthenticated]);

  /**
   * Enviar el formulario.
   * Empaqueta todas las respuestas en un "mensaje completo" y lo envía a la base de datos.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (hasPendingApplication) {
      const msg = 'Ya tienes una solicitud de adopción pendiente para esta mascota.';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/adoptar/${id}` } });
      return;
    }

    if (user && user.rol !== 'USUARIO') {
      const msg = 'Los perfiles de refugio y administradores no pueden postularse a adopciones.';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    if (!fecha || !fecha.trim()) {
      const msg = 'Por favor selecciona la fecha deseada para la visita.';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      const msg = 'El teléfono debe tener exactamente 10 dígitos numéricos (ej: 3001234567).';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    if (!direccion.trim()) {
      const msg = 'Por favor ingresa tu dirección de vivienda.';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    if (!ocupacion.trim() || ocupacion.trim().length > 50) {
      const msg = 'Por favor ingresa tu ocupación (máximo 50 caracteres).';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    if (!motivo.trim()) {
      const msg = 'Por favor cuéntanos el motivo por el cual deseas adoptar.';
      setError(msg);
      showToast(msg, 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/adopciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mascotaId: Number(id),
          mensaje: motivo.trim(),
          direccion: direccion.trim(),
          fechaVisita: fecha,
          horaVisita: hora,
          ingresosAprox: ingresos,
          ocupacion: ocupacion.trim(),
          telefono: cleanPhone,
          tieneMascotas: otrasMascotas.trim(),
          tipoVivienda: vivienda
        })
      });

      if (!response.ok) {
        let errorMsg = 'No se pudo enviar la solicitud.';
        try {
          const data = await response.json();
          if (data.message && typeof data.message === 'string') {
            errorMsg = data.message;
          } else if (data.error && typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.errors && typeof data.errors === 'object') {
            const firstErr = Object.values(data.errors)[0];
            errorMsg = typeof firstErr === 'string' ? firstErr : JSON.stringify(data.errors);
          }
        } catch {
          const text = await response.text().catch(() => '');
          if (text) errorMsg = text;
        }

        if (errorMsg.toLowerCase().includes('ya tienes una solicitud')) {
          setHasPendingApplication(true);
        }
        throw new Error(errorMsg);
      }

      setSubmitted(true);
      showToast('¡Solicitud de adopción enviada exitosamente!', 'success');
      window.scrollTo(0, 0);
    } catch (err: any) {
      const msg = err.message || 'Error al enviar la solicitud.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0B84FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  const getPetImageUrl = () => {
    if (!pet) return "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800";
    const isCat = pet.categoria?.toLowerCase() === 'gato';
    const fallback = isCat
      ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800"
      : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800";
    return formatPetImageUrl(pet.imagenUrl || (pet as any).foto, fallback);
  };

  const fotoUrl = getPetImageUrl();
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gray-50/50 font-inter text-gray-800 min-h-screen pt-24 pb-12 px-4 md:px-8">
      
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <BlurFade delay={0.05} inView={false}>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 font-medium cursor-pointer hover:translate-x-[-2px] duration-200">
            <ChevronLeft className="w-5 h-5" /> Volver a Detalles
          </button>
        </BlurFade>
      </div>

      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0.10} inView={false}>
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
            
            {/* Left Side: Form */}
            <div className="p-8 md:p-12 lg:w-2/3">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">¡Solicitud Enviada!</h3>
                  <p className="text-gray-500 mb-10 text-lg max-w-md">Hemos enviado tu formulario al refugio. Ellos revisarán tu perfil y se pondrán en contacto pronto.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate('/cuenta')} className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition cursor-pointer">
                      Ir a mi Panel
                    </button>
                    <RainbowButton onClick={() => navigate('/mascotas')} className="px-8 py-4 h-auto text-base font-bold shadow-lg">
                      Seguir Explorando
                    </RainbowButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Solicitud de Adopción</h2>
                    <p className="text-gray-500">Estás a un paso de darle un hogar a <span className="font-semibold text-[#0B84FF]">{pet.nombre}</span>. Por favor completa este formulario para que el refugio te conozca mejor.</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"></div>
                        <span className="break-words font-medium">{error}</span>
                      </div>
                      {error.toLowerCase().includes('solicitud') && (
                        <button
                          type="button"
                          onClick={() => navigate('/cuenta')}
                          className="shrink-0 text-xs bg-red-600 text-white font-bold px-3.5 py-1.5 rounded-xl hover:bg-red-700 active:scale-95 transition cursor-pointer"
                        >
                          Ver mis solicitudes
                        </button>
                      )}
                    </div>
                  )}

                  {/* Section 1: Cita */}
                  <BlurFade delay={0.15} inView={false}>
                    <div className="bg-gray-50/70 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm font-extrabold">1</span>
                          Agendar Visita
                        </h3>
                        {pet?.refugioHorario && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0B84FF] text-xs font-semibold self-start sm:self-auto">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Horario: {pet.refugioHorario}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" /> Fecha deseada
                          </label>
                          <DatePicker 
                            value={fecha} 
                            onChange={setFecha}
                            minDate={minDate}
                            isDateDisabled={isDateDisabled}
                            placeholder="Seleccionar fecha"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" /> Hora aproximada
                          </label>
                          <HeadlessListbox
                            options={shelterSchedule.hours}
                            value={hora}
                            onChange={setHora}
                            placeholder="Selecciona la hora"
                            buttonClassName="py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 font-semibold focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] shadow-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  {/* Section 2: Contacto & Info */}
                  <BlurFade delay={0.20} inView={false}>
                    <div className="bg-gray-50/70 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm font-extrabold">2</span>
                        Datos Personales
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 text-gray-400" /> Teléfono / Celular
                          </label>
                          <input 
                            type="tel" 
                            required 
                            maxLength={10}
                            placeholder="Ej. 3001234567" 
                            value={telefono} 
                            onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" 
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" /> Dirección de vivienda
                          </label>
                          <input 
                            type="text" 
                            required 
                            maxLength={100}
                            placeholder="Calle 123 #45-67" 
                            value={direccion} 
                            onChange={e => setDireccion(e.target.value.slice(0, 100))}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" 
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Briefcase className="w-4 h-4 text-gray-400" /> Ocupación
                          </label>
                          <input 
                            type="text" 
                            required 
                            maxLength={50}
                            placeholder="Ej. Estudiante, Ingeniero" 
                            value={ocupacion} 
                            onChange={e => setOcupacion(e.target.value.slice(0, 50))}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" 
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-400" /> Rango de Ingresos
                          </label>
                          <HeadlessListbox
                            options={[
                              { value: 'Menos de 1SMMLV', label: 'Menos de 1 SMMLV' },
                              { value: '1-2 SMMLV', label: '1 - 2 SMMLV' },
                              { value: 'Más de 2 SMMLV', label: 'Más de 2 SMMLV' },
                            ]}
                            value={ingresos}
                            onChange={setIngresos}
                            placeholder="Selecciona tu rango de ingresos"
                            buttonClassName="py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 font-semibold focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] shadow-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  {/* Section 3: Hogar */}
                  <BlurFade delay={0.25} inView={false}>
                    <div className="bg-gray-50/70 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm font-extrabold">3</span>
                        Información del Hogar
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <HomeIcon className="w-4 h-4 text-gray-400" /> Tipo de Vivienda
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            {['Casa', 'Apartamento', 'Finca'].map(tipo => (
                              <label key={tipo} className="cursor-pointer">
                                <input type="radio" name="vivienda" value={tipo} checked={vivienda === tipo} onChange={() => setVivienda(tipo)} className="peer sr-only" />
                                <div className="text-center py-4 rounded-2xl border-2 border-gray-100 peer-checked:border-[#0B84FF] peer-checked:bg-blue-50 peer-checked:text-[#0B84FF] font-semibold bg-white transition shadow-sm">
                                  {tipo === 'Apartamento' ? 'Apto' : tipo}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">¿Tienes otras mascotas? (Describe)</label>
                          <input 
                            type="text" 
                            maxLength={150}
                            placeholder="Ej. Sí, un perro criollo rescatado..." 
                            value={otrasMascotas} 
                            onChange={e => setOtrasMascotas(e.target.value.slice(0, 150))}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" 
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">¿Por qué quieres adoptar a {pet.nombre}?</label>
                          <textarea 
                            rows={4} 
                            required 
                            maxLength={300}
                            value={motivo} 
                            onChange={e => setMotivo(e.target.value.slice(0, 300))}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm resize-none" 
                            placeholder="Cuéntanos por qué serías la familia ideal..."></textarea>
                        </div>
                      </div>
                    </div>
                  </BlurFade>

                  <BlurFade delay={0.30} inView={false}>
                    <div className="pt-2">
                      <RainbowButton 
                        type="submit" 
                        disabled={isSubmitting || hasPendingApplication}
                        className={`w-full py-4 text-lg h-auto rounded-2xl shadow-xl flex items-center justify-center gap-3 ${(isSubmitting || hasPendingApplication) ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {hasPendingApplication ? 'Ya has solicitado esta mascota' : 'Enviar Solicitud al Refugio'}
                      </RainbowButton>
                      <p className="text-center text-sm text-gray-400 mt-5 font-medium">
                        Al enviar, compartes esta información con el refugio asignado.
                      </p>
                    </div>
                  </BlurFade>
                </form>
              )}
            </div>

            {/* Right Side: Pet Card Summary (Liquid Glass PetDetails Style) */}
            <div className="lg:w-1/3 bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 md:p-8 flex flex-col justify-start">
              <div className="sticky top-8">
                <BlurFade delay={0.18} inView={false}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0B84FF]"></span>
                    Mascota seleccionada
                  </p>
                  
                  <div className="bg-white/90 backdrop-blur-xl rounded-[2.2rem] p-5 shadow-[0px_20px_40px_-15px_rgba(0,0,0,0.06),inset_0px_0px_20px_rgba(255,255,255,1)] border border-white">
                    {/* Contenedor de la foto con bisel superior y destello */}
                    <div className="aspect-[4/5] rounded-[1.6rem] overflow-hidden mb-5 relative shadow-md border-2 border-white group/img">
                      <img 
                        src={fotoUrl} 
                        alt={pet.nombre} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-white/80 backdrop-blur-md text-xs font-bold text-gray-900 rounded-full border border-white/60 shadow-xs capitalize">
                        {pet.categoria || 'Mascota'}
                      </span>
                    </div>

                    <div className="px-1">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight capitalize mb-2">{pet.nombre}</h3>
                      
                      {/* Badges de raza, edad y peso estilo PetDetails */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {pet.raza && <span className="px-3 py-1 bg-blue-50 text-[#0B84FF] text-xs font-bold rounded-full border border-blue-100">{pet.raza}</span>}
                        {pet.edad && <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">{pet.edad}{String(pet.edad).match(/^\d+$/) ? ' años' : (!String(pet.edad).toLowerCase().includes('año') && !String(pet.edad).toLowerCase().includes('mes') ? ' años' : '')}</span>}
                        {pet.peso && <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100">{pet.peso} kg</span>}
                      </div>

                      {/* Fichas de especificaciones Liquid Glass */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between py-2 px-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                          <span className="text-gray-500 font-semibold">Tamaño</span>
                          <span className="font-bold text-gray-900 capitalize">{pet.tamano || 'Mediano'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                          <span className="text-gray-500 font-semibold">Energía</span>
                          <span className="font-bold text-gray-900 capitalize">{pet.energia || 'Media'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                          <span className="text-gray-500 font-semibold">Refugio</span>
                          <span className="font-bold text-[#0B84FF] truncate max-w-[130px]">{pet.refugioNombre || (pet.refugio ? `Refugio ${pet.refugio}` : 'Refugio Pawtok')}</span>
                        </div>
                        {pet.ubicacion && (
                          <div className="flex items-center justify-between py-2 px-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                            <span className="text-gray-500 font-semibold">Ubicación</span>
                            <span className="font-bold text-gray-900 truncate max-w-[130px]">{pet.ubicacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </BlurFade>
              </div>
            </div>

          </div>
        </BlurFade>
      </div>
    </div>
  );
}
