-- CreateEnum
CREATE TYPE "EstadoMesaExamen" AS ENUM ('ABIERTA', 'CERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoInscripcionExamen" AS ENUM ('INSCRIPTO', 'APROBADO', 'DESAPROBADO', 'AUSENTE');

-- CreateTable
CREATE TABLE "MesaExamen" (
    "id" SERIAL NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cierreInscripcion" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoMesaExamen" NOT NULL DEFAULT 'ABIERTA',
    "libro" TEXT,
    "folio" TEXT,
    "observaciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesaExamen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscripcionMesaExamen" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "mesaExamenId" INTEGER NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" INTEGER,
    "estado" "EstadoInscripcionExamen" NOT NULL DEFAULT 'INSCRIPTO',
    "observaciones" TEXT,

    CONSTRAINT "InscripcionMesaExamen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MesaExamen_materiaId_idx" ON "MesaExamen"("materiaId");

-- CreateIndex
CREATE INDEX "InscripcionMesaExamen_usuarioId_idx" ON "InscripcionMesaExamen"("usuarioId");

-- CreateIndex
CREATE INDEX "InscripcionMesaExamen_mesaExamenId_idx" ON "InscripcionMesaExamen"("mesaExamenId");

-- CreateIndex
CREATE UNIQUE INDEX "InscripcionMesaExamen_usuarioId_mesaExamenId_key" ON "InscripcionMesaExamen"("usuarioId", "mesaExamenId");

-- AddForeignKey
ALTER TABLE "MesaExamen" ADD CONSTRAINT "MesaExamen_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionMesaExamen" ADD CONSTRAINT "InscripcionMesaExamen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionMesaExamen" ADD CONSTRAINT "InscripcionMesaExamen_mesaExamenId_fkey" FOREIGN KEY ("mesaExamenId") REFERENCES "MesaExamen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
