import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/inscripciones - Obtener inscripciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      )
    }

    const usuarioId = parseInt(session.user.id)
    
    // Obtener inscripciones del usuario
    const inscripciones = await prisma.inscripcionCarrera.findMany({
      where: { usuarioId },
      include: {
        carrera: {
          select: { 
            codigo: true, 
            nombre: true,
            titulo: true,
          }
        },
        plan: {
          select: { 
            codigo: true,
            nombre: true, 
            version: true,
          }
        }
      },
      orderBy: { fechaInscripcion: "desc" }
    })

    return NextResponse.json(inscripciones)
  } catch (error) {
    console.error("Error al obtener inscripciones:", error)
    return NextResponse.json(
      { message: "Error al obtener inscripciones" },
      { status: 500 }
    )
  }
}
