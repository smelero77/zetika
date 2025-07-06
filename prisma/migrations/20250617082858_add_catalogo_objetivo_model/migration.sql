-- CreateTable
CREATE TABLE "CatalogoObjetivo" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "CatalogoObjetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoObjetivo_idOficial_key" ON "CatalogoObjetivo"("idOficial");
