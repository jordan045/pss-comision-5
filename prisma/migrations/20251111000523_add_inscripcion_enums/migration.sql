/*
  Warnings:

  - The `estado` column on the `InscripcionCarrera` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "ModalidadInscripcion" AS ENUM ('INSCRIPCION_POR_ALUMNO', 'INSCRIPCION_POR_ADMINISTRATIVO');

-- AlterTable
ALTER TABLE "InscripcionCarrera" ADD COLUMN     "modalidad" "ModalidadInscripcion" NOT NULL DEFAULT 'INSCRIPCION_POR_ALUMNO',
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoInscripcion" NOT NULL DEFAULT 'ACTIVA';
