-- AlterTable
ALTER TABLE "Convocatoria" ADD COLUMN     "codigoINVENTE" TEXT,
ADD COLUMN     "fechaRecepcion" TIMESTAMP(3),
ADD COLUMN     "mrr" BOOLEAN,
ADD COLUMN     "nivel1" TEXT,
ADD COLUMN     "nivel2" TEXT,
ADD COLUMN     "nivel3" TEXT;
