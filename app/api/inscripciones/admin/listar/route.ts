import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/inscripciones/admin/listar - Obtener todas las inscripciones (solo admin)
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

    // Verificar que el usuario sea administrativo
    const usuarioAdmin = await prisma.usuario.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { rol: true }
    })

    if (!usuarioAdmin || usuarioAdmin.rol !== "ADMINISTRATIVO") {
      return NextResponse.json(
        { message: "Solo los administrativos pueden consultar todas las inscripciones" },
        { status: 403 }
      )
    }
    
    // Obtener todas las inscripciones
    const inscripciones = await prisma.inscripcionCarrera.findMany({
      include: {
        usuario: {
          select: { 
            nombre: true,
            apellido: true,
            dni: true,
            legajo: true,
          }
        },
        carrera: {
          select: { 
            codigo: true, 
            nombre: true,
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
