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
   * Resuelve un catálogo por descripción, con cache en memoria
   */
  private async resolveCatalog(
    tableName: string,
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
      // Buscar por descripción exacta (case-insensitive)
      const result = await db.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM "${tableName}" 
        WHERE LOWER(TRIM(descripcion)) = LOWER(TRIM(${description}))
        LIMIT 1
      `;

      if (result.length > 0 && result[0]?.id) {
        const id = result[0].id;
        this.cache.set(cacheKey, id);
        return {
          found: true,
          id,
          description: description.trim()
        };
      }

      // Si no se encuentra, buscar por similitud (LIKE)
      const similarResult = await db.$queryRaw<Array<{ id: number; descripcion: string }>>`
        SELECT id, descripcion FROM "${tableName}" 
        WHERE LOWER(TRIM(descripcion)) LIKE LOWER(TRIM(${description}))
        OR LOWER(TRIM(descripcion)) LIKE LOWER(TRIM(${description})) || '%'
        OR LOWER(TRIM(descripcion)) LIKE '%' || LOWER(TRIM(${description}))
        LIMIT 1
      `;

      if (similarResult.length > 0 && similarResult[0]?.id && similarResult[0]?.descripcion) {
        const id = similarResult[0].id;
        this.cache.set(cacheKey, id);
        logger.warn(`Catálogo ${tableName} resuelto por similitud: "${description}" → "${similarResult[0].descripcion}"`);
        return {
          found: true,
          id,
          description: similarResult[0].descripcion
        };
      }

      return {
        found: false,
        needsManualReview: true,
        description: description.trim()
      };

    } catch (error) {
      logger.error(`Error resolviendo catálogo ${tableName}:`, error instanceof Error ? error : new Error(String(error)));
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
    tableName: string,
    descriptions: Array<{ descripcion?: string }>,
    catalogType: string
  ): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
    const ids: number[] = [];
    const missingCatalogs: string[] = [];
    let totalResolved = 0;
    let totalNotFound = 0;

    for (const item of descriptions) {
      if (!item.descripcion?.trim()) continue;

      const cacheKey = `${tableName}:${item.descripcion.trim().toLowerCase()}`;
      const result = await this.resolveCatalog(tableName, item.descripcion, cacheKey);

      if (result.found && result.id) {
        ids.push(result.id);
        totalResolved++;
      } else {
        totalNotFound++;
        if (result.description) {
          missingCatalogs.push(`${catalogType}: ${result.description}`);
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
  async resolveInstrumentos(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('InstrumentoAyuda', descriptions, 'Instrumento');
  }

  /**
   * Resuelve tipos de beneficiario
   */
  async resolveTiposBeneficiarios(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('TipoBeneficiario', descriptions, 'Tipo Beneficiario');
  }

  /**
   * Resuelve sectores
   */
  async resolveSectores(descriptions: Array<{ descripcion?: string; codigo?: string }>) {
    return this.resolveCatalogArray('Actividad', descriptions, 'Sector');
  }

  /**
   * Resuelve regiones
   */
  async resolveRegiones(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('Region', descriptions, 'Región');
  }

  /**
   * Resuelve fondos
   */
  async resolveFondos(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('Fondo', descriptions, 'Fondo');
  }

  /**
   * Resuelve objetivos
   */
  async resolveObjetivos(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('Objetivo', descriptions, 'Objetivo');
  }

  /**
   * Resuelve sectores de producto
   */
  async resolveSectoresProductos(descriptions: Array<{ descripcion?: string }>) {
    return this.resolveCatalogArray('SectorProducto', descriptions, 'Sector Producto');
  }

  /**
   * Resuelve reglamentos UE
   */
  async resolveReglamentoUE(reglamento?: { descripcion?: string; autorizacion?: number }): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
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

    const cacheKey = `ReglamentoUE:${reglamento.descripcion.trim().toLowerCase()}`;
    const result = await this.resolveCatalog('ReglamentoUE', reglamento.descripcion, cacheKey);
    
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
  async resolveOrgano(organo?: { nivel1?: string; nivel2?: string; nivel3?: string }): Promise<{ ids: number[]; summary: CatalogResolutionSummary }> {
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
      const cacheKey = `Organo:${organo.nivel1.trim().toLowerCase()}:${organo.nivel2.trim().toLowerCase()}`;
      const result = await this.resolveCatalog('Organo', `${organo.nivel1} - ${organo.nivel2}`, cacheKey);
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
      const cacheKey = `Organo:${organo.nivel1.trim().toLowerCase()}`;
      const result = await this.resolveCatalog('Organo', organo.nivel1, cacheKey);
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