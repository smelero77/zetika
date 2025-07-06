-- habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "convocatoria_search" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "convocatoria_id" INTEGER NOT NULL REFERENCES "Convocatoria"("id"),
  "codigo_bdns" TEXT,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "resumen_ia" TEXT,
  "tags_ia" JSONB,
  "categorias_ia" JSONB,
  "embedding" vector(1536),
  "searchable" tsvector,
  "fecha_publicacion" DATE,
  "fecha_cierre" DATE,
  "presupuesto_convocatoria" DECIMAL(15,2),
  "sector_economico" TEXT,
  "tipo_ayuda" TEXT,
  "origen_fondos" TEXT,
  "comunidad_autonoma" TEXT,
  "provincia" TEXT,
  "municipio" TEXT,
  "popularidad" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now()
);


-- CreateIndex
CREATE INDEX "idx_conv_fechas" ON "convocatoria_search"("fecha_publicacion", "fecha_cierre");

-- CreateIndex
CREATE INDEX "idx_conv_presupuesto" ON "convocatoria_search"("presupuesto_convocatoria");

-- CreateIndex
CREATE INDEX "idx_conv_sector" ON "convocatoria_search"("sector_economico");

-- CreateIndex
CREATE INDEX "idx_conv_tipo_ayuda" ON "convocatoria_search"("tipo_ayuda");

-- CreateIndex
CREATE INDEX "idx_conv_origen_fondos" ON "convocatoria_search"("origen_fondos");

-- CreateIndex
CREATE INDEX "idx_conv_geo" ON "convocatoria_search"("comunidad_autonoma", "provincia", "municipio");
