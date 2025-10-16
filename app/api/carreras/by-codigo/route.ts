import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CarreraCodigoSchema } from "@/lib/schemas/carreras"; 

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoQuery = searchParams.get("codigo");

    const validated = CarreraCodigoSchema.parse({ codigo: codigoQuery });

    const carrera = await prisma.carrera.findUnique({
      where: {
        codigo: validated.codigo,
      },
    });

    if (!carrera) {
      return NextResponse.json(
        { message: "No se encontró una carrera con ese código." },
        { status: 404 }
      );
    }
    return NextResponse.json(carrera, { status: 200 });
    
  } catch (error) {
    console.error("Error al buscar la carrera:", error);
    return NextResponse.json(
      { message: "Parámetro de búsqueda inválido." },
      { status: 400 }
    );
  }
}
