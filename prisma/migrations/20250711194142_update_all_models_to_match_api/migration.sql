/*
  Warnings:

  - You are about to drop the column `beneficiarioNombre` on the `AyudaDeEstado` table. All the data in the column will be lost.
  - You are about to drop the column `idOficial` on the `AyudaDeEstado` table. All the data in the column will be lost.
  - You are about to drop the column `tituloConvocatoria` on the `AyudaDeEstado` table. All the data in the column will be lost.
  - You are about to drop the column `convocatoriaId` on the `Concesion` table. All the data in the column will be lost.
  - You are about to drop the column `convocatoriaId` on the `ConcesionPartidoPolitico` table. All the data in the column will be lost.
  - You are about to drop the column `tituloConvocatoria` on the `ConcesionPartidoPolitico` table. All the data in the column will be lost.
  - You are about to drop the column `urlBasesReguladoras` on the `ConcesionPartidoPolitico` table. All the data in the column will be lost.
  - You are about to drop the column `ayudaTotal` on the `GranBeneficiario` table. All the data in the column will be lost.
  - The `ambitos` column on the `PlanEstrategico` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `organoNivel1` on the `Sancion` table. All the data in the column will be lost.
  - You are about to drop the column `organoNivel2` on the `Sancion` table. All the data in the column will be lost.
  - You are about to drop the column `organoNivel3` on the `Sancion` table. All the data in the column will be lost.
  - You are about to drop the column `tituloConvocatoria` on the `Sancion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idConcesion]` on the table `AyudaDeEstado` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPersona]` on the table `GranBeneficiario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `beneficiario` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convocante` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convocatoria` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaAlta` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idConcesion` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idConvocatoria` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPersona` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instrumento` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroConvocatoria` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetivo` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reglamento` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoBeneficiario` to the `AyudaDeEstado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiario` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convocatoria` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idConvocatoria` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPersona` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instrumento` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel1` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel2` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroConvocatoria` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tieneProyecto` to the `Concesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convocatoria` to the `ConcesionPartidoPolitico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idConvocatoria` to the `ConcesionPartidoPolitico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel1` to the `ConcesionPartidoPolitico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel2` to the `ConcesionPartidoPolitico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ayudaETotal` to the `GranBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiario` to the `GranBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPersona` to the `GranBeneficiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiario` to the `Minimis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idConvocatoria` to the `Minimis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPersona` to the `Minimis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroConvocatoria` to the `Minimis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convocatoria` to the `Sancion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel1` to the `Sancion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel2` to the `Sancion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AyudaDeEstado" DROP CONSTRAINT "AyudaDeEstado_convocatoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Concesion" DROP CONSTRAINT "Concesion_convocatoriaId_fkey";

-- DropForeignKey
ALTER TABLE "ConcesionPartidoPolitico" DROP CONSTRAINT "ConcesionPartidoPolitico_convocatoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Minimis" DROP CONSTRAINT "Minimis_beneficiarioId_fkey";

-- DropForeignKey
ALTER TABLE "Minimis" DROP CONSTRAINT "Minimis_convocatoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Minimis" DROP CONSTRAINT "Minimis_sectorProductoId_fkey";

-- DropIndex
DROP INDEX "AyudaDeEstado_convocatoriaId_idx";

-- DropIndex
DROP INDEX "AyudaDeEstado_idOficial_key";

-- DropIndex
DROP INDEX "Concesion_convocatoriaId_idx";

-- DropIndex
DROP INDEX "ConcesionPartidoPolitico_convocatoriaId_idx";

-- DropIndex
DROP INDEX "Minimis_convocatoriaId_idx";

-- AlterTable
ALTER TABLE "Anuncio" ADD COLUMN     "textoLeng" TEXT;

-- AlterTable
ALTER TABLE "AyudaDeEstado" DROP COLUMN "beneficiarioNombre",
DROP COLUMN "idOficial",
DROP COLUMN "tituloConvocatoria",
ADD COLUMN     "ayudaEstado" TEXT,
ADD COLUMN     "beneficiario" TEXT NOT NULL,
ADD COLUMN     "convocante" TEXT NOT NULL,
ADD COLUMN     "convocatoria" TEXT NOT NULL,
ADD COLUMN     "entidad" TEXT,
ADD COLUMN     "fechaAlta" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "idConcesion" INTEGER NOT NULL,
ADD COLUMN     "idConvocatoria" INTEGER NOT NULL,
ADD COLUMN     "idPersona" INTEGER NOT NULL,
ADD COLUMN     "instrumento" TEXT NOT NULL,
ADD COLUMN     "intermediario" TEXT,
ADD COLUMN     "numeroConvocatoria" TEXT NOT NULL,
ADD COLUMN     "objetivo" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "reglamento" TEXT NOT NULL,
ADD COLUMN     "sectores" TEXT,
ADD COLUMN     "tipoBeneficiario" TEXT NOT NULL,
ADD COLUMN     "urlAyudaEstado" TEXT;

-- AlterTable
ALTER TABLE "Concesion" DROP COLUMN "convocatoriaId",
ADD COLUMN     "beneficiario" TEXT NOT NULL,
ADD COLUMN     "codigoInvente" TEXT,
ADD COLUMN     "convocatoria" TEXT NOT NULL,
ADD COLUMN     "descripcionCooficial" TEXT,
ADD COLUMN     "idConvocatoria" INTEGER NOT NULL,
ADD COLUMN     "idPersona" INTEGER NOT NULL,
ADD COLUMN     "instrumento" TEXT NOT NULL,
ADD COLUMN     "nivel1" TEXT NOT NULL,
ADD COLUMN     "nivel2" TEXT NOT NULL,
ADD COLUMN     "nivel3" TEXT,
ADD COLUMN     "numeroConvocatoria" TEXT NOT NULL,
ADD COLUMN     "tieneProyecto" BOOLEAN NOT NULL,
ADD COLUMN     "urlBR" TEXT;

-- AlterTable
ALTER TABLE "ConcesionPartidoPolitico" DROP COLUMN "convocatoriaId",
DROP COLUMN "tituloConvocatoria",
DROP COLUMN "urlBasesReguladoras",
ADD COLUMN     "codigoInvente" TEXT,
ADD COLUMN     "convocatoria" TEXT NOT NULL,
ADD COLUMN     "idConvocatoria" INTEGER NOT NULL,
ADD COLUMN     "nivel1" TEXT NOT NULL,
ADD COLUMN     "nivel2" TEXT NOT NULL,
ADD COLUMN     "nivel3" TEXT,
ADD COLUMN     "urlBR" TEXT;

-- AlterTable
ALTER TABLE "Convocatoria" ADD COLUMN     "descripcionFinalidad" TEXT,
ADD COLUMN     "textFin" TEXT,
ADD COLUMN     "textInicio" TEXT;

-- AlterTable
ALTER TABLE "GranBeneficiario" DROP COLUMN "ayudaTotal",
ADD COLUMN     "ayudaETotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "beneficiario" TEXT NOT NULL,
ADD COLUMN     "idPersona" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Minimis" ADD COLUMN     "beneficiario" TEXT NOT NULL,
ADD COLUMN     "idConvocatoria" INTEGER NOT NULL,
ADD COLUMN     "idPersona" INTEGER NOT NULL,
ADD COLUMN     "numeroConvocatoria" TEXT NOT NULL,
ADD COLUMN     "sectorProducto" TEXT;

-- AlterTable
ALTER TABLE "PlanEstrategico" ADD COLUMN     "convocatoriaId" INTEGER;

-- AlterTable
ALTER TABLE "ReglamentoUE" ADD COLUMN     "autorizacion" INTEGER;

-- AlterTable
ALTER TABLE "Sancion" DROP COLUMN "organoNivel1",
DROP COLUMN "organoNivel2",
DROP COLUMN "organoNivel3",
DROP COLUMN "tituloConvocatoria",
ADD COLUMN     "convocatoria" TEXT NOT NULL,
ADD COLUMN     "nivel1" TEXT NOT NULL,
ADD COLUMN     "nivel2" TEXT NOT NULL,
ADD COLUMN     "nivel3" TEXT;

-- AlterTable
ALTER TABLE "TipoBeneficiario" ADD COLUMN     "codigo" TEXT;

-- CreateTable
CREATE TABLE "DocumentoPlanEstrategico" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "ejercicio" INTEGER,
    "nombreFic" TEXT,
    "tipoDocumento" TEXT,
    "planEstrategicoId" INTEGER NOT NULL,

    CONSTRAINT "DocumentoPlanEstrategico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoPlanEstrategico_idOficial_key" ON "DocumentoPlanEstrategico"("idOficial");

-- CreateIndex
CREATE INDEX "DocumentoPlanEstrategico_planEstrategicoId_idx" ON "DocumentoPlanEstrategico"("planEstrategicoId");

-- CreateIndex
CREATE UNIQUE INDEX "AyudaDeEstado_idConcesion_key" ON "AyudaDeEstado"("idConcesion");

-- CreateIndex
CREATE INDEX "AyudaDeEstado_idConvocatoria_idx" ON "AyudaDeEstado"("idConvocatoria");

-- CreateIndex
CREATE INDEX "Concesion_idConvocatoria_idx" ON "Concesion"("idConvocatoria");

-- CreateIndex
CREATE INDEX "ConcesionPartidoPolitico_idConvocatoria_idx" ON "ConcesionPartidoPolitico"("idConvocatoria");

-- CreateIndex
CREATE UNIQUE INDEX "GranBeneficiario_idPersona_key" ON "GranBeneficiario"("idPersona");

-- CreateIndex
CREATE INDEX "Minimis_idConvocatoria_idx" ON "Minimis"("idConvocatoria");

-- AddForeignKey
ALTER TABLE "Concesion" ADD CONSTRAINT "Concesion_idConvocatoria_fkey" FOREIGN KEY ("idConvocatoria") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_idConvocatoria_fkey" FOREIGN KEY ("idConvocatoria") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_sectorProductoId_fkey" FOREIGN KEY ("sectorProductoId") REFERENCES "SectorProducto"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPlanEstrategico" ADD CONSTRAINT "DocumentoPlanEstrategico_planEstrategicoId_fkey" FOREIGN KEY ("planEstrategicoId") REFERENCES "PlanEstrategico"("idOficial") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConcesionPartidoPolitico" ADD CONSTRAINT "ConcesionPartidoPolitico_idConvocatoria_fkey" FOREIGN KEY ("idConvocatoria") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyudaDeEstado" ADD CONSTRAINT "AyudaDeEstado_idConvocatoria_fkey" FOREIGN KEY ("idConvocatoria") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;
