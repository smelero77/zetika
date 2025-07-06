/*
  Warnings:

  - You are about to drop the column `sectorProducto` on the `Minimis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Minimis" DROP COLUMN "sectorProducto",
ADD COLUMN     "sectorProductoId" INTEGER;

-- CreateTable
CREATE TABLE "SectorProducto" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "SectorProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectorProducto_idOficial_key" ON "SectorProducto"("idOficial");

-- CreateIndex
CREATE INDEX "Minimis_sectorProductoId_idx" ON "Minimis"("sectorProductoId");

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_sectorProductoId_fkey" FOREIGN KEY ("sectorProductoId") REFERENCES "SectorProducto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
