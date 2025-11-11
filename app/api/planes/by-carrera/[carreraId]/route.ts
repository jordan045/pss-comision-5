import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/planes/by-carrera/[carreraId]?estado=VIGENTE
export async function GET(
  req: NextRequest,
  { params }: { params: { carreraId: string } }
) {
  const carreraId = parseInt(params.carreraId, 10)
  
  if (isNaN(carreraId)) {
    return NextResponse.json(
      { message: "ID de carrera inválido" },
      { status: 400 }
    )
  }

  const estado = req.nextUrl.searchParams.get("estado") ?? undefined

  try {
    // Primero verificamos que la carrera existe
    const carrera = await prisma.carrera.findUnique({
      where: { id: carreraId },
      select: { planDeEstudioId: true }
    })

    if (!carrera) {
      return NextResponse.json(
        { message: "Carrera no encontrada" },
        { status: 404 }
      )
    }

    // Obtenemos el plan de estudio asociado a la carrera
    const plan = await prisma.planDeEstudio.findUnique({
      where: { 
        id: carrera.planDeEstudioId,
        ...(estado ? { estado } : {})
      },
      select: { 
        id: true, 
        codigo: true, 
        nombre: true, 
        version: true,
        estado: true,
      },
    })

    // Si el plan no existe o no cumple con el filtro de estado, retornamos array vacío
    if (!plan) {
      return NextResponse.json([])
    }

    // Retornamos el plan en formato de array para mantener consistencia
    const items = [{
      id: plan.id,
      label: `${plan.codigo} - ${plan.nombre} (v${plan.version})`,
    }]

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error al obtener planes:", error)
    return NextResponse.json(
      { message: "Error al obtener planes de estudio" },
      { status: 500 }
    )
  }
}
