import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClient, EstadoCursada, Cuatrimestre } from "@prisma/client";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const materia = searchParams.get("materia")
  const cuatrimestre = searchParams.get("cuatrimestre")
  const carrera = searchParams.get("carrera")
  const estado = searchParams.get("estado")

  try {
    const cursadas = await prisma.cursada.findMany({
      where: {
  ...(estado ? { estado: estado.toUpperCase() as EstadoCursada } : {}),
  ...(cuatrimestre ? { cuatrimestre: cuatrimestre.toUpperCase() as Cuatrimestre } : {}),
  ...(materia ? { materiaId: Number(materia) } : {}),
  ...(carrera
    ? {
        planDeEstudio: {
          carreras: {
            some: { id: Number(carrera) },
          },
        },
      }
    : {}),
}
,
      include: {
        materia: { select: { nombre: true } },
        planDeEstudio: {
          select: {
            carreras: { select: { nombre: true, id: true } },
          },
        },
        docentePrincipal: { select: { nombre: true, id: true } },
      },
      orderBy: { id: "asc" },
    })

    return NextResponse.json(cursadas)
  } catch (error) {
    console.error("Error consultando cursadas:", error)
    return NextResponse.json(
      { error: "Error al consultar las cursadas" },
      { status: 500 }
    )
  }
}
