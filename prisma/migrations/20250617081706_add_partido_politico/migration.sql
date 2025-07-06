-- CreateTable
CREATE TABLE "ConcesionPartidoPolitico" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "numeroConvocatoria" TEXT NOT NULL,
    "tituloConvocatoria" TEXT NOT NULL,
    "urlBasesReguladoras" TEXT,
    "codConcesion" TEXT NOT NULL,
    "beneficiario" TEXT NOT NULL,
    "instrumento" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "ayudaEquivalente" DOUBLE PRECISION NOT NULL,
    "tieneProyecto" BOOLEAN NOT NULL,
    "fechaConcesion" TIMESTAMP(3) NOT NULL,
    "convocatoriaId" INTEGER NOT NULL,

    CONSTRAINT "ConcesionPartidoPolitico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConcesionPartidoPolitico_idOficial_key" ON "ConcesionPartidoPolitico"("idOficial");

-- CreateIndex
CREATE INDEX "ConcesionPartidoPolitico_convocatoriaId_idx" ON "ConcesionPartidoPolitico"("convocatoriaId");

-- AddForeignKey
ALTER TABLE "ConcesionPartidoPolitico" ADD CONSTRAINT "ConcesionPartidoPolitico_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;
