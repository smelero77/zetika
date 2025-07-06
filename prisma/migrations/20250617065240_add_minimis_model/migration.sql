-- CreateTable
CREATE TABLE "Minimis" (
    "id" SERIAL NOT NULL,
    "idConcesion" INTEGER NOT NULL,
    "codigoConcesion" TEXT NOT NULL,
    "fechaConcesion" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL,
    "ayudaEquivalente" DOUBLE PRECISION NOT NULL,
    "convocante" TEXT NOT NULL,
    "reglamento" TEXT NOT NULL,
    "instrumento" TEXT NOT NULL,
    "sectorActividad" TEXT NOT NULL,
    "sectorProducto" TEXT,
    "convocatoriaId" INTEGER NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,

    CONSTRAINT "Minimis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Minimis_idConcesion_key" ON "Minimis"("idConcesion");

-- CreateIndex
CREATE INDEX "Minimis_fechaRegistro_idx" ON "Minimis"("fechaRegistro");

-- CreateIndex
CREATE INDEX "Minimis_convocatoriaId_idx" ON "Minimis"("convocatoriaId");

-- CreateIndex
CREATE INDEX "Minimis_beneficiarioId_idx" ON "Minimis"("beneficiarioId");

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minimis" ADD CONSTRAINT "Minimis_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
