import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Prisma en Vercel → Node.js runtime

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Body inválido o no es JSON" },
        { status: 400 }
      );
    }

    const { version, estado } = (body as { version?: unknown; estado?: unknown }) ?? {};

    if (typeof version === "undefined" || typeof estado === "undefined") {
      return NextResponse.json(
        { error: "La versión y el estado son requeridos" },
        { status: 400 }
      );
    }

    const planExistente = await prisma.planDeEstudio.findUnique({
      where: { codigo },
    });

    if (!planExistente) {
      return NextResponse.json(
        { error: "Plan de estudio no encontrado" },
        { status: 404 }
      );
    }

    const planActualizado = await prisma.planDeEstudio.update({
      where: { codigo },
      data: {
        // si necesitás castear tipos, hacelo acá
        version: version as any,
        estado: estado as any,
      },
      include: {
        materias: { include: { materia: true } },
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
