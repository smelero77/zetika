/*
  Warnings:

  - The `organoId` column on the `Convocatoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nombre` on the `Organo` table. All the data in the column will be lost.
  - Added the required column `descripcion` to the `Organo` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `idOficial` on the `Organo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `tipoAdministracion` on table `Organo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Convocatoria" DROP CONSTRAINT "Convocatoria_organoId_fkey";

-- AlterTable
ALTER TABLE "Convocatoria" DROP COLUMN "organoId",
ADD COLUMN     "organoId" INTEGER;

-- AlterTable
ALTER TABLE "Organo" DROP COLUMN "nombre",
ADD COLUMN     "descripcion" TEXT NOT NULL,
ADD COLUMN     "nivel1" TEXT,
ADD COLUMN     "nivel2" TEXT,
ADD COLUMN     "nivel3" TEXT,
ADD COLUMN     "organoPadreId" INTEGER,
DROP COLUMN "idOficial",
ADD COLUMN     "idOficial" INTEGER NOT NULL,
ALTER COLUMN "tipoAdministracion" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Convocatoria_organoId_idx" ON "Convocatoria"("organoId");

-- CreateIndex
CREATE UNIQUE INDEX "Organo_idOficial_key" ON "Organo"("idOficial");

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_organoId_fkey" FOREIGN KEY ("organoId") REFERENCES "Organo"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organo" ADD CONSTRAINT "Organo_organoPadreId_fkey" FOREIGN KEY ("organoPadreId") REFERENCES "Organo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
