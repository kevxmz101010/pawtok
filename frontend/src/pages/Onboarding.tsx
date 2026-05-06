import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Home, UploadCloud, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function Onboarding() {
  const [step, setStep] = useState<'selection' | 'usuario_form' | 'refugio_form' | 'success'>('selection');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  // Form states
  const [bio, setBio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  // Refugio extra states
  const [ciudad, setCiudad] = useState('');

  // Refugio extra states
  const [nombreRefugio, setNombreRefugio] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [redes, setRedes] = useState('');
  const [horario, setHorario] = useState('');
  
  // Refugio files
  const [logo, setLogo] = useState<File | null>(null);
  const [certificado, setCertificado] = useState<File | null>(null);
  const [docRep, setDocRep] = useState<File | null>(null);
  const [fotosLugar, setFotosLugar] = useState<FileList | null>(null);

  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('telefono', telefono);
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/onboarding/usuario', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await checkAuth();
        setStep('success');
      } else {
        alert('Error al guardar el perfil.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefugio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombreRefugio);
      formData.append('direccion', direccion);
      formData.append('ciudad', ciudad);
      formData.append('telefono', telefono);
      formData.append('email', email);
      formData.append('descripcion', descripcion);
      formData.append('redesSociales', redes);
      formData.append('horario', horario);
      
      if (logo) formData.append('logo', logo);
      if (certificado) formData.append('certificado', certificado);
      if (docRep) formData.append('documentoRepresentante', docRep);
      if (fotosLugar) {
        Array.from(fotosLugar).forEach(f => formData.append('fotosLugar', f));
      }

      const res = await fetch('/api/onboarding/refugio', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await checkAuth();
        setStep('success-refugio');
      } else {
        alert('Error al enviar la solicitud del refugio.');
      }
    } catch (err) {
      console.error(err);
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
                  <label className={labelClass}>Teléfono (Opcional)</label>
                  <input type="text" className={inputClass} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej. 300 123 4567" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Refugio</label>
                      <input required type="text" className={inputClass} value={nombreRefugio} onChange={e => setNombreRefugio(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email de contacto</label>
                      <input required type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                      <input required type="text" className={inputClass} value={telefono} onChange={e => setTelefono(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                      <input required type="text" className={inputClass} value={ciudad} onChange={e => setCiudad(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dirección completa</label>
                      <input required type="text" className={inputClass} value={direccion} onChange={e => setDireccion(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <h3 className="font-semibold text-slate-700 mb-2">Detalles Públicos</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                    <textarea required rows={3} className={inputClass} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Redes Sociales (URLs)</label>
                      <input type="text" className={inputClass} value={redes} onChange={e => setRedes(e.target.value)} placeholder="Instagram, Facebook..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Horario de atención</label>
                      <input type="text" className={inputClass} value={horario} onChange={e => setHorario(e.target.value)} placeholder="Lun-Vie 9am-5pm" />
                    </div>
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
                      <input type="file" accept="image/*" className={fileInputClass} onChange={e => setLogo(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Certificado o registro legal del refugio <span className="text-red-500">*</span></label>
                      <input required type="file" accept=".pdf,image/*" className={fileInputClass} onChange={e => setCertificado(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Documento del representante legal <span className="text-red-500">*</span></label>
                      <input required type="file" accept=".pdf,image/*" className={fileInputClass} onChange={e => setDocRep(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fotos del lugar (Múltiples permitidas) <span className="text-red-500">*</span></label>
                      <input required type="file" multiple accept="image/*" className={fileInputClass} onChange={e => setFotosLugar(e.target.files || null)} />
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
              <button 
                onClick={() => navigate('/')}
                className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Ir al inicio
              </button>
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
              <button 
                onClick={() => navigate('/')}
                className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Ir al inicio
              </button>
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
