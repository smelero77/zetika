-- CreateTable
CREATE TABLE "GranBeneficiario" (
    "id" SERIAL NOT NULL,
    "ejercicio" INTEGER NOT NULL,
    "ayudaTotal" DOUBLE PRECISION NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,

    CONSTRAINT "GranBeneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GranBeneficiario_ejercicio_idx" ON "GranBeneficiario"("ejercicio");

-- CreateIndex
CREATE UNIQUE INDEX "GranBeneficiario_beneficiarioId_ejercicio_key" ON "GranBeneficiario"("beneficiarioId", "ejercicio");

-- AddForeignKey
ALTER TABLE "GranBeneficiario" ADD CONSTRAINT "GranBeneficiario_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;
