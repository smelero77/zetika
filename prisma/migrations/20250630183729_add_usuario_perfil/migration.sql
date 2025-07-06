-- CreateTable
CREATE TABLE "UsuarioPerfil" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre_perfil" TEXT NOT NULL,
    "nombre_empresa" TEXT,
    "nif_cif" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cofinanciacion_disp" BOOLEAN,
    "disponible_socios" BOOLEAN,
    "tamanoEmpresaId" INTEGER,
    "sectorId" INTEGER,
    "ubicacionId" INTEGER,

    CONSTRAINT "UsuarioPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TamanoEmpresa" (
    "id" SERIAL NOT NULL,
    "nombre_i18n" JSONB NOT NULL,
    "descripcion_i18n" JSONB,

    CONSTRAINT "TamanoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorEmpresa" (
    "id" SERIAL NOT NULL,
    "nombre_i18n" JSONB NOT NULL,

    CONSTRAINT "SectorEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "provincia_i18n" JSONB NOT NULL,
    "comAutonoma_i18n" JSONB NOT NULL,
    "pais_i18n" JSONB NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NecesidadCliente" (
    "id" SERIAL NOT NULL,
    "nombre_i18n" JSONB NOT NULL,

    CONSTRAINT "NecesidadCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPerfilNecesidad" (
    "usuarioPerfilId" INTEGER NOT NULL,
    "necesidadId" INTEGER NOT NULL,
    "prioridad" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPerfilNecesidad_pkey" PRIMARY KEY ("usuarioPerfilId","necesidadId")
);

-- CreateTable
CREATE TABLE "AmbitoInteres" (
    "id" SERIAL NOT NULL,
    "nombre_i18n" JSONB NOT NULL,

    CONSTRAINT "AmbitoInteres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPerfilAmbito" (
    "usuarioPerfilId" INTEGER NOT NULL,
    "ambitoId" INTEGER NOT NULL,
    "interesado" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPerfilAmbito_pkey" PRIMARY KEY ("usuarioPerfilId","ambitoId")
);

-- CreateTable
CREATE TABLE "PlazoCarga" (
    "id" SERIAL NOT NULL,
    "nombre_i18n" JSONB NOT NULL,

    CONSTRAINT "PlazoCarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPerfilPlazoCarga" (
    "usuarioPerfilId" INTEGER NOT NULL,
    "plazoId" INTEGER NOT NULL,
    "cumple" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPerfilPlazoCarga_pkey" PRIMARY KEY ("usuarioPerfilId","plazoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPerfil_nif_cif_key" ON "UsuarioPerfil"("nif_cif");

-- CreateIndex
CREATE INDEX "UsuarioPerfil_userId_idx" ON "UsuarioPerfil"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_provincia_i18n_comAutonoma_i18n_pais_i18n_key" ON "Ubicacion"("provincia_i18n", "comAutonoma_i18n", "pais_i18n");

-- CreateIndex
CREATE INDEX "UsuarioPerfilNecesidad_usuarioPerfilId_idx" ON "UsuarioPerfilNecesidad"("usuarioPerfilId");

-- CreateIndex
CREATE INDEX "UsuarioPerfilNecesidad_necesidadId_idx" ON "UsuarioPerfilNecesidad"("necesidadId");

-- CreateIndex
CREATE INDEX "UsuarioPerfilAmbito_usuarioPerfilId_idx" ON "UsuarioPerfilAmbito"("usuarioPerfilId");

-- CreateIndex
CREATE INDEX "UsuarioPerfilAmbito_ambitoId_idx" ON "UsuarioPerfilAmbito"("ambitoId");

-- CreateIndex
CREATE INDEX "UsuarioPerfilPlazoCarga_usuarioPerfilId_idx" ON "UsuarioPerfilPlazoCarga"("usuarioPerfilId");

-- CreateIndex
CREATE INDEX "UsuarioPerfilPlazoCarga_plazoId_idx" ON "UsuarioPerfilPlazoCarga"("plazoId");

-- AddForeignKey
ALTER TABLE "UsuarioPerfil" ADD CONSTRAINT "UsuarioPerfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfil" ADD CONSTRAINT "UsuarioPerfil_tamanoEmpresaId_fkey" FOREIGN KEY ("tamanoEmpresaId") REFERENCES "TamanoEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfil" ADD CONSTRAINT "UsuarioPerfil_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "SectorEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfil" ADD CONSTRAINT "UsuarioPerfil_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilNecesidad" ADD CONSTRAINT "UsuarioPerfilNecesidad_usuarioPerfilId_fkey" FOREIGN KEY ("usuarioPerfilId") REFERENCES "UsuarioPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilNecesidad" ADD CONSTRAINT "UsuarioPerfilNecesidad_necesidadId_fkey" FOREIGN KEY ("necesidadId") REFERENCES "NecesidadCliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilAmbito" ADD CONSTRAINT "UsuarioPerfilAmbito_usuarioPerfilId_fkey" FOREIGN KEY ("usuarioPerfilId") REFERENCES "UsuarioPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilAmbito" ADD CONSTRAINT "UsuarioPerfilAmbito_ambitoId_fkey" FOREIGN KEY ("ambitoId") REFERENCES "AmbitoInteres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilPlazoCarga" ADD CONSTRAINT "UsuarioPerfilPlazoCarga_usuarioPerfilId_fkey" FOREIGN KEY ("usuarioPerfilId") REFERENCES "UsuarioPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPerfilPlazoCarga" ADD CONSTRAINT "UsuarioPerfilPlazoCarga_plazoId_fkey" FOREIGN KEY ("plazoId") REFERENCES "PlazoCarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
