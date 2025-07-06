/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Actividad` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[descripcion]` on the table `Finalidad` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "nombreFic" TEXT,
    "descripcion" TEXT,
    "longitud" BIGINT,
    "fechaMod" TIMESTAMP(3),
    "fechaPublic" TIMESTAMP(3),
    "convocatoriaId" INTEGER NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" SERIAL NOT NULL,
    "numAnuncio" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tituloLeng" TEXT,
    "texto" TEXT,
    "url" TEXT,
    "cve" TEXT,
    "desDiarioOficial" TEXT,
    "fechaPublicacion" TIMESTAMP(3),
    "convocatoriaId" INTEGER NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objetivo" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "convocatoriaId" INTEGER NOT NULL,

    CONSTRAINT "Objetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documento_idOficial_key" ON "Documento"("idOficial");

-- CreateIndex
CREATE INDEX "Documento_convocatoriaId_idx" ON "Documento"("convocatoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_numAnuncio_key" ON "Anuncio"("numAnuncio");

-- CreateIndex
CREATE INDEX "Anuncio_convocatoriaId_idx" ON "Anuncio"("convocatoriaId");

-- CreateIndex
CREATE INDEX "Objetivo_convocatoriaId_idx" ON "Objetivo"("convocatoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Actividad_codigo_key" ON "Actividad"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Finalidad_descripcion_key" ON "Finalidad"("descripcion");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
