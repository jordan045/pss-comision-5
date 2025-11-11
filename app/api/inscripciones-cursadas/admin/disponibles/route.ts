import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/inscripciones-cursadas/admin/disponibles?usuarioId=123
// Lista las cursadas disponibles (activas, con cupo) del plan vigente de la carrera activa del alumno indicado
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ message: "No autenticado" }, { status: 401 })

    // Verificar rol admin
    const adminId = parseInt(session.user.id)
    const admin = await prisma.usuario.findUnique({ where: { id: adminId }, select: { rol: true } })
    if (!admin || admin.rol !== "ADMINISTRATIVO") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const usuarioIdParam = searchParams.get("usuarioId")
    if (!usuarioIdParam) {
      return NextResponse.json({ message: "usuarioId es requerido" }, { status: 400 })
    }
    const usuarioId = parseInt(usuarioIdParam)

    // Verificar inscripción activa a carrera con plan vigente
    const inscCarrera = await prisma.inscripcionCarrera.findFirst({
      where: {
        usuarioId,
        estado: "ACTIVA",
        carrera: { estado: "ACTIVA" },
        plan: { estado: "VIGENTE" },
      },
      select: { planDeEstudioId: true },
    })

    if (!inscCarrera) {
      return NextResponse.json({ message: "El alumno no tiene una carrera activa con plan vigente" }, { status: 400 })
    }

    const planDeEstudioId = inscCarrera.planDeEstudioId

    const cursadas = await prisma.cursada.findMany({
      where: { planDeEstudioId, estado: "ACTIVA" },
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
        docentePrincipal: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: [{ anio: "desc" }, { cuatrimestre: "asc" }],
    })

    const yaInscriptas = await prisma.inscripcionCursada.findMany({
      where: { usuarioId },
      select: { cursadaId: true },
    })
    const setYa = new Set<number>(yaInscriptas.map((i) => i.cursadaId))

    const data = cursadas
      .filter((c) => c.cupoActual < c.cupoMaximo && !setYa.has(c.id))
      .map((c) => ({
        id: c.id,
        label: `${c.materia.codigo} - ${c.materia.nombre} | ${c.anio} - ${c.cuatrimestre}`,
        materiaId: c.materiaId,
        cuatrimestre: c.cuatrimestre,
        anio: c.anio,
        cupoDisponible: Math.max(0, c.cupoMaximo - c.cupoActual),
      }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error admin disponibles cursadas:", error)
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}
