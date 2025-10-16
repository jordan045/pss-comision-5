/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cuil]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[legajo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "antiguedad" INTEGER,
ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "cuil" TEXT,
ADD COLUMN     "dni" TEXT NOT NULL,
ADD COLUMN     "fechaIngreso" TIMESTAMP(3),
ADD COLUMN     "legajo" TEXT,
ADD COLUMN     "obraSocial" TEXT,
ADD COLUMN     "tituloProfesional" TEXT;

-- CreateTable
CREATE TABLE "Carrera" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "nivelAcademico" TEXT NOT NULL,
    "duracionAnios" INTEGER NOT NULL,
    "facultad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDeEstudio" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'VIGENTE',
    "carreraId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanDeEstudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscripcionCarrera" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "planDeEstudioId" INTEGER NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "InscripcionCarrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MateriaPlan" (
    "materiaId" INTEGER NOT NULL,
    "planDeEstudioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "MateriaPlan_pkey" PRIMARY KEY ("materiaId","planDeEstudioId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_codigo_key" ON "Carrera"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDeEstudio_codigo_key" ON "PlanDeEstudio"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_nombre_key" ON "Materia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "InscripcionCarrera_usuarioId_carreraId_key" ON "InscripcionCarrera"("usuarioId", "carreraId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_dni_key" ON "Usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cuil_key" ON "Usuario"("cuil");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_legajo_key" ON "Usuario"("legajo");

-- AddForeignKey
ALTER TABLE "PlanDeEstudio" ADD CONSTRAINT "PlanDeEstudio_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCarrera" ADD CONSTRAINT "InscripcionCarrera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCarrera" ADD CONSTRAINT "InscripcionCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCarrera" ADD CONSTRAINT "InscripcionCarrera_planDeEstudioId_fkey" FOREIGN KEY ("planDeEstudioId") REFERENCES "PlanDeEstudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriaPlan" ADD CONSTRAINT "MateriaPlan_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriaPlan" ADD CONSTRAINT "MateriaPlan_planDeEstudioId_fkey" FOREIGN KEY ("planDeEstudioId") REFERENCES "PlanDeEstudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
