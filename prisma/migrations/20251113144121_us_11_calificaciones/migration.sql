/*
  Warnings:

  - Added the required column `cursadaId` to the `MesaExamen` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotaConceptual" AS ENUM ('APROBADO', 'DESAPROBADO');

-- CreateEnum
CREATE TYPE "EstadoCalificacion" AS ENUM ('BORRADOR', 'DEFINITIVA');

-- AlterTable
ALTER TABLE "MesaExamen" ADD COLUMN     "cursadaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CalificacionFinal" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "mesaExamenId" INTEGER NOT NULL,
    "cursadaId" INTEGER NOT NULL,
    "docenteResponsableId" INTEGER NOT NULL,
    "notaNumerica" INTEGER,
    "notaConceptual" "NotaConceptual",
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" VARCHAR(300),
    "estado" "EstadoCalificacion" NOT NULL DEFAULT 'BORRADOR',

    CONSTRAINT "CalificacionFinal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalificacionFinal_alumnoId_idx" ON "CalificacionFinal"("alumnoId");

-- CreateIndex
CREATE INDEX "CalificacionFinal_mesaExamenId_idx" ON "CalificacionFinal"("mesaExamenId");

-- CreateIndex
CREATE INDEX "CalificacionFinal_cursadaId_idx" ON "CalificacionFinal"("cursadaId");

-- CreateIndex
CREATE INDEX "CalificacionFinal_docenteResponsableId_idx" ON "CalificacionFinal"("docenteResponsableId");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionFinal_alumnoId_mesaExamenId_key" ON "CalificacionFinal"("alumnoId", "mesaExamenId");

-- CreateIndex
CREATE INDEX "MesaExamen_cursadaId_idx" ON "MesaExamen"("cursadaId");

-- AddForeignKey
ALTER TABLE "MesaExamen" ADD CONSTRAINT "MesaExamen_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Cursada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinal" ADD CONSTRAINT "CalificacionFinal_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinal" ADD CONSTRAINT "CalificacionFinal_mesaExamenId_fkey" FOREIGN KEY ("mesaExamenId") REFERENCES "MesaExamen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinal" ADD CONSTRAINT "CalificacionFinal_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Cursada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinal" ADD CONSTRAINT "CalificacionFinal_docenteResponsableId_fkey" FOREIGN KEY ("docenteResponsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
