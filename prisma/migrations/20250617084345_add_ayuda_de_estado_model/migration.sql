-- CreateTable
CREATE TABLE "AyudaDeEstado" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "tituloConvocatoria" TEXT NOT NULL,
    "beneficiarioNombre" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "ayudaEquivalente" DOUBLE PRECISION NOT NULL,
    "fechaConcesion" TIMESTAMP(3) NOT NULL,
    "convocatoriaId" INTEGER NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "instrumentoId" INTEGER,

    CONSTRAINT "AyudaDeEstado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AyudaDeEstado_idOficial_key" ON "AyudaDeEstado"("idOficial");

-- CreateIndex
CREATE INDEX "AyudaDeEstado_convocatoriaId_idx" ON "AyudaDeEstado"("convocatoriaId");

-- CreateIndex
CREATE INDEX "AyudaDeEstado_beneficiarioId_idx" ON "AyudaDeEstado"("beneficiarioId");

-- AddForeignKey
ALTER TABLE "AyudaDeEstado" ADD CONSTRAINT "AyudaDeEstado_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyudaDeEstado" ADD CONSTRAINT "AyudaDeEstado_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AyudaDeEstado" ADD CONSTRAINT "AyudaDeEstado_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "InstrumentoAyuda"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;
