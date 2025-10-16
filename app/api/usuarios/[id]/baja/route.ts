import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 params asíncrono en Next 15
) {
  try {
    const { id } = await context.params            // 👈 await
    const { activo, motivo } = await req.json()

    const userId = Number(id)
    if (!Number.isFinite(userId) || typeof activo !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: { activo },
    })

    // TODO opcional: persistir 'motivo' en tabla de auditoría

    return NextResponse.json({ ok: true, usuario: usuarioActualizado })
  } catch (error) {
    console.error("Error dando de baja usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
