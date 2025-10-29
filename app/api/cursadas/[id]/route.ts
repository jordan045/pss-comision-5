// app/api/cursadas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cursadas/:id  -> trae los datos de la cursada
// PUT /api/cursadas/:id  -> modifica la cursada

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const cursada = await prisma.cursada.findUnique({
    where: { id: parseInt(id) },
  })

  if (!cursada) {
    return NextResponse.json({ message: "Cursada no encontrada" }, { status: 404 })
  }

  return NextResponse.json(cursada)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await req.json()

  try {
    const updatedCursada = await prisma.cursada.update({
      where: { id: parseInt(id) },
      data: {
        materiaId: body.materiaId,
        docentePrincipalId: body.docentePrincipalId,
        cuatrimestre: body.cuatrimestre,
        anio: body.anio,
        cupoMaximo: body.cupoMaximo,
        cupoActual: body.cupoActual,
        estado: body.estado,
        planDeEstudioId: body.planDeEstudioId,
        observaciones: body.observaciones,
      },
    })

    return NextResponse.json(updatedCursada)
  } catch (error) {
    console.error("Error actualizando cursada:", error)
    return NextResponse.json({ message: "Error al actualizar cursada" }, { status: 500 })
  }
}
