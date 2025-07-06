-- CreateTable
CREATE TABLE "PlanEstrategico" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "descripcionCooficial" TEXT,
    "tipoPlan" TEXT NOT NULL,
    "vigenciaDesde" INTEGER NOT NULL,
    "vigenciaHasta" INTEGER NOT NULL,
    "ambitos" TEXT,

    CONSTRAINT "PlanEstrategico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanEstrategico_idOficial_key" ON "PlanEstrategico"("idOficial");
