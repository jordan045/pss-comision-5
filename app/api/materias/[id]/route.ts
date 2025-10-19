import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { MateriaBaseSchema } from "@/lib/schemas/materias"

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const materiaId = parseInt(id, 10)
    if (isNaN(materiaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const data = await req.json()
    const validated = MateriaBaseSchema.parse(data)

    // Verificar duplicados por código y nombre (excluyendo el actual)
    const duplicado = await prisma.materia.findFirst({
      where: {
        AND: [
          { id: { not: materiaId } },
          {
            OR: [
              { codigo: validated.codigo },
              { nombre: validated.nombre },
            ],
          },
        ],
      },
    })
    if (duplicado) {
      return NextResponse.json(
        { error: "Ya existe una materia con ese código o nombre" },
        { status: 409 }
      )
    }

    const materiaActualizada = await prisma.materia.update({
      where: { id: materiaId },
      data: {
        nombre: validated.nombre,
        descripcion: validated.descripcion,
        creditos: validated.creditos,
        cargaHoraria: validated.carga_horaria_semanal,
        estado: validated.estado,
        // El código no se actualiza (por convención)
      },
    })

    return NextResponse.json({ ok: true, materia: materiaActualizada }, { status: 200 })
  } catch (error) {
    console.error("Error actualizando materia:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
