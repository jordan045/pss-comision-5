import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await context.params;

  if (!codigo) {
    return NextResponse.json(
      { error: "Código de carrera no proporcionado" },
      { status: 400 }
    );
  }

  try {
    await prisma.$connect();

    const carrera = await prisma.carrera.findUnique({
      where: { codigo },
    });

    if (!carrera) {
      return NextResponse.json(
        { error: "No se encontró una carrera con ese código" },
        { status: 404 }
      );
    }

    const planes = await prisma.planDeEstudio.findMany({
      where: { carrera: { codigo } },
      include: {
        materias: { include: { materia: true } },
      },
    });

    return NextResponse.json({ ...carrera, planes });
  } catch (error) {
    console.error("Error al buscar carrera:", error);
    return NextResponse.json(
      { error: "Error al buscar la carrera. Verifique la base de datos." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
