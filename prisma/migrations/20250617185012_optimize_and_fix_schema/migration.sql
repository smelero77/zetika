/*
  Warnings:

  - Added the required column `beneficiarioId` to the `Sancion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Convocatoria" ADD COLUMN     "ayudaEstadoSANumber" TEXT,
ADD COLUMN     "ayudaEstadoUrl" TEXT,
ADD COLUMN     "descripcionBasesReguladoras" TEXT,
ADD COLUMN     "sePublicaDiarioOficial" BOOLEAN,
ADD COLUMN     "textInicioSolicitud" TEXT,
ADD COLUMN     "tipoConvocatoria" TEXT;

-- AlterTable
ALTER TABLE "Sancion" ADD COLUMN     "beneficiarioId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "AyudaDeEstado_instrumentoId_idx" ON "AyudaDeEstado"("instrumentoId");

-- CreateIndex
CREATE INDEX "Concesion_convocatoriaId_idx" ON "Concesion"("convocatoriaId");

-- CreateIndex
CREATE INDEX "Concesion_beneficiarioId_idx" ON "Concesion"("beneficiarioId");

-- CreateIndex
CREATE INDEX "Concesion_instrumentoId_idx" ON "Concesion"("instrumentoId");

-- CreateIndex
CREATE INDEX "Convocatoria_organoId_idx" ON "Convocatoria"("organoId");

-- CreateIndex
CREATE INDEX "Convocatoria_finalidadId_idx" ON "Convocatoria"("finalidadId");

-- CreateIndex
CREATE INDEX "Convocatoria_reglamentoId_idx" ON "Convocatoria"("reglamentoId");

-- CreateIndex
CREATE INDEX "Convocatoria_fechaPublicacion_idx" ON "Convocatoria"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "GranBeneficiario_beneficiarioId_idx" ON "GranBeneficiario"("beneficiarioId");

-- CreateIndex
CREATE INDEX "Sancion_beneficiarioId_idx" ON "Sancion"("beneficiarioId");

-- AddForeignKey
ALTER TABLE "Sancion" ADD CONSTRAINT "Sancion_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;
