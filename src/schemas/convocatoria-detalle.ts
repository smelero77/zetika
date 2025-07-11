import { z } from 'zod';

// Esquemas auxiliares para catálogos
const InstrumentoAyudaSchema = z.object({
  descripcion: z.string().max(500).optional(),
});

const TipoBeneficiarioSchema = z.object({
  descripcion: z.string().max(500).optional(),
});

const SectorSchema = z.object({
  descripcion: z.string().max(200).optional(),
  codigo: z.string().max(10).optional(),
});

const RegionSchema = z.object({
  descripcion: z.string().max(200).optional(),
});

const FondoSchema = z.object({
  descripcion: z.string().max(200).optional(),
});

const ObjetivoSchema = z.object({
  descripcion: z.string().max(500).optional(),
});

const SectorProductoSchema = z.object({
  descripcion: z.string().max(200).optional(),
});

const ReglamentoUESchema = z.object({
  descripcion: z.string().max(500).optional(),
  autorizacion: z.number().int().positive().optional(),
});

const OrganoSchema = z.object({
  nivel1: z.string().max(200).optional(),
  nivel2: z.string().max(200).optional(),
  nivel3: z.string().max(200).optional(),
});

const DocumentoSchema = z.object({
  id: z.number().int().positive(),
  descripcion: z.string().max(500).optional(),
  nombreFic: z.string().max(255).optional(),
  long: z.number().int().positive().optional(),
  datMod: z.string().optional(), // Formato: YYYY-MM-DD
  datPublicacion: z.string().optional(), // Formato: YYYY-MM-DD
});

const AnuncioSchema = z.object({
  numAnuncio: z.number().int().positive(),
  titulo: z.string().max(1000).optional(),
  tituloLeng: z.string().max(1000).optional(),
  texto: z.string().optional(),
  url: z.string().url().max(500).optional(),
  cve: z.string().max(100).optional(),
  desDiarioOficial: z.string().max(500).optional(),
  datPublicacion: z.string().optional(),
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
  numeroConvocatoria: z.string().max(50).optional(),
  fechaPublicacion: z.string().refine(validateDate, {
    message: 'fechaPublicacion debe estar en formato YYYY-MM-DD'
  }).optional(),
  
  // Campos opcionales con validaciones
  organo: OrganoSchema.optional(),
  sedeElectronica: z.string().url().max(500).optional(),
  fechaRecepcion: z.string().refine(validateDate, {
    message: 'fechaRecepcion debe estar en formato YYYY-MM-DD'
  }).optional(),
  
  instrumentos: z.array(InstrumentoAyudaSchema).optional(),
  tipoConvocatoria: z.string().max(200).optional(),
  presupuestoTotal: z.number().positive().optional(),
  mrr: z.boolean().optional(),
  
  descripcion: z.string().max(2000).optional(),
  descripcionLeng: z.string().max(2000).optional(),
  
  tiposBeneficiarios: z.array(TipoBeneficiarioSchema).optional(),
  sectores: z.array(SectorSchema).optional(),
  regiones: z.array(RegionSchema).optional(),
  
  descripcionFinalidad: z.string().max(500).optional(),
  descripcionBasesReguladoras: z.string().max(1000).optional(),
  urlBasesReguladoras: z.string().url().max(500).optional(),
  
  sePublicaDiarioOficial: z.boolean().optional(),
  abierto: z.boolean().optional(),
  
  fechaInicioSolicitud: z.string().refine(validateDate, {
    message: 'fechaInicioSolicitud debe estar en formato YYYY-MM-DD'
  }).optional(),
  fechaFinSolicitud: z.string().refine(validateDate, {
    message: 'fechaFinSolicitud debe estar en formato YYYY-MM-DD'
  }).optional(),
  
  textInicio: z.string().max(500).optional(),
  textFin: z.string().max(500).optional(),
  
  ayudaEstado: z.string().max(100).optional(),
  urlAyudaEstado: z.string().url().max(500).optional(),
  
  fondos: z.array(FondoSchema).optional(),
  reglamento: ReglamentoUESchema.optional(),
  objetivos: z.array(ObjetivoSchema).optional(),
  sectoresProductos: z.array(SectorProductoSchema).optional(),
  
  documentos: z.array(DocumentoSchema).optional(),
  anuncios: z.array(AnuncioSchema).optional(),
  
  // Campos adicionales que pueden venir en BDNS
  advertencia: z.string().max(2000).optional(),
  estado: z.enum(['ACTIVA', 'INACTIVA', 'ANULADA', 'CANCELADA', 'DESIERTA']).optional(),
  indInactiva: z.boolean().optional(),
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