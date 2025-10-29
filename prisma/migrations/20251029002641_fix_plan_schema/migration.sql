/*
  Warnings:

  - You are about to drop the column `carreraId` on the `PlanDeEstudio` table. All the data in the column will be lost.
  - Added the required column `planDeEstudioId` to the `Carrera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `PlanDeEstudio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PlanDeEstudio" DROP CONSTRAINT "PlanDeEstudio_carreraId_fkey";

-- AlterTable
ALTER TABLE "Carrera" ADD COLUMN     "planDeEstudioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlanDeEstudio" DROP COLUMN "carreraId",
ADD COLUMN     "nombre" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Carrera" ADD CONSTRAINT "Carrera_planDeEstudioId_fkey" FOREIGN KEY ("planDeEstudioId") REFERENCES "PlanDeEstudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
