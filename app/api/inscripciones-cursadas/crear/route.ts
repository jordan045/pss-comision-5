import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/auth"
import { InscripcionCursadaCreateSchema } from "@/lib/schemas/inscripciones-cursadas"

// Helper: verifica correlativas aprobadas o condición mínima
async function cumpleCorrelativas(usuarioId: number, materiaId: number, planDeEstudioId: number) {
  // Buscar correlativas definidas en MateriaPlan para la materia dentro del plan
  const correlativas = await prisma.materiaPlan.findMany({
    where: { planDeEstudioId, materiaId },
    select: { correlativaId: true, tipoCorrelatividad: true },
  })

  // Si no hay correlativas, cumple
  if (correlativas.length === 0) return true

  // Reglas mínimas: si exige APROBADA -> resultadoFinal APROBADO; si REGULAR -> estado FINALIZADA;
  // si CURSADA -> debe tener una inscripción a cursada para esa materia con estado ACTIVA o FINALIZADA.
  // Nota: como no existe "historial de notas" por materia, inferimos desde InscripcionCursada

  for (const corr of correlativas) {
    if (!corr.correlativaId) continue

    // Obtener inscripciones a cursadas de la materia correlativa
    const inscCorr = await prisma.inscripcionCursada.findMany({
      where: {
        usuarioId,
        cursada: { materiaId: corr.correlativaId, planDeEstudioId },
      },
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const usuarioId = parseInt(session.user.id)

    // Verificar que el usuario sea alumno
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { rol: true, activo: true } })
    if (!usuario || usuario.rol !== "ALUMNO") {
      return NextResponse.json({ message: "Solo los alumnos pueden inscribirse a cursadas" }, { status: 403 })
    }
    if (!usuario.activo) {
      return NextResponse.json({ message: "El usuario no está activo" }, { status: 400 })
    }

    const body = await request.json()
    const { cursadaId } = InscripcionCursadaCreateSchema.parse(body)

    // Buscar cursada y validar estado/cupo
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

    // Verificar inscripción de carrera activa y plan vigente que coincida con el de la cursada
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
      return NextResponse.json(
        { message: "Debés estar inscripto en una carrera activa con plan vigente para esta cursada" },
        { status: 400 }
      )
    }

    // No inscribirse dos veces a la misma materia: revisar inscripciones a cursadas de esa materia
    const yaInscriptoMismaMateria = await prisma.inscripcionCursada.findFirst({
      where: { usuarioId, cursada: { materiaId: cursada.materiaId } },
      select: { id: true },
    })
    if (yaInscriptoMismaMateria) {
      return NextResponse.json(
        { message: "Ya estás inscripto a una cursada de esta materia" },
        { status: 409 }
      )
    }

    // Chequear correlativas
    const okCorrelativas = await cumpleCorrelativas(usuarioId, cursada.materiaId, cursada.planDeEstudioId)
    if (!okCorrelativas) {
      return NextResponse.json(
        { message: "No cumplís con las correlativas requeridas" },
        { status: 400 }
      )
    }

    // Crear inscripción e incrementar cupo en transacción
    const nuevaInscripcion = await prisma.$transaction(async (tx) => {
      // Incrementar cupo si sigue habiendo lugar (check and set)
      const updated = await tx.cursada.update({
        where: { id: cursadaId, cupoActual: { lt: cursada.cupoMaximo } },
        data: { cupoActual: { increment: 1 } },
      })

      if (updated.cupoActual > updated.cupoMaximo) {
        throw new Error("Sin cupos disponibles")
      }

      // Crear InscripcionCursada
      const insc = await tx.inscripcionCursada.create({
        data: {
          usuarioId,
          cursadaId,
          estado: "ACTIVA",
          modalidad: "INSCRIPCION_POR_ALUMNO",
          resultadoFinal: "PENDIENTE",
        },
        include: {
          cursada: { select: { id: true, materia: { select: { nombre: true, codigo: true } } } },
        },
      })

      return insc
    })

    return NextResponse.json(nuevaInscripcion, { status: 201 })
  } catch (error) {
    console.error("Error al crear inscripción a cursada:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos inválidos", errors: error.flatten() }, { status: 400 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Ya estás inscripto a esta cursada" },
          { status: 409 }
        )
      }
    }

    const msg = error instanceof Error ? error.message : "Error desconocido"
    const status = msg.includes("Sin cupos") ? 400 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
