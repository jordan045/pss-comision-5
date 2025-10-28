-- CreateEnum
CREATE TYPE "Cuatrimestre" AS ENUM ('PRIMERO', 'SEGUNDO');

-- CreateEnum
CREATE TYPE "EstadoCursada" AS ENUM ('ACTIVA', 'CERRADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Cursada" (
    "id" SERIAL NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "planDeEstudioId" INTEGER NOT NULL,
    "docentePrincipalId" INTEGER NOT NULL,
    "cuatrimestre" "Cuatrimestre" NOT NULL,
    "anio" INTEGER NOT NULL,
    "cupoMaximo" INTEGER NOT NULL,
    "cupoActual" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoCursada" NOT NULL DEFAULT 'ACTIVA',
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cursada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocentesAdicionales" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DocentesAdicionales_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cursada_materiaId_docentePrincipalId_cuatrimestre_anio_key" ON "Cursada"("materiaId", "docentePrincipalId", "cuatrimestre", "anio");

-- CreateIndex
CREATE INDEX "_DocentesAdicionales_B_index" ON "_DocentesAdicionales"("B");

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_planDeEstudioId_fkey" FOREIGN KEY ("planDeEstudioId") REFERENCES "PlanDeEstudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_docentePrincipalId_fkey" FOREIGN KEY ("docentePrincipalId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocentesAdicionales" ADD CONSTRAINT "_DocentesAdicionales_A_fkey" FOREIGN KEY ("A") REFERENCES "Cursada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocentesAdicionales" ADD CONSTRAINT "_DocentesAdicionales_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
