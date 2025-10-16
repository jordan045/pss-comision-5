import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dni = searchParams.get("dni")

    if (!dni) {
      return NextResponse.json({ error: "DNI no especificado" }, { status: 400 })
    }

    // Buscar el usuario
    const usuario = await prisma.usuario.findUnique({
      where: { dni , activo: true},
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(usuario, { status: 200 })
  } catch (error) {
    console.error("Error buscando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
