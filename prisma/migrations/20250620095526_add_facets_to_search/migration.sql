-- AlterTable
ALTER TABLE "convocatoria_search" ADD COLUMN     "convocatoria_abierta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instrumentos_desc" JSONB,
ADD COLUMN     "modalidad_beneficiario" TEXT,
ADD COLUMN     "objetivos_desc" JSONB,
ADD COLUMN     "perfil_familiar" TEXT,
ADD COLUMN     "tipos_beneficiario_desc" JSONB;

-- CreateIndex
CREATE INDEX "idx_conv_modalidad_benef" ON "convocatoria_search"("modalidad_beneficiario");

-- CreateIndex
CREATE INDEX "idx_conv_perfil_fam" ON "convocatoria_search"("perfil_familiar");

-- CreateIndex
CREATE INDEX "idx_conv_abierta" ON "convocatoria_search"("convocatoria_abierta");
