// app/api/cursadas/profesor/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/cursadas/profesor - Obtener cursadas del profesor autenticado
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const usuarioId = parseInt(session.user.id)

    // Verificar que el usuario sea profesor
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true },
    })

    if (!usuario || usuario.rol !== "PROFESOR") {
      return NextResponse.json(
        { message: "Solo los profesores pueden acceder a este recurso" },
        { status: 403 }
      )
    }

    // Obtener cursadas donde el profesor es docente principal o adicional
    const cursadas = await prisma.cursada.findMany({
      where: {
        OR: [
          { docentePrincipalId: usuarioId },
          { docentesAdicionales: { some: { id: usuarioId } } },
        ],
      },
      include: {
        materia: { select: { nombre: true, codigo: true } },
        docentePrincipal: { select: { nombre: true, apellido: true } },
      },
      orderBy: { id: "desc" },
    })

    const data = cursadas.map((c) => ({
      id: c.id,
      materia: c.materia.nombre,
      codigoMateria: c.materia.codigo,
      docente: `${c.docentePrincipal.nombre} ${c.docentePrincipal.apellido}`,
      cuatrimestre: c.cuatrimestre,
      anio: c.anio,
      estado: c.estado,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener cursadas del profesor:", error)
    return NextResponse.json(
      { message: "Error al obtener cursadas del profesor" },
      { status: 500 }
    )
  }
}
