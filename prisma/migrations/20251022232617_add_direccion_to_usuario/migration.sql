-- AlterTable
ALTER TABLE "MateriaPlan" ADD COLUMN     "correlativaId" INTEGER,
ADD COLUMN     "tipoCorrelatividad" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "direccion" TEXT;

-- CreateIndex
CREATE INDEX "MateriaPlan_correlativaId_idx" ON "MateriaPlan"("correlativaId");

-- AddForeignKey
ALTER TABLE "MateriaPlan" ADD CONSTRAINT "MateriaPlan_correlativaId_fkey" FOREIGN KEY ("correlativaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
