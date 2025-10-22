import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

// Configurar Prisma para no mostrar los logs de consultas
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await context.params;
    console.log('Buscando plan con código:', codigo);

    const plan = await prisma.planDeEstudio.findUnique({
      where: {
        codigo: codigo,
      },
      include: {
        carrera: true,
        materias: {
          include: {
            materia: true,
          },
        },
      },
    });

    console.log('Plan encontrado en el backend:', JSON.stringify(plan, null, 2));

    if (!plan) {
      return NextResponse.json(
        { error: "Plan de estudio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error al buscar plan de estudio:", error);
    return NextResponse.json(
      { error: "Error al buscar plan de estudio" },
      { status: 500 }
    );
  }
}