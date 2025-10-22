import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Recomendado con Prisma en Vercel
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { estado } = body ?? {};
    if (typeof estado !== "string") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const materia = await prisma.materia.update({
      where: { id: numericId },
      data: { estado },
    });

    return NextResponse.json({ ok: true, materia });
  } catch (error) {
    console.error("Error al dar de baja materia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
