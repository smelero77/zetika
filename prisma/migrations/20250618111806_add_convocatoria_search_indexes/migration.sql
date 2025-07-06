-- DropForeignKey
ALTER TABLE "convocatoria_search" DROP CONSTRAINT "convocatoria_search_convocatoria_id_fkey";

-- AlterTable
ALTER TABLE "convocatoria_search" ALTER COLUMN "updated_at" DROP DEFAULT;
