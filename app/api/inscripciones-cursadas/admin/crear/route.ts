import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/auth"
import { InscripcionCursadaCreateAdminSchema } from "@/lib/schemas/inscripciones-cursadas"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ message: "No autenticado" }, { status: 401 })

    const adminId = parseInt(session.user.id)
    const admin = await prisma.usuario.findUnique({ where: { id: adminId }, select: { rol: true } })
    if (!admin || admin.rol !== "ADMINISTRATIVO") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { usuarioId, cursadaId } = InscripcionCursadaCreateAdminSchema.parse(body)

    // Validar alumno objetivo
    const alumno = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { rol: true, activo: true } })
    if (!alumno || alumno.rol !== "ALUMNO") {
      return NextResponse.json({ message: "El usuario indicado no es un alumno" }, { status: 400 })
    }
    if (!alumno.activo) {
      return NextResponse.json({ message: "El alumno no está activo" }, { status: 400 })
    }

    // Validar cursada
    const cursada = await prisma.cursada.findUnique({
      where: { id: cursadaId },
      include: { materia: true, planDeEstudio: true },
    })
    if (!cursada) return NextResponse.json({ message: "La cursada no existe" }, { status: 404 })
    if (cursada.estado !== "ACTIVA") {
      return NextResponse.json({ message: "La cursada no está activa" }, { status: 400 })
    }
    if (cursada.cupoActual >= cursada.cupoMaximo) {
      return NextResponse.json({ message: "La cursada no tiene cupos disponibles" }, { status: 400 })
    }

    // Debe tener inscripción a carrera activa con plan vigente que coincida
    const inscCarrera = await prisma.inscripcionCarrera.findFirst({
      where: {
        usuarioId,
        estado: "ACTIVA",
        carrera: { estado: "ACTIVA" },
        planDeEstudioId: cursada.planDeEstudioId,
        plan: { estado: "VIGENTE" },
      },
      select: { id: true },
    })
    if (!inscCarrera) {
      return NextResponse.json({ message: "El alumno no está inscripto en una carrera activa con plan vigente compatible" }, { status: 400 })
    }

    // No duplicar por materia
    const yaInscriptoMismaMateria = await prisma.inscripcionCursada.findFirst({
      where: { usuarioId, cursada: { materiaId: cursada.materiaId } },
      select: { id: true },
    })
    if (yaInscriptoMismaMateria) {
      return NextResponse.json({ message: "El alumno ya está inscripto a una cursada de esta materia" }, { status: 409 })
    }

    // TODO: correlativas (reutilizar helper del otro endpoint si se mueve a util). Para no duplicar, volvemos a consultar.
    const correlativas = await prisma.materiaPlan.findMany({
      where: { planDeEstudioId: cursada.planDeEstudioId, materiaId: cursada.materiaId },
      select: { correlativaId: true, tipoCorrelatividad: true },
    })
    const checkCorrelativas = async () => {
      if (correlativas.length === 0) return true
      for (const corr of correlativas) {
        if (!corr.correlativaId) continue
        const inscCorr = await prisma.inscripcionCursada.findMany({
          where: { usuarioId, cursada: { materiaId: corr.correlativaId, planDeEstudioId: cursada.planDeEstudioId } },
          select: { estado: true, resultadoFinal: true },
          orderBy: { id: "desc" },
          take: 1,
        })
        const ultima = inscCorr[0]
        const tipo = corr.tipoCorrelatividad?.toUpperCase()
        if (tipo === "APROBADA") {
          if (!ultima || ultima.resultadoFinal !== "APROBADO") return false
        } else if (tipo === "REGULAR") {
          if (!ultima || ultima.estado !== "FINALIZADA") return false
        } else if (tipo === "CURSADA") {
          if (!ultima || (ultima.estado !== "ACTIVA" && ultima.estado !== "FINALIZADA")) return false
        }
      }
      return true
    }
    if (!(await checkCorrelativas())) {
      return NextResponse.json({ message: "El alumno no cumple con las correlativas" }, { status: 400 })
    }

    const nuevaInscripcion = await prisma.$transaction(async (tx) => {
      const updated = await tx.cursada.update({
        where: { id: cursadaId, cupoActual: { lt: cursada.cupoMaximo } },
        data: { cupoActual: { increment: 1 } },
      })
      if (updated.cupoActual > updated.cupoMaximo) throw new Error("Sin cupos disponibles")

      const insc = await tx.inscripcionCursada.create({
        data: {
          usuarioId,
          cursadaId,
          estado: "ACTIVA",
          modalidad: "INSCRIPCION_POR_ADMINISTRATIVO",
          resultadoFinal: "PENDIENTE",
        },
        include: { cursada: { select: { id: true } } },
      })
      return insc
    })

    return NextResponse.json(nuevaInscripcion, { status: 201 })
  } catch (error) {
    console.error("Error admin crear inscripción a cursada:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos inválidos", errors: error.flatten() }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: "Inscripción duplicada" }, { status: 409 })
      }
    }
    const msg = error instanceof Error ? error.message : "Error desconocido"
    const status = msg.includes("Sin cupos") ? 400 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
