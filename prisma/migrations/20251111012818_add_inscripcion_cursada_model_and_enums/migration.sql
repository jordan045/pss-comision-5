-- CreateEnum
CREATE TYPE "EstadoInscripcionCursada" AS ENUM ('ACTIVA', 'BAJA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "ResultadoFinal" AS ENUM ('APROBADO', 'DESAPROBADO', 'PENDIENTE');

-- CreateTable
CREATE TABLE "InscripcionCursada" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "cursadaId" INTEGER NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoInscripcionCursada" NOT NULL DEFAULT 'ACTIVA',
    "modalidad" "ModalidadInscripcion" NOT NULL DEFAULT 'INSCRIPCION_POR_ALUMNO',
    "resultadoFinal" "ResultadoFinal" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "InscripcionCursada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InscripcionCursada_usuarioId_idx" ON "InscripcionCursada"("usuarioId");

-- CreateIndex
CREATE INDEX "InscripcionCursada_cursadaId_idx" ON "InscripcionCursada"("cursadaId");

-- CreateIndex
CREATE UNIQUE INDEX "InscripcionCursada_usuarioId_cursadaId_key" ON "InscripcionCursada"("usuarioId", "cursadaId");

-- AddForeignKey
ALTER TABLE "InscripcionCursada" ADD CONSTRAINT "InscripcionCursada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionCursada" ADD CONSTRAINT "InscripcionCursada_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Cursada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
