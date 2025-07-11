-- Script para borrar en orden el contenido completo de todas las tablas
-- Versión simplificada - solo tablas principales

-- 1. Tablas de unión (many-to-many) - solo si existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ActividadToConvocatoria') THEN
        TRUNCATE TABLE "_ActividadToConvocatoria" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_CategoriaToConvocatoria') THEN
        TRUNCATE TABLE "_CategoriaToConvocatoria" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToFondo') THEN
        TRUNCATE TABLE "_ConvocatoriaToFondo" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToInstrumentoAyuda') THEN
        TRUNCATE TABLE "_ConvocatoriaToInstrumentoAyuda" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToRegion') THEN
        TRUNCATE TABLE "_ConvocatoriaToRegion" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToSectorProducto') THEN
        TRUNCATE TABLE "_ConvocatoriaToSectorProducto" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToTag') THEN
        TRUNCATE TABLE "_ConvocatoriaToTag" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_ConvocatoriaToTipoBeneficiario') THEN
        TRUNCATE TABLE "_ConvocatoriaToTipoBeneficiario" CASCADE;
    END IF;
END $$;

-- 2. Tablas de perfil de usuario - solo si existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'UsuarioPerfilAmbito') THEN
        TRUNCATE TABLE "UsuarioPerfilAmbito" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'UsuarioPerfilNecesidad') THEN
        TRUNCATE TABLE "UsuarioPerfilNecesidad" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'UsuarioPerfilPlazoCarga') THEN
        TRUNCATE TABLE "UsuarioPerfilPlazoCarga" CASCADE;
    END IF;
END $$;

-- 3. Tablas principales - solo si existen
DO $$
BEGIN
    -- Nueva tabla de documentos de planes estratégicos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'DocumentoPlanEstrategico') THEN
        TRUNCATE TABLE "DocumentoPlanEstrategico" CASCADE;
    END IF;
    
    -- Tablas de datos principales
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Minimis') THEN
        TRUNCATE TABLE "Minimis" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PlanEstrategico') THEN
        TRUNCATE TABLE "PlanEstrategico" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Sancion') THEN
        TRUNCATE TABLE "Sancion" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ConcesionPartidoPolitico') THEN
        TRUNCATE TABLE "ConcesionPartidoPolitico" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AyudaDeEstado') THEN
        TRUNCATE TABLE "AyudaDeEstado" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Concesion') THEN
        TRUNCATE TABLE "Concesion" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'GranBeneficiario') THEN
        TRUNCATE TABLE "GranBeneficiario" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'UsuarioPerfil') THEN
        TRUNCATE TABLE "UsuarioPerfil" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Alerta') THEN
        TRUNCATE TABLE "Alerta" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ConvocatoriaSearch') THEN
        TRUNCATE TABLE "ConvocatoriaSearch" CASCADE;
    END IF;
END $$;

-- 4. Tablas de catálogos - solo si existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Organo') THEN
        TRUNCATE TABLE "Organo" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Region') THEN
        TRUNCATE TABLE "Region" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Finalidad') THEN
        TRUNCATE TABLE "Finalidad" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'TipoBeneficiario') THEN
        TRUNCATE TABLE "TipoBeneficiario" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'InstrumentoAyuda') THEN
        TRUNCATE TABLE "InstrumentoAyuda" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Actividad') THEN
        TRUNCATE TABLE "Actividad" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ReglamentoUE') THEN
        TRUNCATE TABLE "ReglamentoUE" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Fondo') THEN
        TRUNCATE TABLE "Fondo" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'SectorProducto') THEN
        TRUNCATE TABLE "SectorProducto" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'CatalogoObjetivo') THEN
        TRUNCATE TABLE "CatalogoObjetivo" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Categoria') THEN
        TRUNCATE TABLE "Categoria" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Tag') THEN
        TRUNCATE TABLE "Tag" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'TamanoEmpresa') THEN
        TRUNCATE TABLE "TamanoEmpresa" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'SectorEmpresa') THEN
        TRUNCATE TABLE "SectorEmpresa" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Ubicacion') THEN
        TRUNCATE TABLE "Ubicacion" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'NecesidadCliente') THEN
        TRUNCATE TABLE "NecesidadCliente" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AmbitoInteres') THEN
        TRUNCATE TABLE "AmbitoInteres" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PlazoCarga') THEN
        TRUNCATE TABLE "PlazoCarga" CASCADE;
    END IF;
END $$;

-- 5. Tablas de autenticación - solo si existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Account') THEN
        TRUNCATE TABLE "Account" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Session') THEN
        TRUNCATE TABLE "Session" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'VerificationToken') THEN
        TRUNCATE TABLE "VerificationToken" CASCADE;
    END IF;
END $$;

-- 6. Tablas principales - solo si existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Beneficiario') THEN
        TRUNCATE TABLE "Beneficiario" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Convocatoria') THEN
        TRUNCATE TABLE "Convocatoria" CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        TRUNCATE TABLE "User" CASCADE;
    END IF;
END $$;

-- Comentario final
-- Todas las tablas existentes han sido limpiadas 