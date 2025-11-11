// app/api/cursadas/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const cursadas = await prisma.cursada.findMany({
    include: {
      materia: { select: { nombre: true } },
      docentePrincipal: { select: { nombre: true, apellido: true } },
    },
    orderBy: { id: "desc" },
  })

  const data = cursadas.map((c) => ({
    id: c.id,
    materia: c.materia.nombre,
    docente: `${c.docentePrincipal.nombre} ${c.docentePrincipal.apellido}`,
    cuatrimestre: c.cuatrimestre,
    anio: c.anio,
    estado: c.estado,
  }))

  return NextResponse.json(data)
}
