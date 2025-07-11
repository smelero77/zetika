import { db } from '@/lib/prisma';
import { logger } from '@/server/lib/logger';

export interface CatalogResolutionResult {
  found: boolean;
  id?: number;
  needsManualReview?: boolean;
  description?: string;
}

export interface CatalogResolutionSummary {
  totalResolved: number;
  totalNotFound: number;
  needsManualReview: boolean;
  missingCatalogs: string[];
}

export class CatalogResolver {
  private static instance: CatalogResolver;
  private cache = new Map<string, number>();

  static getInstance(): CatalogResolver {
    if (!CatalogResolver.instance) {
      CatalogResolver.instance = new CatalogResolver();
    }
    return CatalogResolver.instance;
  }

  /**
   * Resuelve un catálogo específico usando métodos nativos de Prisma
   */
  private async resolveCatalogByType(
    catalogType: 'instrumentoAyuda' | 'tipoBeneficiario' | 'actividad' | 'region' | 'fondo' | 'catalogoObjetivo' | 'sectorProducto' | 'reglamentoUE' | 'organo',
    description: string,
    cacheKey: string
  ): Promise<CatalogResolutionResult> {
    if (!description?.trim()) {
      return { found: false, needsManualReview: false };
    }

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        found: true,
        id: this.cache.get(cacheKey)!,
        description: description.trim()
      };
    }

    try {
      let result: any = null;

      switch (catalogType) {
        case 'instrumentoAyuda':
          result = await db.instrumentoAyuda.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'tipoBeneficiario':
          result = await db.tipoBeneficiario.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'actividad':
          result = await db.actividad.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'region':
          result = await db.region.findFirst({
            where: {
              nombre: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'fondo':
          result = await db.fondo.findFirst({
            where: {
              nombre: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'catalogoObjetivo':
          result = await db.catalogoObjetivo.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'sectorProducto':
          result = await db.sectorProducto.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'reglamentoUE':
          result = await db.reglamentoUE.findFirst({
            where: {
              descripcion: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'organo':
          result = await db.organo.findFirst({
            where: {
              nombre: {
                equals: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;
      }

      if (result?.id) {
        this.cache.set(cacheKey, result.id);
        return {
          found: true,
          id: result.id,
          description: description.trim()
        };
      }

      // Si no se encuentra por descripción exacta, buscar por similitud
      let similarResult: any = null;

      switch (catalogType) {
        case 'instrumentoAyuda':
          similarResult = await db.instrumentoAyuda.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'tipoBeneficiario':
          similarResult = await db.tipoBeneficiario.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'actividad':
          similarResult = await db.actividad.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'region':
          similarResult = await db.region.findFirst({
            where: {
              nombre: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'fondo':
          similarResult = await db.fondo.findFirst({
            where: {
              nombre: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'catalogoObjetivo':
          similarResult = await db.catalogoObjetivo.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'sectorProducto':
          similarResult = await db.sectorProducto.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'reglamentoUE':
          similarResult = await db.reglamentoUE.findFirst({
            where: {
              descripcion: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;

        case 'organo':
          similarResult = await db.organo.findFirst({
            where: {
              nombre: {
                contains: description.trim(),
                mode: 'insensitive'
              }
            }
          });
          break;
      }

      if (similarResult?.id) {
        this.cache.set(cacheKey, similarResult.id);
        const resultDescription = similarResult.descripcion || similarResult.nombre;
        logger.warn(`Catálogo ${catalogType} resuelto por similitud: "${description}" → "${resultDescription}"`);
        return {
          found: true,
          id: similarResult.id,
          description: resultDescription
        };
      }

      return {
        found: false,
        needsManualReview: true,
        description: description.trim()
      };

    } catch (error) {
      logger.error(`Error resolviendo catálogo ${catalogType}:`, error instanceof Error ? error : new Error(String(error)));
      return {
        found: false,
        needsManualReview: true,
        description: description.trim()
      };
    }
  }

  /**
   * Resuelve múltiples catálogos de un array de descripciones
   */
  async resolveCatalogArray(
    catalogType: 'instrumentoAyuda' | 'tipoBeneficiario' | 'actividad' | 'region' | 'fondo' | 'catalogoObjetivo' | 'sectorProducto',
    descriptions: Array<{ descripcion?: string | null }>,
    catalogTypeName: string
  ): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
    const ids: number[] = [];
    const missingCatalogs: string[] = [];
    let totalResolved = 0;
    let totalNotFound = 0;

    for (const item of descriptions) {
      if (!item.descripcion?.trim()) continue;

      const cacheKey = `${catalogType}:${item.descripcion.trim().toLowerCase()}`;
      const result = await this.resolveCatalogByType(catalogType, item.descripcion, cacheKey);

      if (result.found && result.id) {
        ids.push(result.id);
        totalResolved++;
      } else {
        totalNotFound++;
        if (result.description) {
          missingCatalogs.push(`${catalogTypeName}: ${result.description}`);
        }
      }
    }

    return {
      ids,
      summary: {
        totalResolved,
        totalNotFound,
        needsManualReview: totalNotFound > 0,
        missingCatalogs
      }
    };
  }

  /**
   * Resuelve instrumentos de ayuda
   */
  async resolveInstrumentos(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('instrumentoAyuda', descriptions, 'Instrumento');
  }

  /**
   * Resuelve tipos de beneficiario
   */
  async resolveTiposBeneficiarios(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('tipoBeneficiario', descriptions, 'Tipo Beneficiario');
  }

  /**
   * Resuelve sectores
   */
  async resolveSectores(descriptions: Array<{ descripcion?: string | null; codigo?: string | null }>) {
    return this.resolveCatalogArray('actividad', descriptions, 'Sector');
  }

  /**
   * Resuelve regiones
   */
  async resolveRegiones(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('region', descriptions, 'Región');
  }

  /**
   * Resuelve fondos
   */
  async resolveFondos(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('fondo', descriptions, 'Fondo');
  }

  /**
   * Resuelve objetivos
   */
  async resolveObjetivos(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('catalogoObjetivo', descriptions, 'Objetivo');
  }

  /**
   * Resuelve sectores de producto
   */
  async resolveSectoresProductos(descriptions: Array<{ descripcion?: string | null }>) {
    return this.resolveCatalogArray('sectorProducto', descriptions, 'Sector Producto');
  }

  /**
   * Resuelve reglamentos UE
   */
  async resolveReglamentoUE(reglamento?: { descripcion?: string | null; autorizacion?: number | null } | null): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
    if (!reglamento?.descripcion?.trim()) {
      return { 
        ids: [], 
        summary: { 
          totalResolved: 0, 
          totalNotFound: 0, 
          needsManualReview: false, 
          missingCatalogs: [] 
        } 
      };
    }

    const cacheKey = `reglamentoUE:${reglamento.descripcion.trim().toLowerCase()}`;
    const result = await this.resolveCatalogByType('reglamentoUE', reglamento.descripcion, cacheKey);
    
    return {
      ids: result.found && result.id ? [result.id] : [],
      summary: {
        totalResolved: result.found ? 1 : 0,
        totalNotFound: result.found ? 0 : 1,
        needsManualReview: result.needsManualReview ?? false,
        missingCatalogs: result.needsManualReview && result.description ? [`Reglamento UE: ${result.description}`] : []
      }
    };
  }

  /**
   * Resuelve órgano convocante
   */
  async resolveOrgano(organo?: { nivel1?: string | null; nivel2?: string | null; nivel3?: string | null } | null): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
    if (!organo?.nivel1?.trim() && !organo?.nivel2?.trim()) {
      return { 
        ids: [], 
        summary: { 
          totalResolved: 0, 
          totalNotFound: 0, 
          needsManualReview: false, 
          missingCatalogs: [] 
        } 
      };
    }

    // Buscar por nivel1 + nivel2 (más específico)
    if (organo.nivel1?.trim() && organo.nivel2?.trim()) {
      const cacheKey = `organo:${organo.nivel1.trim().toLowerCase()}:${organo.nivel2.trim().toLowerCase()}`;
      const result = await this.resolveCatalogByType('organo', `${organo.nivel1} - ${organo.nivel2}`, cacheKey);
      if (result.found && result.id) {
        return {
          ids: [result.id],
          summary: {
            totalResolved: 1,
            totalNotFound: 0,
            needsManualReview: false,
            missingCatalogs: []
          }
        };
      }
    }

    // Fallback: buscar solo por nivel1
    if (organo.nivel1?.trim()) {
      const cacheKey = `organo:${organo.nivel1.trim().toLowerCase()}`;
      const result = await this.resolveCatalogByType('organo', organo.nivel1, cacheKey);
      return {
        ids: result.found && result.id ? [result.id] : [],
        summary: {
          totalResolved: result.found ? 1 : 0,
          totalNotFound: result.found ? 0 : 1,
          needsManualReview: result.needsManualReview ?? false,
          missingCatalogs: result.needsManualReview && result.description ? [`Órgano: ${result.description}`] : []
        }
      };
    }

    return {
      ids: [],
      summary: {
        totalResolved: 0,
        totalNotFound: 1,
        needsManualReview: true,
        missingCatalogs: [`Órgano: ${organo.nivel1 || ''} - ${organo.nivel2 || ''} - ${organo.nivel3 || ''}`.trim()]
      }
    };
  }

  /**
   * Limpia el cache (útil para tests o cuando se actualizan catálogos)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const catalogResolver = CatalogResolver.getInstance(); 