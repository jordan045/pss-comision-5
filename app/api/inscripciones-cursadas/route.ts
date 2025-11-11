import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/inscripciones-cursadas - Obtener inscripciones a cursadas del usuario autenticado
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const usuarioId = parseInt(session.user.id)

    const inscripciones = await prisma.inscripcionCursada.findMany({
      where: { usuarioId },
      include: {
        cursada: {
          select: {
            id: true,
            anio: true,
            cuatrimestre: true,
            materia: { select: { codigo: true, nombre: true } },
          },
        },
      },
      orderBy: { fechaInscripcion: "desc" },
    })

    return NextResponse.json(inscripciones)
  } catch (error) {
    console.error("Error al obtener inscripciones a cursadas:", error)
    return NextResponse.json({ message: "Error al obtener inscripciones a cursadas" }, { status: 500 })
  }
}
