import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlurFade } from '../components/ui/blur-fade';
import { ChevronLeft, ImagePlus, UploadCloud, X, Crop as CropIcon } from 'lucide-react';
import Header from '../components/Header';
import FullscreenToast from '../components/FullscreenToast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { RainbowButton } from '../components/ui/rainbow-button';
import { HeadlessListbox } from '../components/ui/headless-listbox';
import { useAuth } from '../context/AuthContext';

const PERSONALITY_OPTIONS = [
  "Cariñoso", "Juguetón", "Inteligente", "Tranquilo", "Protector", 
  "Sociable", "Amigable", "Curioso", "Leal", "Obediente", 
  "Activo", "Dulce", "Independiente", "Tierno", "Paciente", 
  "Energético", "Noble", "Dormilón", "Alegre", "Extrovertido", 
  "Reservado", "Valiente", "Compañero", "Adaptable"
];

export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/dashboard/edit-pet/${id}` } });
    }
  }, [authLoading, isAuthenticated, navigate, id]);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [petData, setPetData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/mascotas/${id}`)
        .then(res => res.json())
        .then(data => {
          setPetData(data);
          setTipo(data.tipo ? data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1) : 'Perro');
          setOrigen(data.origen ? data.origen.charAt(0).toUpperCase() + data.origen.slice(1) : 'Refugio');
          setTamano(data.tamano || 'Pequeño');
          setEnergia(data.energia || 'Medio');
          setConNinos(data.conNinos || 'Sí');
          if (data.personalidad) {
            setSelectedPersonalities(data.personalidad.split(','));
          }
          if (data.imagenUrl) {
            setCoverPreview(data.imagenUrl.startsWith('http') ? data.imagenUrl : `http://localhost:8080/uploads/${data.imagenUrl}`);
          }
          if (data.galeria && data.galeria.length > 0) {
            setGalleryPreviews(data.galeria.map((g: string) => g.startsWith('http') ? g : `http://localhost:8080/uploads/${g}`));
          }
          if (data.edad) {
            const ageStr = String(data.edad).toLowerCase();
            if (ageStr.includes('año')) setUnidadEdad("Años");
            else setUnidadEdad("Meses");
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target?.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setGalleryPreviews((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
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
    const formData = new FormData(e.currentTarget);
    
    if (!coverPreview) {
      showToast('Sube al menos la foto principal.', 'error');
      return;
    }

    // Construct payload
    const payload = {
      nombre: formData.get('nombre'),
      tipo: tipo.toLowerCase(),
      raza: formData.get('raza'),
      edad: (formData.get('edad')?.toString().replace(/\D/g, '') || '12') + ' ' + unidadEdad.toLowerCase(),
      ubicacion: formData.get('ubicacion'),
      peso: formData.get('peso'),
      tamano: tamano,
      energia: energia,
      conNinos: conNinos,
      origen: origen.toLowerCase(),
      personalidad: selectedPersonalities.join(','),
      descripcion: formData.get('descripcion'),
      imagenUrl: coverPreview,
      galeria: galleryPreviews,
      categoria: tipo.toUpperCase()
    };

    try {
      const res = await fetch(`/api/mascotas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('¡Mascota actualizada con éxito!', 'success');
        setTimeout(() => {
          navigate('/refugio');
        }, 1500);
      } else {
        showToast('Ocurrió un error al actualizar la mascota.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión.', 'error');
    }
  };

  if (!petData) return <div className="p-10 text-center">Cargando...</div>;

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
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(11,132,255,0.08)] border border-white p-8 md:p-10 space-y-12">
            
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
                  <input 
                    name="nombre"
                    type="text" 
                    defaultValue={petData?.nombre}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-bold text-gray-900"
                    placeholder="Ej. Max, Luna, Rocky..."
                  />
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
                  <input 
                    name="raza"
                    type="text" 
                    defaultValue={petData?.raza}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium text-gray-800"
                    placeholder="Ej. Golden Retriever, Mestizo..."
                  />
                </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Edad</label>
                    <div className="flex gap-2">
                      <input 
                        name="edad"
                        type="number" 
                        min="0"
                        step="1"
                        defaultValue={petData?.edad ? String(petData.edad).replace(/\D/g, '') : ''}
                        className="w-1/2 px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium text-gray-800"
                        placeholder="Ej. 24"
                      />
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
                    <input 
                      name="ubicacion"
                      type="text" 
                      defaultValue={petData?.ubicacion}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium text-gray-800"
                      placeholder="Ciudad, País"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg)</label>
                    <input 
                      name="peso"
                      type="number" 
                      min="0"
                      step="0.1"
                      defaultValue={petData?.peso}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all font-medium text-gray-800"
                      placeholder="Ej. 12.5"
                    />
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
                defaultValue={petData?.descripcion}
                placeholder="Escribe aquí su historia..."
                className="w-full px-5 py-4 rounded-[1.5rem] bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-[#0B84FF] outline-none transition-all resize-none font-medium text-gray-700 leading-relaxed"
              ></textarea>
            </section>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex justify-center">
              <RainbowButton 
                type="submit"
                className="w-fit px-12 py-6 rounded-[1.2rem] text-lg font-bold shadow-[0_10px_20px_rgba(11,132,255,0.3)]"
              >
                Actualizar Mascota
              </RainbowButton>
            </div>

          </form>
        </BlurFade>
      </main>
      <FullscreenToast toast={toastMsg} />
    </div>
  );
}
