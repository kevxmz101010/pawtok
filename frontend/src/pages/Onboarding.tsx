import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Home, UploadCloud, ChevronRight, CheckCircle2, Clock, Calendar, Instagram, Facebook, X, Check, Globe, Sparkles, Camera, MapPin, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.91 1.6V7.2a4.83 4.83 0 0 1-1-.51z" />
    </svg>
  );
}

const DIAS_SEMANA = [
  { id: 'Lun', label: 'Lunes', short: 'Lun' },
  { id: 'Mar', label: 'Martes', short: 'Mar' },
  { id: 'Mié', label: 'Miércoles', short: 'Mié' },
  { id: 'Jue', label: 'Jueves', short: 'Jue' },
  { id: 'Vie', label: 'Viernes', short: 'Vie' },
  { id: 'Sáb', label: 'Sábado', short: 'Sáb' },
  { id: 'Dom', label: 'Domingo', short: 'Dom' },
];

function formatHora12(h: string): string {
  if (!h) return '';
  const [hhStr, mmStr] = h.split(':');
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm < 10 ? '0' + mm : mm} ${ampm}`;
}

function calcularHorarioString(dias: string[], apertura: string, cierre: string, manual: string, esManual: boolean): string {
  if (esManual) return manual.trim();
  if (!dias || dias.length === 0) return 'Cerrado temporalmente';

  const rangoHoras = `${formatHora12(apertura)} - ${formatHora12(cierre)}`;
  const laborables = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const tieneLaborables = laborables.every(d => dias.includes(d));
  const tieneSab = dias.includes('Sáb');
  const tieneDom = dias.includes('Dom');

  if (dias.length === 7) {
    return `Todos los días: ${rangoHoras}`;
  }
  if (tieneLaborables && tieneSab && !tieneDom) {
    return `Lun a Sáb: ${rangoHoras} (Dom: Cerrado)`;
  }
  if (tieneLaborables && !tieneSab && !tieneDom) {
    return `Lun a Vie: ${rangoHoras} (Sáb y Dom: Cerrado)`;
  }

  return `${dias.join(', ')}: ${rangoHoras}`;
}

function formatRedesString(socials: { instagram: string; tiktok: string; facebook: string }): string {
  const parts: string[] = [];
  if (socials.instagram.trim()) {
    const handle = socials.instagram.trim().replace(/^@/, '');
    parts.push(`Instagram: @${handle}`);
  }
  if (socials.tiktok.trim()) {
    const handle = socials.tiktok.trim().replace(/^@/, '');
    parts.push(`TikTok: @${handle}`);
  }
  if (socials.facebook.trim()) {
    const fb = socials.facebook.trim();
    parts.push(`Facebook: ${fb}`);
  }
  return parts.join(' • ');
}

export default function Onboarding() {
  const [step, setStep] = useState<'selection' | 'usuario_form' | 'refugio_form' | 'success'>('selection');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth, setUser, user } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [bio, setBio] = useState(user?.bio || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [foto, setFoto] = useState<File | null>(null);

  // Sync if user loads later
  useEffect(() => {
    if (user) {
      if (!bio && user.bio) setBio(user.bio);
      if (!telefono && user.telefono) setTelefono(user.telefono);
    }
  }, [user]);

  // Refugio extra states
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Social media interactive states
  const [socials, setSocials] = useState({
    instagram: '',
    tiktok: '',
    facebook: '',
  });
  const [activeSocial, setActiveSocial] = useState({
    instagram: false,
    tiktok: false,
    facebook: false,
  });

  // Schedule interactive calendar states
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
  const [horaApertura, setHoraApertura] = useState('09:00');
  const [horaCierre, setHoraCierre] = useState('18:00');
  const [modoManualHorario, setModoManualHorario] = useState(false);
  const [horarioManual, setHorarioManual] = useState('');
  
  // Refugio files
  const [logo, setLogo] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [certificado, setCertificado] = useState<File | null>(null);
  const [docRep, setDocRep] = useState<File | null>(null);
  const [fotosLugar, setFotosLugar] = useState<File[]>([]);
  const fotosLugarInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = telefono.replace(/\D/g, '');
    if (!telefono.trim() || digitsOnly.length !== 10) {
      showToast('El teléfono debe tener exactamente 10 dígitos numéricos (ej: 3001234567).', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('telefono', telefono.trim());
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/onboarding/usuario', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('pawtok_user', JSON.stringify(updatedUser));
        await checkAuth();
        showToast('¡Perfil completado exitosamente!', 'success');
        setStep('success');
      } else {
        showToast('Error al guardar el perfil.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al guardar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefugio = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = telefono.replace(/\D/g, '');
    if (!telefono.trim() || digitsOnly.length !== 10) {
      showToast('El teléfono de contacto debe tener exactamente 10 dígitos numéricos (ej: 3001234567).', 'error');
      return;
    }
    if (!ciudad.trim()) {
      showToast('Por favor, ingresa la ciudad del refugio.', 'error');
      return;
    }
    if (!direccion.trim()) {
      showToast('Por favor, ingresa la dirección completa.', 'error');
      return;
    }
    if (!certificado) {
      showToast('Por favor, sube el certificado o registro legal en formato PDF.', 'error');
      return;
    }
    if (!docRep) {
      showToast('Por favor, sube el documento del representante legal en formato PDF.', 'error');
      return;
    }
    if (!fotosLugar || fotosLugar.length === 0) {
      showToast('Por favor, sube al menos una foto del lugar.', 'error');
      return;
    }

    const horarioFinal = calcularHorarioString(diasSeleccionados, horaApertura, horaCierre, horarioManual, modoManualHorario);
    const redesFinal = formatRedesString(socials);
    const finalNombre = (user?.nombre || '').trim();
    const finalEmail = (user?.email || '').trim();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', finalNombre);
      formData.append('direccion', direccion.trim());
      formData.append('ciudad', ciudad.trim());
      formData.append('telefono', telefono.trim());
      formData.append('email', finalEmail);
      formData.append('descripcion', descripcion.trim());
      formData.append('redesSociales', redesFinal);
      formData.append('horario', horarioFinal);
      
      if (logo) formData.append('logo', logo);
      if (certificado) formData.append('certificado', certificado);
      if (docRep) formData.append('documentoRepresentante', docRep);
      fotosLugar.forEach((f: File) => formData.append('fotosLugar', f));

      const res = await fetch('/api/onboarding/refugio', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        await checkAuth();
        showToast('Solicitud enviada para revisión.', 'success');
        setStep('success-refugio');
      } else {
        showToast('Error al enviar la solicitud del refugio.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al enviar la solicitud.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0B84FF]/10 file:text-[#0B84FF] hover:file:bg-[#0B84FF]/20 transition-colors cursor-pointer";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1 mt-4";
  const inputClass = "w-full bg-white/50 border border-white focus:border-[#0B84FF] focus:ring-4 focus:ring-[#0B84FF]/10 outline-none rounded-2xl px-4 py-3 text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#3f92ff] selection:text-black flex items-center justify-center relative py-12">
      {/* Background Image Layer with Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.png" alt="" className="w-full h-full object-cover opacity-70" />
        <div
          className="absolute inset-0"
          style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        />
        <div className="absolute inset-0 bg-white/40" />
      </div>

      <motion.div 
        layout
        className="relative z-10 w-full max-w-2xl bg-gray-100/0 backdrop-blur-xl p-8 sm:p-10 rounded-3xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -50, filter: "blur(8px)" }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
              className="text-center"
            >
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="text-3xl font-semibold text-gray-800 mb-2"
              >
                ¡Bienvenido a Pawtok!
              </motion.h1>
              
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="text-gray-600 mb-8"
              >
                Para empezar, cuéntanos cómo usarás la plataforma.
              </motion.p>
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="grid md:grid-cols-2 gap-4"
              >
                <button 
                  onClick={() => setStep('usuario_form')}
                  className="group relative bg-white/60 hover:bg-[#0B84FF]/5 border-1 border-transparent hover:border-[#0B84FF] rounded-2xl p-6 transition-all duration-300 text-left overflow-hidden cursor-pointer hover:scale-[1.03] hover:-rotate-1"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-[#0B84FF]" />
                  </div>
                  <div className="w-12 h-12 bg-[#0B84FF]/10 rounded-full flex items-center justify-center mb-4 text-[#0B84FF]">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Quiero Adoptar</h3>
                  <p className="text-sm text-gray-500">Busco darle un hogar a una mascota y quiero ver los perfiles disponibles.</p>
                </button>

                <button 
                  onClick={() => setStep('refugio_form')}
                  className="group relative bg-white/60 hover:bg-[#0B84FF]/5 border-1 border-transparent hover:border-[#0B84FF] rounded-2xl p-6 transition-all duration-300 text-left overflow-hidden cursor-pointer hover:scale-[1.03] hover:rotate-1"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-[#0B84FF]" />
                  </div>
                  <div className="w-12 h-12 bg-[#0B84FF]/10 rounded-full flex items-center justify-center mb-4 text-[#0B84FF]">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Soy un Refugio</h3>
                  <p className="text-sm text-gray-500">Represento a una organización y quiero publicar mascotas para adopción.</p>
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 'usuario_form' && (
            <motion.div
              key="usuario_form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Completa tu perfil</h2>
              <form onSubmit={handleSubmitUsuario} className="space-y-4">
                <div>
                  <label className={labelClass}>Biografía (Bio)</label>
                  <textarea rows={3} className={inputClass} value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos un poco sobre ti y por qué quieres adoptar..." />
                </div>
                <div>
                  <label className={labelClass}>
                    Teléfono de contacto <span className="text-[#0B84FF] text-xs font-normal">(obligatorio para adoptar)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className={inputClass}
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Ej. 3001234567"
                  />
                </div>
                <div>
                  <label className={labelClass}>Foto de perfil (Opcional)</label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="w-16 h-16 border border-slate-200">
                      {foto && <AvatarImage src={URL.createObjectURL(foto)} alt="Preview" className="object-cover" />}
                      <AvatarFallback>
                        <User className="text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <input type="file" accept="image/*" className={fileInputClass} onChange={e => setFoto(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="mt-10 pt-6 flex gap-3">
                  <button type="button" onClick={() => setStep('selection')} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-white/50 transition-colors cursor-pointer">Atrás</button>
                  <button type="submit" disabled={loading} className="flex-1 relative bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-[0.98] py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? 'Guardando...' : 'Guardar y Continuar'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'refugio_form' && (
            <motion.div
              key="refugio_form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Registro de Refugio</h2>
              <p className="text-slate-500 mb-6 text-sm">Por seguridad, todas las cuentas de refugios deben ser verificadas por un administrador antes de poder publicar mascotas.</p>
              
              <form onSubmit={handleSubmitRefugio} className="space-y-4">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-2">Información Básica</h3>
                  
                  {/* Tarjeta con Avatar Interactivo para Foto */}
                  <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/60 border border-blue-100/90 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar interactivo: al pasar por el círculo deja poner la foto */}
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#0B84FF] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group focus:outline-none shrink-0"
                        title="Haz clic para seleccionar foto de perfil o logo"
                      >
                        {logo ? (
                          <img src={URL.createObjectURL(logo)} alt="Logo Refugio" className="w-full h-full object-cover" />
                        ) : user?.foto ? (
                          <img src={user.foto} alt={user?.nombre || 'Foto de perfil'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {user?.nombre?.charAt(0)?.toUpperCase() || 'R'}
                          </span>
                        )}

                        {/* Overlay con icono de cámara al pasar el mouse por el círculo */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Camera className="w-5 h-5" />
                        </div>
                      </button>

                      {/* Datos del usuario limpios */}
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-800 truncate">{user?.nombre || 'Usuario Registrado'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        {logo && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogo(null);
                              if (logoInputRef.current) logoInputRef.current.value = '';
                            }}
                            className="text-[11px] text-red-500 hover:underline cursor-pointer mt-0.5 block"
                          >
                            Quitar foto
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Input de archivo oculto para el avatar */}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setLogo(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de contacto</label>
                      <input 
                        required 
                        type="tel" 
                        maxLength={10} 
                        className={inputClass} 
                        value={telefono} 
                        onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        placeholder="Ej. 3001234567" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                      <input required type="text" className={inputClass} value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ej. Medellín, Bogotá..." />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dirección completa</label>
                      <input required type="text" className={inputClass} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej. Calle 10 # 25-40, Barrio San Carlos" />

                      {/* Mapa de Google Maps con la dirección */}
                      {direccion.trim() ? (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-xs h-56 relative bg-slate-100">
                          <iframe
                            src={`https://www.google.com/maps?q=${encodeURIComponent([direccion.trim(), ciudad.trim()].filter(Boolean).join(', '))}&output=embed`}
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación en Google Maps"
                          />
                          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-md border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
                            <MapPin className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
                            <span className="truncate max-w-[280px] sm:max-w-[420px]">
                              {[direccion.trim(), ciudad.trim()].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>Escribe la dirección para visualizarla en Google Maps</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-2">Detalles Públicos</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Refugio</label>
                    <textarea required rows={3} className={inputClass} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Misión, historia, cuántos animales rescatan, etc." />
                  </div>

                  {/* Redes Sociales con Botones Dinámicos */}
                  <div className="mt-5 pt-4 border-t border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Redes Sociales</label>
                        <p className="text-xs text-slate-400">Pulsa los botones para agregar tus cuentas oficiales</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {/* Botón Instagram */}
                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, instagram: !prev.instagram }))}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.instagram
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-sm scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-pink-300'
                        }`}
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                        {activeSocial.instagram ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] opacity-70">+</span>}
                      </button>

                      {/* Botón TikTok */}
                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, tiktok: !prev.tiktok }))}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.tiktok
                            ? 'bg-slate-900 text-white shadow-sm scale-[1.02] border border-slate-900'
                            : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <TikTokIcon className="w-3.5 h-3.5" />
                        TikTok
                        {activeSocial.tiktok ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] opacity-70">+</span>}
                      </button>

                      {/* Botón Facebook */}
                      <button
                        type="button"
                        onClick={() => setActiveSocial(prev => ({ ...prev, facebook: !prev.facebook }))}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSocial.facebook
                            ? 'bg-[#1877F2] text-white shadow-sm scale-[1.02]'
                            : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                        {activeSocial.facebook ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] opacity-70">+</span>}
                      </button>
                    </div>

                    {/* Inputs de Redes Sociales Activas */}
                    <div className="space-y-2.5">
                      {activeSocial.instagram && (
                        <div className="flex items-center gap-2 bg-white/70 border border-pink-200/70 p-1.5 px-3 rounded-2xl">
                          <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-400">@</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none"
                            placeholder="usuario_en_instagram"
                            value={socials.instagram}
                            onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, instagram: false }));
                              setSocials(prev => ({ ...prev, instagram: '' }));
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar Instagram"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeSocial.tiktok && (
                        <div className="flex items-center gap-2 bg-white/70 border border-slate-300 p-1.5 px-3 rounded-2xl">
                          <TikTokIcon className="w-4 h-4 text-slate-900 shrink-0" />
                          <span className="text-xs font-medium text-slate-400">@</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none"
                            placeholder="usuario_en_tiktok"
                            value={socials.tiktok}
                            onChange={e => setSocials(prev => ({ ...prev, tiktok: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, tiktok: false }));
                              setSocials(prev => ({ ...prev, tiktok: '' }));
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar TikTok"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeSocial.facebook && (
                        <div className="flex items-center gap-2 bg-white/70 border border-blue-200/70 p-1.5 px-3 rounded-2xl">
                          <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                          <span className="text-xs font-medium text-slate-400">facebook.com/</span>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none"
                            placeholder="pagina_o_refugio"
                            value={socials.facebook}
                            onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSocial(prev => ({ ...prev, facebook: false }));
                              setSocials(prev => ({ ...prev, facebook: '' }));
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Quitar Facebook"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {!activeSocial.instagram && !activeSocial.tiktok && !activeSocial.facebook && (
                        <p className="text-xs text-slate-400 italic bg-white/40 border border-dashed border-slate-200 p-2.5 rounded-xl text-center">
                          Ninguna red social seleccionada. Toca los botones arriba para vincularlas.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Horario con Calendario Semanal Interactivo */}
                  <div className="mt-5 pt-4 border-t border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0B84FF]" />
                        <label className="block text-sm font-medium text-slate-700">Horario de Atención</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModoManualHorario(!modoManualHorario)}
                        className="text-xs text-[#0B84FF] hover:underline font-medium cursor-pointer"
                      >
                        {modoManualHorario ? 'Usar Calendario' : 'Modo texto libre'}
                      </button>
                    </div>

                    {!modoManualHorario ? (
                      <div className="space-y-3">
                        {/* Preajustes Rápidos */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] text-slate-400 mr-1">Preajustes:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
                              setHoraApertura('09:00');
                              setHoraCierre('18:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#0B84FF] text-slate-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Lun - Vie (9am-6pm)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']);
                              setHoraApertura('08:00');
                              setHoraCierre('17:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#0B84FF] text-slate-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Lun - Sáb (8am-5pm)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiasSeleccionados(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
                              setHoraApertura('08:00');
                              setHoraCierre('19:00');
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#0B84FF] text-slate-600 hover:text-[#0B84FF] transition cursor-pointer"
                          >
                            Toda la semana
                          </button>
                        </div>

                        {/* Calendario Semanal Interactivo (7 Días) */}
                        <div className="bg-white/80 p-3 rounded-2xl border border-slate-200 shadow-xs">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Días disponibles (haz clic para activar/desactivar):</p>
                          <div className="grid grid-cols-7 gap-1.5">
                            {DIAS_SEMANA.map(dia => {
                              const activo = diasSeleccionados.includes(dia.id);
                              return (
                                <button
                                  key={dia.id}
                                  type="button"
                                  onClick={() => {
                                    if (activo) {
                                      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia.id));
                                    } else {
                                      const order = DIAS_SEMANA.map(d => d.id);
                                      const next = [...diasSeleccionados, dia.id].sort((a, b) => order.indexOf(a) - order.indexOf(b));
                                      setDiasSeleccionados(next);
                                    }
                                  }}
                                  className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                                    activo
                                      ? 'bg-[#0B84FF] text-white shadow-sm scale-[1.03]'
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200/80 border border-slate-200/60 font-medium'
                                  }`}
                                >
                                  {dia.id}
                                </button>
                              );
                            })}
                          </div>

                          {/* Horas de Apertura y Cierre */}
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hora de Apertura</label>
                              <div className="relative flex items-center">
                                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                                <input
                                  type="time"
                                  className="w-full bg-white border border-slate-200 focus:border-[#0B84FF] rounded-xl pl-8 pr-2 py-1.5 text-xs sm:text-sm text-slate-700 outline-none"
                                  value={horaApertura}
                                  onChange={e => setHoraApertura(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hora de Cierre</label>
                              <div className="relative flex items-center">
                                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                                <input
                                  type="time"
                                  className="w-full bg-white border border-slate-200 focus:border-[#0B84FF] rounded-xl pl-8 pr-2 py-1.5 text-xs sm:text-sm text-slate-700 outline-none"
                                  value={horaCierre}
                                  onChange={e => setHoraCierre(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Previsualización del Horario Resultante */}
                        <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-xl text-xs text-blue-900">
                          <Clock className="w-3.5 h-3.5 text-[#0B84FF] shrink-0" />
                          <span className="font-semibold text-[#0B84FF]">Horario configurado:</span>
                          <span className="truncate">{calcularHorarioString(diasSeleccionados, horaApertura, horaCierre, '', false)}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          className={inputClass}
                          value={horarioManual}
                          onChange={e => setHorarioManual(e.target.value)}
                          placeholder="Ej: Lunes a Viernes 9:00 AM - 5:00 PM previa cita"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Escribe tu horario en formato libre si tienes especificaciones particulares.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5" />
                    Documentación Requerida
                  </h3>
                  <p className="text-xs text-amber-700 mb-4">Estos documentos son privados y solo se usarán para verificar la autenticidad del refugio.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Logo del Refugio (Opcional)</label>
                      {logo ? (
                        <div className="flex items-center gap-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                          <img src={URL.createObjectURL(logo)} alt="Logo Preview" className="w-10 h-10 rounded-xl object-cover border border-blue-200 shadow-xs" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{logo.name}</p>
                            <p className="text-[11px] text-emerald-600 font-medium">✓ Foto o logo vinculado</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLogo(null);
                              if (logoInputRef.current) logoInputRef.current.value = '';
                            }}
                            className="text-xs text-red-500 hover:underline px-2 py-1 cursor-pointer font-medium"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <input type="file" accept="image/*" className={fileInputClass} onChange={e => setLogo(e.target.files?.[0] || null)} />
                      )}
                    </div>
                    {/* Certificado (Solo PDF) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">
                          Certificado o registro legal del refugio <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Solo PDF
                        </span>
                      </div>
                      {certificado ? (
                        <div className="flex items-center gap-3 p-2.5 bg-red-50/60 border border-red-200/80 rounded-2xl">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{certificado.name}</p>
                            <p className="text-[10px] text-slate-500">{(certificado.size / 1024).toFixed(0)} KB • Archivo PDF</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCertificado(null)}
                            className="text-xs text-red-500 hover:underline px-2 py-1 cursor-pointer font-medium"
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <input
                          required
                          type="file"
                          accept="application/pdf,.pdf"
                          className={fileInputClass}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              if (!f.type.includes('pdf') && !f.name.toLowerCase().endsWith('.pdf')) {
                                showToast('Solo se permiten archivos en formato PDF.', 'error');
                                e.target.value = '';
                                setCertificado(null);
                                return;
                              }
                              setCertificado(f);
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Documento Representante (Solo PDF) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">
                          Documento del representante legal <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Solo PDF
                        </span>
                      </div>
                      {docRep ? (
                        <div className="flex items-center gap-3 p-2.5 bg-red-50/60 border border-red-200/80 rounded-2xl">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{docRep.name}</p>
                            <p className="text-[10px] text-slate-500">{(docRep.size / 1024).toFixed(0)} KB • Archivo PDF</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDocRep(null)}
                            className="text-xs text-red-500 hover:underline px-2 py-1 cursor-pointer font-medium"
                          >
                            Cambiar
                          </button>
                        </div>
                      ) : (
                        <input
                          required
                          type="file"
                          accept="application/pdf,.pdf"
                          className={fileInputClass}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              if (!f.type.includes('pdf') && !f.name.toLowerCase().endsWith('.pdf')) {
                                showToast('Solo se permiten archivos en formato PDF.', 'error');
                                e.target.value = '';
                                setDocRep(null);
                                return;
                              }
                              setDocRep(f);
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Fotos del lugar (Solo imágenes con botón + para agregar más) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">
                          Fotos del lugar <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Input de archivo oculto para anexar imágenes a la lista */}
                      <input
                        ref={fotosLugarInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          const validImages = files.filter(f => f.type.startsWith('image/'));
                          if (validImages.length < files.length) {
                            showToast('Algunos archivos no eran imágenes y se descartaron.', 'error');
                          }
                          if (validImages.length > 0) {
                            setFotosLugar(prev => [...prev, ...validImages]);
                          }
                          e.target.value = '';
                        }}
                      />

                      {fotosLugar.length === 0 ? (
                        <div
                          onClick={() => fotosLugarInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 hover:border-[#0B84FF] bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B84FF] flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Elegir fotos del lugar</p>
                            <p className="text-xs text-slate-400">Puedes subir varias fotos (JPG, PNG, WEBP)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-2 bg-slate-100/60 rounded-2xl border border-slate-200/80">
                            {fotosLugar.map((foto, index) => (
                              <div key={index} className="relative group/foto aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                                <img src={URL.createObjectURL(foto)} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFotosLugar(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"
                                  title="Eliminar foto"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {/* Botón '+' adicional dentro de la cuadrícula para añadir más */}
                            <button
                              type="button"
                              onClick={() => fotosLugarInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-blue-300 hover:border-[#0B84FF] bg-blue-50/50 hover:bg-blue-100/50 flex flex-col items-center justify-center text-[#0B84FF] transition cursor-pointer active:scale-95"
                              title="Agregar otra foto"
                            >
                              <Plus className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-bold">Más fotos</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {fotosLugar.length} {fotosLugar.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}. Toca en <span className="font-semibold text-[#0B84FF]">+</span> para añadir más fotos.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 flex gap-3">
                  <button type="button" onClick={() => setStep('selection')} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">Atrás</button>
                  <button type="submit" disabled={loading} className="flex-1 relative bg-[#0B84FF] text-white hover:bg-[#157def] active:scale-[0.98] py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Todo listo!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                Tu perfil se ha configurado correctamente. Ya puedes comenzar a usar Pawtok.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button 
                  onClick={() => navigate('/cuenta')}
                  className="bg-[#0B84FF] text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
                >
                  Ver mi información
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-slate-100 text-slate-700 px-8 py-3 rounded-full font-medium hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Ir al inicio
                </button>
              </div>
            </motion.div>
          )}
          {step === 'success-refugio' && (
            <motion.div
              key="success-refugio"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-blue-100 text-[#0B84FF] rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Solicitud Enviada!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                Hemos recibido tu solicitud y los documentos de tu refugio. Un administrador revisará tu información pronto. Una vez aprobada, tu cuenta se activará como Refugio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button 
                  onClick={() => navigate('/refugio')}
                  className="bg-[#0B84FF] text-white px-8 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
                >
                  Ver estado de mi solicitud
                </button>
                <button 
                  onClick={() => navigate('/refugio')}
                  className="bg-slate-100 text-slate-700 px-8 py-3 rounded-full font-medium hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Ir al panel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
