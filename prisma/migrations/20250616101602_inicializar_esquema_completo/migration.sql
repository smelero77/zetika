-- CreateTable
CREATE TABLE "Convocatoria" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "codigoBDNS" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tituloCooficial" TEXT,
    "descripcion" TEXT,
    "presupuestoTotal" DOUBLE PRECISION,
    "urlBasesReguladoras" TEXT,
    "sedeElectronica" TEXT,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL,
    "fechaInicioSolicitud" TIMESTAMP(3),
    "fechaFinSolicitud" TIMESTAMP(3),
    "plazoAbierto" BOOLEAN,
    "resumenIA" TEXT,
    "organoId" TEXT,
    "finalidadId" INTEGER,
    "reglamentoId" INTEGER,

    CONSTRAINT "Convocatoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concesion" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "ayudaEquivalente" DOUBLE PRECISION NOT NULL,
    "fechaConcesion" TIMESTAMP(3) NOT NULL,
    "convocatoriaId" INTEGER NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "instrumentoId" INTEGER,

    CONSTRAINT "Concesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiario" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "nifCif" TEXT,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Beneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organo" (
    "id" SERIAL NOT NULL,
    "idOficial" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoAdministracion" TEXT,

    CONSTRAINT "Organo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finalidad" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Finalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoBeneficiario" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "TipoBeneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentoAyuda" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "InstrumentoAyuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "codigo" TEXT,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglamentoUE" (
    "id" SERIAL NOT NULL,
    "idOficial" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "ReglamentoUE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fondo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Fondo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "filtros" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConvocatoriaToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConvocatoriaToTipoBeneficiario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToTipoBeneficiario_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConvocatoriaToInstrumentoAyuda" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToInstrumentoAyuda_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConvocatoriaToRegion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConvocatoriaToFondo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConvocatoriaToFondo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActividadToConvocatoria" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ActividadToConvocatoria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoriaToConvocatoria" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoriaToConvocatoria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Convocatoria_idOficial_key" ON "Convocatoria"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Convocatoria_codigoBDNS_key" ON "Convocatoria"("codigoBDNS");

-- CreateIndex
CREATE UNIQUE INDEX "Concesion_idOficial_key" ON "Concesion"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiario_idOficial_key" ON "Beneficiario"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiario_nifCif_key" ON "Beneficiario"("nifCif");

-- CreateIndex
CREATE UNIQUE INDEX "Organo_idOficial_key" ON "Organo"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Region_idOficial_key" ON "Region"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Finalidad_idOficial_key" ON "Finalidad"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "TipoBeneficiario_idOficial_key" ON "TipoBeneficiario"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentoAyuda_idOficial_key" ON "InstrumentoAyuda"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Actividad_idOficial_key" ON "Actividad"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "ReglamentoUE_idOficial_key" ON "ReglamentoUE"("idOficial");

-- CreateIndex
CREATE UNIQUE INDEX "Fondo_nombre_key" ON "Fondo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nombre_key" ON "Tag"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "_ConvocatoriaToTag_B_index" ON "_ConvocatoriaToTag"("B");

-- CreateIndex
CREATE INDEX "_ConvocatoriaToTipoBeneficiario_B_index" ON "_ConvocatoriaToTipoBeneficiario"("B");

-- CreateIndex
CREATE INDEX "_ConvocatoriaToInstrumentoAyuda_B_index" ON "_ConvocatoriaToInstrumentoAyuda"("B");

-- CreateIndex
CREATE INDEX "_ConvocatoriaToRegion_B_index" ON "_ConvocatoriaToRegion"("B");

-- CreateIndex
CREATE INDEX "_ConvocatoriaToFondo_B_index" ON "_ConvocatoriaToFondo"("B");

-- CreateIndex
CREATE INDEX "_ActividadToConvocatoria_B_index" ON "_ActividadToConvocatoria"("B");

-- CreateIndex
CREATE INDEX "_CategoriaToConvocatoria_B_index" ON "_CategoriaToConvocatoria"("B");

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_organoId_fkey" FOREIGN KEY ("organoId") REFERENCES "Organo"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_finalidadId_fkey" FOREIGN KEY ("finalidadId") REFERENCES "Finalidad"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "ReglamentoUE"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concesion" ADD CONSTRAINT "Concesion_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concesion" ADD CONSTRAINT "Concesion_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Beneficiario"("idOficial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concesion" ADD CONSTRAINT "Concesion_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "InstrumentoAyuda"("idOficial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToTag" ADD CONSTRAINT "_ConvocatoriaToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToTag" ADD CONSTRAINT "_ConvocatoriaToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToTipoBeneficiario" ADD CONSTRAINT "_ConvocatoriaToTipoBeneficiario_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToTipoBeneficiario" ADD CONSTRAINT "_ConvocatoriaToTipoBeneficiario_B_fkey" FOREIGN KEY ("B") REFERENCES "TipoBeneficiario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToInstrumentoAyuda" ADD CONSTRAINT "_ConvocatoriaToInstrumentoAyuda_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToInstrumentoAyuda" ADD CONSTRAINT "_ConvocatoriaToInstrumentoAyuda_B_fkey" FOREIGN KEY ("B") REFERENCES "InstrumentoAyuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToRegion" ADD CONSTRAINT "_ConvocatoriaToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToRegion" ADD CONSTRAINT "_ConvocatoriaToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToFondo" ADD CONSTRAINT "_ConvocatoriaToFondo_A_fkey" FOREIGN KEY ("A") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConvocatoriaToFondo" ADD CONSTRAINT "_ConvocatoriaToFondo_B_fkey" FOREIGN KEY ("B") REFERENCES "Fondo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActividadToConvocatoria" ADD CONSTRAINT "_ActividadToConvocatoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActividadToConvocatoria" ADD CONSTRAINT "_ActividadToConvocatoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToConvocatoria" ADD CONSTRAINT "_CategoriaToConvocatoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToConvocatoria" ADD CONSTRAINT "_CategoriaToConvocatoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Convocatoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
