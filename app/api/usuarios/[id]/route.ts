import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params es Promise
) {
  try {
    const { id } = await context.params;        // 👈 await acá
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await req.json()

    const usuarioExistente = await prisma.usuario.findUnique({ where: { id: userId } })
    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const rol = data.rol?.toUpperCase() ?? usuarioExistente.rol

    const duplicado = await prisma.usuario.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          { OR: [{ email: data.email }, { dni: data.dni }, { cuil: data.cuil ?? undefined }] },
        ],
      },
    })
    if (duplicado) {
      return NextResponse.json(
        { error: "DNI, CUIL o Email ya existen en otro usuario" },
        { status: 409 }
      )
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        cuil: data.cuil ?? null,
        email: data.email,
        rol,
        obraSocial: rol === "ADMINISTRATIVO" ? data.obra_social ?? null : null,
        tituloProfesional: rol === "PROFESOR" ? data.tituloProfesional ?? null : null,
        antiguedad: rol === "PROFESOR" ? data.antiguedad ?? null : null,
        legajo: rol === "ALUMNO" ? data.legajo ?? null : null,
        fechaIngreso: rol === "ALUMNO" ? data.fechaIngreso ?? new Date() : null,
      },
    })

    return NextResponse.json({ ok: true, usuario: usuarioActualizado }, { status: 200 })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
