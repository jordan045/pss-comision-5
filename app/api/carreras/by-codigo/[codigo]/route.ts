import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// (Opcional pero recomendado con Prisma en Vercel)
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  const { codigo } = params;

  if (!codigo) {
    return NextResponse.json(
      { error: "Código de carrera no proporcionado" },
      { status: 400 }
    );
  }

  try {
    // Con Prisma 5+ no es necesario $connect/$disconnect manual en cada request,
    // pero si lo estás usando en Vercel, no hace daño.
    await prisma.$connect();

    // 1) Traer la carrera por código
    const carrera = await prisma.carrera.findUnique({
      where: { codigo },
    });

    if (!carrera) {
      return NextResponse.json(
        { error: "No se encontró una carrera con ese código" },
        { status: 404 }
      );
    }

    // 2) Traer los planes vinculados a esa carrera + materias anidadas
    const planes = await prisma.planDeEstudio.findMany({
      where: {
        carrera: { codigo }, // filtro por relación (no requiere el nombre del campo inverso en Carrera)
      },
      include: {
        materias: {
          include: { materia: true },
        },
      },
    });

    // 3) Responder con la carrera y un arreglo 'planes'
    return NextResponse.json({ ...carrera, planes });
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
