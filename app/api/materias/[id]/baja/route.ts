import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const { estado } = await req.json()
    if (typeof estado !== "string") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

    const materia = await prisma.materia.update({
      where: { id },
      data: { estado },
    })

    return NextResponse.json({ ok: true, materia })
  } catch (error) {
    console.error("Error al dar de baja materia:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
