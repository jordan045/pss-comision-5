import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de que esta ruta sea correcta para tu instancia de Prisma

/**
 * @swagger
 * /api/materias:
 *   get:
 *     summary: Obtiene todas las materias
 *     responses:
 *       200:
 *         description: Lista de todas las materias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Materia'
 *       500:
 *         description: Error interno del servidor.
 */
export async function GET() {
  try {
    const materias = await prisma.materia.findMany({
      // Puedes añadir select, include, where, orderBy si necesitas filtrar o seleccionar campos específicos
      select: {
        id: true,
        codigo: true,
        nombre: true,
        creditos: true,
        cargaHoraria: true,
        descripcion: true,
        estado: true,
      },
    });
    return NextResponse.json(materias, { status: 200 });
  } catch (error) {
    console.error("Error al obtener las materias:", error);
    return NextResponse.json({ message: "Error interno del servidor al obtener las materias." }, { status: 500 });
  }
}