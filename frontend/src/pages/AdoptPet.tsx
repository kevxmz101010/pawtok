import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Calendar, Clock, Home as HomeIcon, Briefcase, DollarSign, Phone, MapPin } from 'lucide-react';
import { MascotaDTO } from '../types';
import { BlurFade } from '../components/ui/blur-fade';
import { RainbowButton } from '../components/ui/rainbow-button';
import { useAuth } from '../context/AuthContext';

export default function AdoptPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pet, setPet] = useState<MascotaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [ingresos, setIngresos] = useState('Menos de 1SMMLV');
  const [vivienda, setVivienda] = useState('Casa');
  const [otrasMascotas, setOtrasMascotas] = useState('');
  const [motivo, setMotivo] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/adoptar/${id}` } });
    }
  }, [authLoading, isAuthenticated, navigate, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPet = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/mascotas/${id}`);
        if (!res.ok) throw new Error("Mascota no encontrada");
        const data = await res.json();
        setPet(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/adoptar/${id}` } });
      return;
    }

    try {
      const fullMessage = `Motivo: ${motivo}\nFecha Visita: ${fecha}\nHora Visita: ${hora}\nTeléfono: ${telefono}\nDirección: ${direccion}\nVivienda: ${vivienda}\nOtras mascotas: ${otrasMascotas}\nOcupación: ${ocupacion}\nIngresos: ${ingresos}`;

      const response = await fetch('/api/adopciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mascotaId: Number(id),
          mensaje: fullMessage
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la solicitud.');
      }

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud.');
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

  const fotoUrl = pet.foto ? `http://localhost:8080/uploads/${pet.foto}` : "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80";
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gray-50 font-inter text-gray-800 min-h-screen pt-24 pb-12 px-4 md:px-8">
      
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 font-medium">
          <ChevronLeft className="w-5 h-5" /> Volver a Detalles
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0.1} inView>
          <div className="bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
            
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
                    <button onClick={() => navigate('/cuenta')} className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition">
                      Ir a mi Panel
                    </button>
                    <RainbowButton onClick={() => navigate('/mascotas')} className="px-8 py-4 h-auto text-base font-bold shadow-lg">
                      Seguir Explorando
                    </RainbowButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Solicitud de Adopción</h2>
                    <p className="text-gray-500">Estás a un paso de darle un hogar a <span className="font-semibold text-[#0B84FF]">{pet.nombre}</span>. Por favor completa este formulario para que el refugio te conozca mejor.</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {error}
                    </div>
                  )}

                  {/* Section 1: Cita */}
                  <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                      <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm">1</span>
                      Agendar Visita
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" /> Fecha deseada
                        </label>
                        <input type="date" required min={minDate} value={fecha} onChange={e => setFecha(e.target.value)}
                               className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Clock className="w-4 h-4 text-gray-400" /> Hora aproximada
                        </label>
                        <select required value={hora} onChange={e => setHora(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm appearance-none cursor-pointer">
                          <option value="09:00">09:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="16:00">04:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contacto & Info */}
                  <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                      <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm">2</span>
                      Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Phone className="w-4 h-4 text-gray-400" /> Teléfono / Celular
                        </label>
                        <input type="tel" required placeholder="+57 300..." value={telefono} onChange={e => setTelefono(e.target.value)}
                               className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" /> Dirección de vivienda
                        </label>
                        <input type="text" required placeholder="Calle 123 #45-67" value={direccion} onChange={e => setDireccion(e.target.value)}
                               className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <Briefcase className="w-4 h-4 text-gray-400" /> Ocupación
                        </label>
                        <input type="text" required placeholder="Ej. Estudiante, Ingeniero" value={ocupacion} onChange={e => setOcupacion(e.target.value)}
                               className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4 text-gray-400" /> Rango de Ingresos
                        </label>
                        <select required value={ingresos} onChange={e => setIngresos(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm appearance-none cursor-pointer">
                          <option value="Menos de 1SMMLV">Menos de 1 SMMLV</option>
                          <option value="1-2 SMMLV">1 - 2 SMMLV</option>
                          <option value="Más de 2 SMMLV">Más de 2 SMMLV</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Hogar */}
                  <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                      <span className="w-8 h-8 bg-blue-100 text-[#0B84FF] rounded-xl flex items-center justify-center text-sm shadow-sm">3</span>
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
                        <input type="text" placeholder="Ej. Sí, un perro criollo rescatado..." value={otrasMascotas} onChange={e => setOtrasMascotas(e.target.value)}
                               className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">¿Por qué quieres adoptar a {pet.nombre}?</label>
                        <textarea rows={4} required value={motivo} onChange={e => setMotivo(e.target.value)}
                                  className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-[#0B84FF] outline-none transition shadow-sm resize-none" 
                                  placeholder="Cuéntanos por qué serías la familia ideal..."></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <RainbowButton 
                      type="submit" 
                      className={`w-full py-4 text-lg h-auto rounded-2xl shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : null}
                      Enviar Solicitud al Refugio
                    </RainbowButton>
                    <p className="text-center text-sm text-gray-400 mt-6 font-medium">
                      Al enviar, compartes esta información con el refugio asignado.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Right Side: Pet Card Summary */}
            <div className="lg:w-1/3 bg-gray-50 border-l border-gray-100 p-8 flex flex-col justify-start">
              <div className="sticky top-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Mascota seleccionada</p>
                <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
                  <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-5">
                    <img src={fotoUrl} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                  <div className="px-2 pb-2">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{pet.nombre}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1.5 bg-blue-50 text-[#0B84FF] text-xs font-bold rounded-xl">{pet.raza}</span>
                      <span className="px-3 py-1.5 bg-blue-50 text-[#0B84FF] text-xs font-bold rounded-xl">{pet.edad}{String(pet.edad).match(/^\d+$/) ? ' años' : (!String(pet.edad).toLowerCase().includes('año') && !String(pet.edad).toLowerCase().includes('mes') ? ' años' : '')}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tamaño</span>
                        <span className="font-bold text-gray-900">{pet.tamano || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Energía</span>
                        <span className="font-bold text-gray-900">{pet.energia || 'Media'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Refugio</span>
                        <span className="font-bold text-[#0B84FF] truncate max-w-[120px]">{pet.refugioNombre || 'Refugio Pawtok'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </BlurFade>
      </div>
    </div>
  );
}
