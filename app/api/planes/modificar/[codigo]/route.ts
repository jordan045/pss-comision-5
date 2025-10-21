import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { codigo: string } }
) {
  try {
    const { version, estado } = await request.json();
    
    // Validar que tenemos los datos necesarios
    if (!version || !estado) {
      return NextResponse.json(
        { error: "La versión y el estado son requeridos" },
        { status: 400 }
      );
    }

    const planExistente = await prisma.planDeEstudio.findUnique({
      where: {
        codigo: params.codigo,
      },
    });

    if (!planExistente) {
      return NextResponse.json(
        { error: "Plan de estudio no encontrado" },
        { status: 404 }
      );
    }

    const planActualizado = await prisma.planDeEstudio.update({
      where: {
        codigo: params.codigo,
      },
      data: {
        version,
        estado,
      },
      include: {
        materias: {
          include: {
            materia: true,
          },
        },
      },
    });

    return NextResponse.json(planActualizado);
  } catch (error) {
    console.error("Error al modificar plan de estudio:", error);
    return NextResponse.json(
      { error: "Error al modificar el plan de estudio" },
      { status: 500 }
    );
  }
}