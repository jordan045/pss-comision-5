import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { activo, motivo } = await req.json()
    const id = Number(params.id)
    if (!id || typeof activo !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Actualiza el campo 'activo' del usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: { activo },
    })

    // Opcional: podrías guardar el motivo en otra tabla de auditoría

    return NextResponse.json({ ok: true, usuario: usuarioActualizado })
  } catch (error) {
    console.error("Error dando de baja usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
