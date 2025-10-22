import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : (v as string | null)

// 🔹 helper para strings opcionales con trim
const strOrNull = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : null

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = Number(id)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const raw = await req.json()

    // 🔧 Normalización de entrada
    const data = {
      nombre: raw?.nombre ?? null,
      apellido: raw?.apellido ?? null,
      dni: typeof raw?.dni === "string" ? raw.dni.trim() : null,
      cuil: emptyToNull(raw?.cuil), // "" → null
      email:
        typeof raw?.email === "string"
          ? raw.email.trim().toLowerCase()
          : null,
      rol: typeof raw?.rol === "string" ? raw.rol.toUpperCase() : null,
      obraSocial: emptyToNull(raw?.obraSocial), // usar camelCase
      tituloProfesional: raw?.tituloProfesional ?? null,
      antiguedad: raw?.antiguedad ?? null,
      legajo: raw?.legajo ?? null,
      fechaIngreso: raw?.fechaIngreso ?? null,

      // 🔹 NUEVO: direccion opcional ("", undefined → null) con trim
      direccion: strOrNull(raw?.direccion),
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, rol: true },
    })
    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const rol = data.rol?.toUpperCase() ?? usuarioExistente.rol

    // 🚫 OR solo con campos realmente presentes (evita "" y undefined)
    const orFilters: any[] = []
    if (data.email) orFilters.push({ email: data.email })
    if (data.dni) orFilters.push({ dni: data.dni })
    if (data.cuil !== null && typeof data.cuil === "string" && data.cuil.length > 0) {
      orFilters.push({ cuil: data.cuil })
    }

    if (orFilters.length > 0) {
      const duplicado = await prisma.usuario.findFirst({
        where: {
          AND: [{ id: { not: userId } }, { OR: orFilters }],
        },
        select: { id: true, email: true, dni: true, cuil: true },
      })
      if (duplicado) {
        return NextResponse.json(
          { error: "DNI, CUIL o Email ya existen en otro usuario" },
          { status: 409 }
        )
      }
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombre: data.nombre ?? undefined,
        apellido: data.apellido ?? undefined,
        dni: data.dni ?? undefined,
        cuil: data.cuil, // null permitido
        email: data.email ?? undefined,
        rol,

        // ✅ obraSocial camelCase
        obraSocial: rol === "ADMINISTRATIVO" ? (data.obraSocial as string | null) : null,

        // 🔹 NUEVO: persistir direccion (null o string con trim)
        direccion: data.direccion ?? undefined,

        tituloProfesional: rol === "PROFESOR" ? (data.tituloProfesional as string | null) : null,
        antiguedad: rol === "PROFESOR" ? (data.antiguedad as number | null) : null,

        legajo: rol === "ALUMNO" ? (data.legajo as string | null) : null,
        fechaIngreso:
          rol === "ALUMNO"
            ? (data.fechaIngreso ? new Date(data.fechaIngreso) : new Date())
            : null,
      },
    })

    return NextResponse.json({ ok: true, usuario: usuarioActualizado }, { status: 200 })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
