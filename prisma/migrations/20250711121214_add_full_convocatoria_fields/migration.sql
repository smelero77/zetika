/*
  Warnings:

  - A unique constraint covering the columns `[numeroConvocatoria]` on the table `Convocatoria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoConvocatoria" AS ENUM ('ACTIVA', 'INACTIVA', 'ANULADA', 'CANCELADA', 'DESIERTA');

-- AlterTable
ALTER TABLE "Convocatoria" ADD COLUMN     "advertencia" TEXT,
ADD COLUMN     "estado" "EstadoConvocatoria",
ADD COLUMN     "indInactiva" BOOLEAN DEFAULT false,
ADD COLUMN     "needsManualReview" BOOLEAN DEFAULT false,
ADD COLUMN     "numeroConvocatoria" TEXT,
ADD COLUMN     "textFinSolicitud" TEXT;

-- AlterTable
ALTER TABLE "PlanEstrategico" ADD COLUMN     "convocatoriaId" INTEGER;

-- CreateTable
CREATE TABLE "_ConvocatoriaToSectorProducto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToSectorProducto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConvocatoriaToSectorProducto_B_index" ON "_ConvocatoriaToSectorProducto"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Convocatoria_numeroConvocatoria_key" ON "Convocatoria"("numeroConvocatoria");

-- AddForeignKey
ALTER TABLE "PlanEstrategico" ADD CONSTRAINT "PlanEstrategico_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToSectorProducto" ADD CONSTRAINT "_ConvocatoriaToSectorProducto_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToSectorProducto" ADD CONSTRAINT "_ConvocatoriaToSectorProducto_B_fkey" FOREIGN KEY ("B") REFERENCES "SectorProducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
