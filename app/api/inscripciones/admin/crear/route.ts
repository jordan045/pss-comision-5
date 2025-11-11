import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { InscripcionCarreraCreateAdminSchema } from "@/lib/schemas/inscripciones"
import { auth } from "@/auth"

export async function POST(request: NextRequest) {
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
        { message: "Solo los administrativos pueden crear inscripciones" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = InscripcionCarreraCreateAdminSchema.parse(body)

    // Verificar que el usuario existe y es alumno
    const alumno = await prisma.usuario.findUnique({
      where: { id: validatedData.usuarioId },
      select: { rol: true, activo: true }
    })

    if (!alumno) {
      return NextResponse.json(
        { message: "El alumno no existe" },
        { status: 404 }
      )
    }

    if (alumno.rol !== "ALUMNO") {
      return NextResponse.json(
        { message: "El usuario debe tener rol de alumno" },
        { status: 400 }
      )
    }

    if (!alumno.activo) {
      return NextResponse.json(
        { message: "El alumno no está activo" },
        { status: 400 }
      )
    }

    // Verificar que la carrera existe y está activa
    const carrera = await prisma.carrera.findUnique({
      where: { id: validatedData.carreraId },
      select: { estado: true, planDeEstudioId: true }
    })

    if (!carrera) {
      return NextResponse.json(
        { message: "La carrera no existe" },
        { status: 404 }
      )
    }

    if (carrera.estado !== "ACTIVA") {
      return NextResponse.json(
        { message: "La carrera no está activa" },
        { status: 400 }
      )
    }

    // Verificar que el plan existe y está vigente
    const plan = await prisma.planDeEstudio.findUnique({
      where: { id: validatedData.planDeEstudioId },
      select: { estado: true }
    })

    if (!plan) {
      return NextResponse.json(
        { message: "El plan de estudio no existe" },
        { status: 404 }
      )
    }

    if (plan.estado !== "VIGENTE") {
      return NextResponse.json(
        { message: "El plan de estudio no está vigente" },
        { status: 400 }
      )
    }

    // Verificar que el plan corresponde a la carrera
    if (carrera.planDeEstudioId !== validatedData.planDeEstudioId) {
      return NextResponse.json(
        { message: "El plan de estudio no corresponde a la carrera seleccionada" },
        { status: 400 }
      )
    }

    // Crear la inscripción
    const nuevaInscripcion = await prisma.inscripcionCarrera.create({
      data: {
        usuarioId: validatedData.usuarioId,
        carreraId: validatedData.carreraId,
        planDeEstudioId: validatedData.planDeEstudioId,
        estado: "ACTIVA",
        modalidad: "INSCRIPCION_POR_ADMINISTRATIVO",
      },
      include: {
        usuario: {
          select: { nombre: true, apellido: true, dni: true }
        },
        carrera: {
          select: { nombre: true, codigo: true }
        },
        plan: {
          select: { nombre: true, version: true }
        }
      }
    })

    console.log("Nueva inscripción creada por admin:", nuevaInscripcion)

    return NextResponse.json(nuevaInscripcion, { status: 201 })
  } catch (error) {
    console.error("Error al procesar la inscripción:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "El alumno ya está inscrito en esta carrera" },
          { status: 409 }
        )
      }
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Datos inválidos", error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "No se pudo crear la inscripción. Verifique los datos enviados." },
      { status: 400 }
    )
  }
}
