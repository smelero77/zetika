import { z } from 'zod';

// Función para validar URLs de forma más flexible
const validateOptionalUrl = (url: string | null | undefined) => {
  if (!url || url.trim() === '') return true; // Permitir vacío
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Esquemas auxiliares para catálogos
const InstrumentoAyudaSchema = z.object({
  descripcion: z.string().max(500).optional().nullable(),
});

const TipoBeneficiarioSchema = z.object({
  descripcion: z.string().max(500).optional().nullable(),
});

const SectorSchema = z.object({
  descripcion: z.string().max(200).optional().nullable(),
  codigo: z.string().max(10).optional().nullable(),
});

const RegionSchema = z.object({
  descripcion: z.string().max(200).optional().nullable(),
});

const FondoSchema = z.object({
  descripcion: z.string().max(200).optional().nullable(),
});

const ObjetivoSchema = z.object({
  descripcion: z.string().max(500).optional().nullable(),
});

const SectorProductoSchema = z.object({
  descripcion: z.string().max(200).optional().nullable(),
});

const ReglamentoUESchema = z.object({
  descripcion: z.string().max(500).optional().nullable(),
  autorizacion: z.number().int().positive().optional().nullable(),
});

const OrganoSchema = z.object({
  nivel1: z.string().max(200).optional().nullable(),
  nivel2: z.string().max(200).optional().nullable(),
  nivel3: z.string().max(200).optional().nullable(),
});

const DocumentoSchema = z.object({
  id: z.number().int().positive(),
  descripcion: z.string().max(500).optional().nullable(),
  nombreFic: z.string().max(255).optional().nullable(),
  long: z.number().int().positive().optional().nullable(),
  datMod: z.string().optional().nullable(), // Formato: YYYY-MM-DD
  datPublicacion: z.string().optional().nullable(), // Formato: YYYY-MM-DD
});

const AnuncioSchema = z.object({
  numAnuncio: z.number().int().positive(),
  titulo: z.string().max(1000).optional().nullable(),
  tituloLeng: z.string().max(1000).optional().nullable(),
  texto: z.string().optional().nullable(),
  url: z.string().max(500).refine(validateOptionalUrl, {
    message: 'url debe ser una URL válida o estar vacía'
  }).optional().nullable(),
  cve: z.string().max(100).optional().nullable(),
  desDiarioOficial: z.string().max(500).optional().nullable(),
  datPublicacion: z.string().optional().nullable(),
});

// Función para validar fechas en formato YYYY-MM-DD
const validateDate = (date: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Esquema principal ConvocatoriaDetalle
export const ConvocatoriaDetalleSchema = z.object({
  // Campos obligatorios según BDNS
  id: z.number().int().positive(),
  codigoBDNS: z.string().regex(/^\d+$/).max(20),
  
  // Campos adicionales de BDNS
  numeroConvocatoria: z.string().max(50).optional().nullable(),
  fechaPublicacion: z.string().refine(validateDate, {
    message: 'fechaPublicacion debe estar en formato YYYY-MM-DD'
  }).optional().nullable(),
  
  // Campos opcionales con validaciones
  organo: OrganoSchema.optional().nullable(),
  sedeElectronica: z.string().max(500).refine(validateOptionalUrl, {
    message: 'sedeElectronica debe ser una URL válida o estar vacía'
  }).optional().nullable(),
  fechaRecepcion: z.string().refine(validateDate, {
    message: 'fechaRecepcion debe estar en formato YYYY-MM-DD'
  }).optional().nullable(),
  
  instrumentos: z.array(InstrumentoAyudaSchema).optional(),
  tipoConvocatoria: z.string().max(200).optional().nullable(),
  presupuestoTotal: z.number().positive().optional().nullable(),
  mrr: z.boolean().optional().nullable(),
  
  descripcion: z.string().max(2000).optional().nullable(),
  descripcionLeng: z.string().max(2000).optional().nullable(),
  
  tiposBeneficiarios: z.array(TipoBeneficiarioSchema).optional(),
  sectores: z.array(SectorSchema).optional(),
  regiones: z.array(RegionSchema).optional(),
  
  descripcionFinalidad: z.string().max(500).optional().nullable(),
  descripcionBasesReguladoras: z.string().max(1000).optional().nullable(),
  urlBasesReguladoras: z.string().max(500).refine(validateOptionalUrl, {
    message: 'urlBasesReguladoras debe ser una URL válida o estar vacía'
  }).optional().nullable(),
  
  sePublicaDiarioOficial: z.boolean().optional().nullable(),
  abierto: z.boolean().optional().nullable(),
  
  fechaInicioSolicitud: z.string().refine(validateDate, {
    message: 'fechaInicioSolicitud debe estar en formato YYYY-MM-DD'
  }).optional().nullable(),
  fechaFinSolicitud: z.string().refine(validateDate, {
    message: 'fechaFinSolicitud debe estar en formato YYYY-MM-DD'
  }).optional().nullable(),
  
  textInicio: z.string().max(500).optional().nullable(),
  textFin: z.string().max(500).optional().nullable(),
  
  ayudaEstado: z.string().max(100).optional().nullable(),
  urlAyudaEstado: z.string().max(500).refine(validateOptionalUrl, {
    message: 'urlAyudaEstado debe ser una URL válida o estar vacía'
  }).optional().nullable(),
  
  fondos: z.array(FondoSchema).optional(),
  reglamento: ReglamentoUESchema.optional().nullable(),
  objetivos: z.array(ObjetivoSchema).optional(),
  sectoresProductos: z.array(SectorProductoSchema).optional(),
  
  documentos: z.array(DocumentoSchema).optional(),
  anuncios: z.array(AnuncioSchema).optional(),
  
  // Campos adicionales que pueden venir en BDNS
  advertencia: z.string().max(2000).optional().nullable(),
  estado: z.enum(['ACTIVA', 'INACTIVA', 'ANULADA', 'CANCELADA', 'DESIERTA']).optional().nullable(),
  indInactiva: z.boolean().optional().nullable(),
}).refine((data) => {
  // Validaciones de negocio
  if (data.fechaInicioSolicitud && data.fechaFinSolicitud) {
    const inicio = new Date(data.fechaInicioSolicitud);
    const fin = new Date(data.fechaFinSolicitud);
    return inicio <= fin;
  }
  return true;
}, {
  message: 'fechaInicioSolicitud debe ser anterior o igual a fechaFinSolicitud',
  path: ['fechaInicioSolicitud']
}).refine((data) => {
  // Si abierto=true, fechaFinSolicitud puede ser null
  if (data.abierto === true) {
    return true; // fechaFinSolicitud puede ser null
  }
  return true; // Para abierto=false, fechaFinSolicitud puede tener valor
}, {
  message: 'Convocatoria cerrada debe tener fechaFinSolicitud',
  path: ['fechaFinSolicitud']
});

// Tipo TypeScript derivado del esquema
export type ConvocatoriaDetalle = z.infer<typeof ConvocatoriaDetalleSchema>;

// Función para sanitizar strings antes de calcular hash
export const sanitizeString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // Colapsar múltiples espacios en uno
    .replace(/\n+/g, ' ') // Reemplazar saltos de línea con espacio
    .replace(/\t+/g, ' '); // Reemplazar tabs con espacio
};

// Función para validar y sanitizar datos de entrada
export const validateAndSanitizeConvocatoriaDetalle = (data: unknown): ConvocatoriaDetalle => {
  const validated = ConvocatoriaDetalleSchema.parse(data);
  
  // Sanitizar strings
  return {
    ...validated,
    numeroConvocatoria: sanitizeString(validated.numeroConvocatoria),
    descripcion: sanitizeString(validated.descripcion),
    descripcionLeng: sanitizeString(validated.descripcionLeng),
    descripcionFinalidad: sanitizeString(validated.descripcionFinalidad),
    descripcionBasesReguladoras: sanitizeString(validated.descripcionBasesReguladoras),
    textInicio: sanitizeString(validated.textInicio),
    textFin: sanitizeString(validated.textFin),
    ayudaEstado: sanitizeString(validated.ayudaEstado),
    advertencia: sanitizeString(validated.advertencia),
    organo: validated.organo ? {
      nivel1: sanitizeString(validated.organo.nivel1),
      nivel2: sanitizeString(validated.organo.nivel2),
      nivel3: sanitizeString(validated.organo.nivel3),
    } : undefined,
  };
}; 