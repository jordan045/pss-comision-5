import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoCursada } from "@prisma/client"; // 👈 importá el enum

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next 15: params es Promise
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const estadoRaw = String(body?.estado ?? "").toUpperCase().trim();

    // Mapeo seguro string -> enum
    const estadoMap: Record<string, EstadoCursada> = {
      CERRADA: EstadoCursada.CERRADA,
      CANCELADA: EstadoCursada.CANCELADA,
    };

    const estadoEnum = estadoMap[estadoRaw];
    if (!estadoEnum) {
      return NextResponse.json(
        { message: "El estado debe ser 'CERRADA' o 'CANCELADA'." },
        { status: 400 }
      );
    }

    const idNum = Number.parseInt(id, 10);
    if (!Number.isInteger(idNum)) {
      return NextResponse.json({ message: "ID inválido." }, { status: 400 });
    }

    const cursada = await prisma.cursada.findUnique({ where: { id: idNum } });
    if (!cursada) {
      return NextResponse.json({ message: "Cursada no encontrada." }, { status: 404 });
    }

    const updated = await prisma.cursada.update({
      where: { id: idNum },
      // Cualquiera de las dos formas es válida. Elegí UNA:
      data: { estado: estadoEnum },          // ✅ pasa enum, NO string
      // data: { estado: { set: estadoEnum } } // ✅ alternativa explícita
    });

    return NextResponse.json({
      message: `Estado actualizado correctamente a '${estadoEnum}'.`,
      cursada: updated,
    });
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    return NextResponse.json(
      { message: "Error al actualizar el estado de la cursada." },
      { status: 500 }
    );
  }
}
