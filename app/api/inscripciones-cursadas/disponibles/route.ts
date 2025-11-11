import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/inscripciones-cursadas/disponibles
// Devuelve cursadas ACTIVAS con cupo disponible del plan vigente
// del alumno autenticado y de una carrera ACTIVA en la que esté inscripto.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const usuarioId = parseInt(session.user.id)

    // Buscar inscripción de carrera ACTIVA del alumno con plan VIGENTE
    const inscripcionCarrera = await prisma.inscripcionCarrera.findFirst({
      where: {
        usuarioId,
        estado: "ACTIVA",
        carrera: { estado: "ACTIVA" },
        plan: { estado: "VIGENTE" },
      },
      select: { planDeEstudioId: true },
    })

    if (!inscripcionCarrera) {
      return NextResponse.json(
        { message: "No tenés una carrera activa con plan vigente." },
        { status: 400 }
      )
    }

    const planDeEstudioId = inscripcionCarrera.planDeEstudioId

    // Cursadas activas del plan
    const cursadas = await prisma.cursada.findMany({
      where: { planDeEstudioId, estado: "ACTIVA" },
      include: {
        materia: { select: { id: true, nombre: true, codigo: true } },
        docentePrincipal: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: [{ anio: "desc" }, { cuatrimestre: "asc" }],
    })

    // Obtener cursadas ya inscriptas por el alumno para evitar duplicar
    const yaInscriptas = await prisma.inscripcionCursada.findMany({
      where: { usuarioId },
      select: { cursadaId: true },
    })
  const setYa = new Set<number>(yaInscriptas.map((i: { cursadaId: number }) => i.cursadaId))

    const data = cursadas
      .filter(c => c.cupoActual < c.cupoMaximo && !setYa.has(c.id))
      .map(c => ({
        id: c.id,
        label: `${c.materia.codigo} - ${c.materia.nombre} | ${c.anio} - ${c.cuatrimestre}`,
        materiaId: c.materiaId,
        cuatrimestre: c.cuatrimestre,
        anio: c.anio,
        cupoDisponible: Math.max(0, c.cupoMaximo - c.cupoActual),
      }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al listar cursadas disponibles:", error)
    return NextResponse.json(
      { message: "Error al obtener cursadas disponibles" },
      { status: 500 }
    )
  }
}
