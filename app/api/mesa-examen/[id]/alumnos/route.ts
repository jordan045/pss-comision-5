import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  EstadoMesaExamen, // <-- Este es el enum que "no encontraba"
} from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    console.log("el id de la mesa es = "+searchParams);

  } catch (error) {
    console.error("Error al obtener mesas de examen:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}