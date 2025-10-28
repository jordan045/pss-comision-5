import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

export async function GET(
  _req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params;

    const plan = await prisma.planDeEstudio.findUnique({
      where: { codigo },
      include: {
        carreras: true,                 // ✅ era 'carrera: true' (incorrecto)
        materias: { include: { materia: true } },
        // si querés: inscripciones: true, cursadas: true
      },
    });

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
