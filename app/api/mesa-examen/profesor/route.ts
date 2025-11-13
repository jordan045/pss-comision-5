import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  EstadoMesaExamen, 
} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const docenteId = searchParams.get("docenteId");
    const estado = searchParams.get("estado") as EstadoMesaExamen;

    if (!docenteId || !estado) {
      return NextResponse.json(
        { message: "Se requieren los parámetros 'docenteId' y 'estado'" },
        { status: 400 }
      );
    }
    const docenteIdNum = parseInt(docenteId, 10);
    if (isNaN(docenteIdNum)) {
      return NextResponse.json(
        { message: "El 'docenteId' debe ser un número" },
        { status: 400 }
      );
    }

    if (!Object.values(EstadoMesaExamen).includes(estado)) {
      return NextResponse.json(
        { message: "El 'estado' no es válido" },
        { status: 400 }
      );
    }

    const mesas = await prisma.mesaExamen.findMany({
      where: {
        cursada: {
          docentePrincipalId: docenteIdNum,
        },
        estado: estado,
      },
      include: {
        materia: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const mesasFormateadas = mesas.map((mesa) => ({
      id: mesa.id,
      label: `${mesa.materia.nombre} - ${new Date(
        mesa.fecha
      ).toLocaleDateString()}`,
      cursadaId: mesa.cursadaId,
    }));

    return NextResponse.json(mesasFormateadas);
    
  } catch (error) {
    console.error("Error al obtener mesas de examen:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}