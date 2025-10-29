import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { estado } = await req.json()

    // Validar que el estado sea válido
    const estadosValidos = ["CERRADA", "CANCELADA"]
    if (!estadosValidos.includes(estado?.toUpperCase())) {
      return NextResponse.json(
        { message: "El estado debe ser 'CERRADA' o 'CANCELADA'." },
        { status: 400 }
      )
    }

    // Buscar si existe la cursada
    const cursada = await prisma.cursada.findUnique({
      where: { id: parseInt(id) },
    })

    if (!cursada) {
      return NextResponse.json({ message: "Cursada no encontrada." }, { status: 404 })
    }

    // Actualizar el estado
    const updated = await prisma.cursada.update({
      where: { id: parseInt(id) },
      data: { estado: estado.toUpperCase() },
    })

    return NextResponse.json({
      message: `Estado actualizado correctamente a '${estado.toUpperCase()}'.`,
      cursada: updated,
    })
  } catch (error: any) {
    console.error("Error al actualizar el estado:", error)
    return NextResponse.json(
      { message: "Error al actualizar el estado de la cursada." },
      { status: 500 }
    )
  }
}
