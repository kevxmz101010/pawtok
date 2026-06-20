/**
 * Normaliza y formatea URLs de imágenes de mascotas, refugios o usuarios.
 * Evita la duplicación de prefijos como /uploads//uploads/ o /uploads/uploads/
 * y soporta nombres de archivo simples, rutas relativas, URLs absolutas y Data URIs.
 */
export const formatPetImageUrl = (img?: string | null, fallback?: string): string => {
  if (!img || typeof img !== 'string' || img.trim() === '') {
    return fallback || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800';
  }

  const trimmed = img.trim();

  // Data URLs y Blob URLs se usan directamente
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // URLs externas (ej. Unsplash)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Si contiene /uploads/uploads/ duplicado accidentalmente, corregirlo
    if (trimmed.includes('/uploads/')) {
      return trimmed.replace(/\/uploads\/+uploads\//g, '/uploads/');
    }
    return trimmed;
  }

  // Extraer el nombre de archivo limpio eliminando prefijos de uploads
  const clean = trimmed.replace(/^\/?(uploads\/)+/i, '');
  const filename = clean.split('/').filter(Boolean).pop() || clean;

  return `http://localhost:8080/uploads/${filename}`;
};

/**
 * Normaliza valores booleanos o de texto para si es apto con niños ("Sí" o "No")
 */
export const formatConNinos = (val?: string | null): string => {
  if (!val) return '';
  const s = String(val).toLowerCase().trim();
  if (s.startsWith('n') || s.includes('no')) return 'No';
  return 'Sí';
};

/**
 * Limpia y normaliza texto con problemas de codificación (CP850 / Latin1 / UTF-8 residual)
 */
export const formatCleanText = (text?: string | null): string => {
  if (!text) return '';

  let cleaned = String(text);

  // Reemplazar patrones de codificación alterada en español
  cleaned = cleaned
    .replace(/Peque[±?\uFFFD]+o/gi, 'Pequeño')
    .replace(/Pequeo/gi, 'Pequeño')
    .replace(/Cari[±?\uFFFD]+oso/gi, 'Cariñoso')
    .replace(/Carioso/gi, 'Cariñoso')
    .replace(/Juguet[¾?\uFFFD]+n/gi, 'Juguetón')
    .replace(/Juguetn/gi, 'Juguetón')
    .replace(/Energ[Ú?\uFFFD]+tico/gi, 'Energético')
    .replace(/Energtico/gi, 'Energético')
    .replace(/Compa[±?\uFFFD]+ero/gi, 'Compañero')
    .replace(/Compaero/gi, 'Compañero')
    .replace(/Dormil[¾?\uFFFD]+n/gi, 'Dormilón')
    .replace(/Dormiln/gi, 'Dormilón')
    .replace(/(^|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])S[íiÝ?\uFFFD]+(?=[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]|$)/gi, (_m, p1) => p1 + 'Sí')
    .replace(/(^|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])S(?=[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]|$)/g, (_m, p1) => p1 + 'Sí')
    .replace(/±/g, 'ñ')
    .replace(/¾/g, 'ó')
    .replace(/Ú/g, 'é')
    .replace(/Ý/g, 'í')
    .replace(/í{2,}/g, 'í');

  return cleaned.trim();
};

/**
 * Formatea la edad de la mascota para incluir siempre el sufijo 'de edad'
 * Ej: '10 meses' -> '10 meses de edad'
 *     '2' -> '2 años de edad'
 */
export const formatPetAge = (edad?: string | number | null): string => {
  if (!edad) return '';
  const eStr = formatCleanText(String(edad));
  if (eStr.toLowerCase().includes('de edad')) return eStr;

  if (/^\d+$/.test(eStr)) {
    return `${eStr} años de edad`;
  }

  if (!eStr.toLowerCase().includes('año') && !eStr.toLowerCase().includes('mes')) {
    return `${eStr} años de edad`;
  }

  return `${eStr} de edad`;
};

