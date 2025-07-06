/*
  Warnings:

  - You are about to drop the `Documento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_convocatoriaId_fkey";

-- DropTable
DROP TABLE "Documento";

-- CreateTable
CREATE TABLE "documento" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "nombreFic" TEXT,
    "descripcion" TEXT,
    "longitud" BIGINT,
    "fechaMod" TIMESTAMP(3),
    "fechaPublic" TIMESTAMP(3),
    "convocatoriaId" INTEGER NOT NULL,
    "storage_path" TEXT,
    "storage_url" TEXT,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documento_idOficial_key" ON "documento"("idOficial");

-- CreateIndex
CREATE INDEX "documento_convocatoriaId_idx" ON "documento"("convocatoriaId");

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
