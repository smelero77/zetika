-- CreateTable
CREATE TABLE "Sancion" (
    "id" SERIAL NOT NULL,
    "numeroConvocatoria" TEXT NOT NULL,
    "tituloConvocatoria" TEXT NOT NULL,
    "organoNivel1" TEXT,
    "organoNivel2" TEXT,
    "organoNivel3" TEXT,
    "codigoINVENTE" TEXT,
    "fechaConcesion" TIMESTAMP(3) NOT NULL,
    "infraccion" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "sancionado" TEXT NOT NULL,
    "fechaSancion" TIMESTAMP(3) NOT NULL,
    "importeMulta" DOUBLE PRECISION NOT NULL,
    "inicioInhabilitacion" TIMESTAMP(3),
    "finInhabilitacion" TIMESTAMP(3),

    CONSTRAINT "Sancion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sancion_numeroConvocatoria_idx" ON "Sancion"("numeroConvocatoria");

-- CreateIndex
CREATE UNIQUE INDEX "Sancion_numeroConvocatoria_sancionado_fechaSancion_key" ON "Sancion"("numeroConvocatoria", "sancionado", "fechaSancion");

-- AddForeignKey
ALTER TABLE "Sancion" ADD CONSTRAINT "Sancion_numeroConvocatoria_fkey" FOREIGN KEY ("numeroConvocatoria") REFERENCES "Convocatoria"("codigoBDNS") ON DELETE RESTRICT ON UPDATE CASCADE;
