import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// (Opcional pero recomendado con Prisma en Vercel)
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
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
      include: {
        planes: {
          include: {
            materias: { include: { materia: true } },
          },
        },
      },
    });

    if (!carrera) {
      return NextResponse.json(
        { error: "No se encontró una carrera con ese código" },
        { status: 404 }
      );
    }

    return NextResponse.json(carrera);
  } catch (error) {
    console.error("Error al buscar carrera:", error);
    return NextResponse.json(
      {
        error:
          "Error al buscar la carrera. Verifique la conexión a la base de datos.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
