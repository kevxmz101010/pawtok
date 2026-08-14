import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurFade } from '../components/ui/blur-fade';
import { ChevronLeft, ImagePlus, UploadCloud, X, Crop as CropIcon, AlertCircle, Plus, FileText, CheckCircle2, ShieldCheck, Trash2, Syringe, Bug } from 'lucide-react';
import Header from '../components/Header';
import FullscreenToast from '../components/FullscreenToast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { RainbowButton } from '../components/ui/rainbow-button';
import { HeadlessListbox } from '../components/ui/headless-listbox';
import { DatePicker } from '../components/ui/date-picker';
import { AnimatedCheckbox } from '../components/ui/animated-checkbox';
import { useAuth } from '../context/AuthContext';

const PERSONALITY_OPTIONS = [
  "Cariñoso", "Juguetón", "Inteligente", "Tranquilo", "Protector", 
  "Sociable", "Amigable", "Curioso", "Leal", "Obediente", 
  "Activo", "Dulce", "Independiente", "Tierno", "Paciente", 
  "Energético", "Noble", "Dormilón", "Alegre", "Extrovertido", 
  "Reservado", "Valiente", "Compañero", "Adaptable"
];

export default function AddPet() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Medical History State
  const [medicalRecords, setMedicalRecords] = useState<Array<{ fecha: string; descripcion: string; vacuna: boolean; desparasitacion: boolean }>>([]);
  const [newMedFecha, setNewMedFecha] = useState(new Date().toISOString().split('T')[0]);
  const [newMedDesc, setNewMedDesc] = useState('');
  const [newMedVacuna, setNewMedVacuna] = useState(false);
  const [newMedDesparasitacion, setNewMedDesparasitacion] = useState(false);

  const handleAddMedicalRecord = () => {
    if (!newMedDesc.trim()) {
      showToast('Ingresa una descripción para el registro médico.', 'error');
      return;
    }
    setMedicalRecords(prev => [
      ...prev,
      {
        fecha: newMedFecha,
        descripcion: newMedDesc.trim(),
        vacuna: newMedVacuna,
        desparasitacion: newMedDesparasitacion
      }
    ]);
    setNewMedDesc('');
    setNewMedVacuna(false);
    setNewMedDesparasitacion(false);
    showToast('Registro médico agregado a la lista', 'success');
  };

  const handleRemoveMedicalRecord = (index: number) => {
    setMedicalRecords(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { returnUrl: '/dashboard/add-pet' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Combobox States
  const [tipo, setTipo] = useState("Perro");
  const [origen, setOrigen] = useState("Refugio");
  const [tamano, setTamano] = useState("Pequeño");
  const [energia, setEnergia] = useState("Medio");
  const [conNinos, setConNinos] = useState("Sí");
  const [unidadEdad, setUnidadEdad] = useState("Meses");

  // Cropper State
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (tempImage && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
        setCoverPreview(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
    setIsCropping(false);
    setTempImage(null);
  };

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación: Rechazar PDF y archivos no imágenes
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || !file.type.startsWith('image/')) {
      setError('Formato no permitido: No se aceptan archivos PDF ni documentos. Sube solo imágenes (JPG, PNG, WEBP).');
      showToast('No se permiten archivos PDF. Solo imágenes.', 'error');
      e.target.value = '';
      return;
    }

    // Validación: Rechazar archivos mayores a 3MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`El archivo "${file.name}" pesa ${sizeMB}MB y supera el límite máximo permitido de 3MB.`);
      showToast('La imagen supera el límite máximo de 3MB.', 'error');
      e.target.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImage(event.target?.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    let hasPdf = false;
    let hasTooLarge = false;
    let addedCount = 0;

    files.forEach((file: File) => {
      // Rechazo de PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || !file.type.startsWith('image/')) {
        hasPdf = true;
        return;
      }
      // Rechazo > 3MB
      if (file.size > MAX_FILE_SIZE) {
        hasTooLarge = true;
        return;
      }

      addedCount++;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGalleryPreviews((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (hasPdf) {
      setError('Formato no permitido: Se rechazaron archivos PDF. Solo se admiten imágenes (JPG, PNG, WEBP).');
      showToast('Se rechazaron archivos PDF.', 'error');
    } else if (hasTooLarge) {
      setError('Una o más fotos superan el límite de 3MB y fueron rechazadas.');
      showToast('Algunas fotos superan los 3MB.', 'error');
    } else if (addedCount > 0) {
      setError('');
    }

    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePersonality = (trait: string) => {
    setSelectedPersonalities((prev) => 
      prev.includes(trait) 
        ? prev.filter((t) => t !== trait)
        : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    
    const nombre = formData.get('nombre')?.toString().trim();
    const raza = formData.get('raza')?.toString().trim();
    const edad = formData.get('edad')?.toString().trim();
    const ubicacion = formData.get('ubicacion')?.toString().trim();
    const peso = formData.get('peso')?.toString().trim();
    const descripcion = formData.get('descripcion')?.toString().trim();

    if (!coverPreview) {
      setError('Debes subir al menos la foto principal de la portada.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!nombre) {
      setError('Por favor, ingresa el nombre de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!raza) {
      setError('Por favor, ingresa la raza de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!edad) {
      setError('Por favor, ingresa la edad de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!ubicacion) {
      setError('Por favor, ingresa la ubicación de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!peso) {
      setError('Por favor, ingresa el peso de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (selectedPersonalities.length === 0) {
      setError('Por favor, selecciona al menos una cualidad de personalidad.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!descripcion) {
      setError('Por favor, escribe una historia o descripción de la mascota.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    // Construct payload
    const payload = {
      nombre,
      tipo: tipo.toLowerCase(),
      raza,
      edad: edad.replace(/\D/g, '') + ' ' + unidadEdad.toLowerCase(),
      ubicacion,
      peso,
      tamano: tamano,
      energia: energia,
      conNinos: conNinos,
      origen: origen.toLowerCase(),
      personalidad: selectedPersonalities.join(','),
      descripcion,
      imagenUrl: coverPreview,
      galeria: galleryPreviews,
      categoria: tipo.toUpperCase()
    };

    try {
      const res = await fetch('/api/mascotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedPet = await res.json();
        
        // Guardar registros médicos en base de datos si fueron añadidos
        if (savedPet?.id && medicalRecords.length > 0) {
          for (const rec of medicalRecords) {
            try {
              await fetch(`/api/mascotas/${savedPet.id}/historial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(rec)
              });
            } catch (errMed) {
              console.error('Error al guardar historial médico:', errMed);
            }
          }
        }

        showToast('¡Mascota publicada con éxito!', 'success');
        setTimeout(() => {
          navigate('/refugio');
        }, 1500);
      } else {
        setError('Ocurrió un error al publicar la mascota en el servidor.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-[#0B84FF]/20 font-inter text-gray-800">
      <Header onShowToast={() => {}} onSelectDrop={() => {}} searchQuery="" setSearchQuery={() => {}} />


      {/* Cropper Modal */}
      {isCropping && tempImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <style>{`
            .reactEasyCrop_CropArea {
              border-radius: 2rem !important;
              border: 2px solid rgba(255, 255, 255, 0.8) !important;
            }
          `}</style>
          <div className="relative w-full max-w-2xl h-[70vh] bg-gray-900 rounded-[2rem] overflow-hidden">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button 
              type="button"
              onClick={() => setIsCropping(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleCropSave}
              className="px-8 py-3 bg-[#0B84FF] hover:bg-[#157def] text-white rounded-full font-bold transition-colors flex items-center gap-2"
            >
              <CropIcon className="w-5 h-5" />
              Recortar y Guardar
            </button>
          </div>
        </div>
      )}

      <main className="pt-[100px] pb-24 max-w-4xl mx-auto px-6">
        <BlurFade delay={0.1} inView>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0B84FF] transition-colors font-medium mb-8 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
        </BlurFade>

        <BlurFade delay={0.2} inView className="mb-10">
          <h1 className="text-1xl md:text-4xl font-semibold tracking-tight text-gray-900">Nueva publicación</h1>
          <p className="text-gray-500 mt-1 max-w-96 text-base font-medium">Agrega una mascota con varias fotos y una ficha completa para que destaque.</p>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <form onSubmit={handleSubmit} noValidate className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(11,132,255,0.08)] border border-white p-8 md:p-10 space-y-12">
            
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 bg-red-50/90 border border-red-200 text-red-600 text-sm font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FOTO PRINCIPAL */}
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Foto principal</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Esta será la imagen de portada que verán todos.</p>
              </div>

              <div className="text-center flex flex-col items-center">
                <label className="relative inline-block cursor-pointer group">
                  <div className={`relative w-48 h-48 rounded-[2rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all shadow-sm ${coverPreview ? 'border-transparent' : 'border-gray-300 bg-gray-50 hover:border-[#0B84FF]'}`}>
                    {!coverPreview ? (
                      <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-[#0B84FF] transition-colors" />
                    ) : (
                      <img src={coverPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="block mt-4 text-sm text-[#0B84FF] font-bold hover:text-[#157def]">
                    {coverPreview ? 'Cambiar portada' : 'Subir portada'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              </div>
            </section>

            {/* GALERÍA */}
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Galería de imágenes</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Sube varias fotos para mostrar mejor a la mascota en acción.</p>
              </div>

              <label className="block cursor-pointer">
                <div className="w-full rounded-[1.5rem] border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#0B84FF] hover:bg-blue-50/40 transition-all p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                      <ImagePlus className="w-6 h-6 text-[#0B84FF]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Agregar varias imágenes</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">Soporta JPG, PNG o WEBP</p>
                    </div>
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" multiple onChange={handleGalleryChange} />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative rounded-[1.5rem] overflow-hidden border border-gray-200 bg-white shadow-sm group aspect-square">
                      <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={`Galeria ${idx}`} />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 backdrop-blur-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* INFO BÁSICA */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Información básica</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Completa la ficha principal de la mascota.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                  <input name="nombre" type="text" required className="w-full px-5 py-3.5 rounded-[1rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium" placeholder="Ej. Firulais" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                  <HeadlessListbox 
                    options={["Perro", "Gato", "Otro"]} 
                    value={tipo} 
                    onChange={setTipo} 
                    placeholder="Selecciona el tipo" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Raza</label>
                  <input name="raza" type="text" className="w-full px-5 py-3.5 rounded-[1rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium" placeholder="Ej. Mestizo, Persa..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Edad</label>
                  <div className="flex gap-2">
                    <input name="edad" type="number" min="0" required className="w-1/2 px-5 py-3.5 rounded-[1rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium" placeholder="Ej. 24" />
                    <div className="w-1/2">
                      <HeadlessListbox 
                        options={["Meses", "Años"]} 
                        value={unidadEdad} 
                        onChange={setUnidadEdad} 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ubicación</label>
                  <input name="ubicacion" type="text" required className="w-full px-5 py-3.5 rounded-[1rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium" placeholder="Ej. Medellín" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg)</label>
                  <input name="peso" type="number" min="0" step="0.1" required className="w-full px-5 py-3.5 rounded-[1rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium" placeholder="Ej. 12.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Origen</label>
                  <HeadlessListbox 
                    options={["Refugio", "Rescatista", "Entrega responsable"]} 
                    value={origen} 
                    onChange={setOrigen} 
                    placeholder="Selecciona el origen" 
                  />
                </div>
              </div>
            </section>

            {/* DETALLES DE ADOPCIÓN */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalles de adopción</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Filtros útiles para que las familias encuentren su mascota ideal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-blue-50/60 p-6 md:p-8 rounded-[1.5rem] border border-blue-100/50">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tamaño</label>
                  <HeadlessListbox 
                    options={["Pequeño", "Mediano", "Grande"]} 
                    value={tamano} 
                    onChange={setTamano} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nivel de energía</label>
                  <HeadlessListbox 
                    options={["Bajo", "Medio", "Alto"]} 
                    value={energia} 
                    onChange={setEnergia} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">¿Apto para niños?</label>
                  <HeadlessListbox 
                    options={["Sí", "No"]} 
                    value={conNinos} 
                    onChange={setConNinos} 
                  />
                </div>
              </div>
            </section>

            {/* PERSONALIDAD */}
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personalidad y cualidades</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Selecciona todas las que apliquen para describir su carácter.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {PERSONALITY_OPTIONS.map((trait) => {
                  const isSelected = selectedPersonalities.includes(trait);
                  return (
                    <button
                      type="button"
                      key={trait}
                      onClick={() => togglePersonality(trait)}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-[#0B84FF] text-white border-[#0B84FF] shadow-[0_8px_16px_rgba(11,132,255,0.25)] -translate-y-0.5' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B84FF] hover:bg-blue-50'
                      }`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DESCRIPCIÓN */}
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historia o descripción</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Cuenta lo que la hace especial o cualquier detalle de salud importante.</p>
              </div>
              <textarea 
                name="descripcion"
                rows={5} 
                placeholder="Escribe aquí su historia..."
                className="w-full px-5 py-4 rounded-[1.5rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all resize-none font-medium text-gray-700 leading-relaxed"
              ></textarea>
            </section>

            {/* HISTORIAL MÉDICO Y VACUNACIÓN INICIAL (OPCIONAL) */}
            <section className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Historial Médico y Vacunación</h2>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-[#0B84FF] text-xs font-bold rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Registra vacunas, desparasitaciones o diagnósticos médicos para que aparezcan en el perfil público de la mascota.
                  </p>
                </div>
                <span className="px- py-1  text-green-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> Registro Clínico Oficial
                </span>
              </div>

              {/* FORMULARIO AGREGAR REGISTRO */}
              <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-1/3">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Fecha</label>
                    <DatePicker 
                      value={newMedFecha} 
                      onChange={setNewMedFecha}
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                  <div className="sm:w-2/3 flex flex-wrap items-center gap-3 pt-2 sm:pt-6">
                    <AnimatedCheckbox 
                      checked={newMedVacuna} 
                      onChange={setNewMedVacuna} 
                      label="¿Es Vacuna?"
                      activeColor="blue"
                    />
                    <AnimatedCheckbox 
                      checked={newMedDesparasitacion} 
                      onChange={setNewMedDesparasitacion} 
                      label="¿Es Desparasitación?"
                      activeColor="purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Descripción / Tratamiento / Vacuna</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={newMedDesc} 
                      onChange={(e) => setNewMedDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMedicalRecord();
                        }
                      }}
                      placeholder="Ej. Vacuna Séxtuple / Desparasitación interna al día..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#0B84FF] outline-none"
                    />
                    <motion.button 
                      type="button" 
                      whileHover="hover"
                      whileTap={{ scale: 0.94 }}
                      onClick={handleAddMedicalRecord}
                      className="px-5 py-2.5 bg-[#abd5ff] hover:bg-[#97cbff] text-blue-900 text-sm font-bold rounded-full shadow-inner shadow-white/80 transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <motion.span
                        variants={{
                          hover: { rotate: 180, scale: 1.15 }
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="inline-flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </motion.span>
                      <span>Agregar Registro</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* LISTA DE REGISTROS AÑADIDOS */}
              {medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-gray-500 block">
                    Registros que se publicarán ({medicalRecords.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {medicalRecords.map((rec, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-[#0B84FF]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B84FF] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMedicalRecord(index)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                            title="Eliminar de la lista"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                            {rec.descripcion}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-gray-400">
                            {rec.fecha}
                          </span>
                          <div className="flex items-center gap-1">
                            {rec.vacuna && (
                              <span className="px-2 py-0.5 bg-blue-50 text-[#0B84FF] font-bold rounded-md text-[10px]">
                                Vacuna
                              </span>
                            )}
                            {rec.desparasitacion && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px]">
                                Desparasitación
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gray-50/70 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                  Aún no has agregado registros médicos a esta mascota (puedes agregarlos ahora o posteriormente en la ficha de edición).
                </div>
              )}
            </section>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex flex-col items-center gap-4">
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="w-full max-w-md p-4 bg-red-50/90 border border-red-200 text-red-600 text-sm font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <RainbowButton 
                type="submit"
                className="w-fit px-12 py-6 rounded-[1.2rem] text-lg font-bold shadow-[0_10px_20px_rgba(11,132,255,0.3)]"
              >
                Publicar Mascota
              </RainbowButton>
            </div>

          </form>
        </BlurFade>
      </main>
      <FullscreenToast toast={toastMsg} />
    </div>
  );
}
