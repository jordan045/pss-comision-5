import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
    const carrera = await prisma.carrera.findUnique({
      where: { codigo },
    });

    if (!carrera) {
      return NextResponse.json(
        { error: "No se encontró una carrera con ese código" },
        { status: 404 }
      );
    }

    await prisma.carrera.delete({
      where: { codigo },
    });

    return NextResponse.json(
      { message: "Carrera eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar carrera:", error);
    return NextResponse.json(
      { error: "Error al eliminar la carrera" },
      { status: 500 }
    );
  }
}