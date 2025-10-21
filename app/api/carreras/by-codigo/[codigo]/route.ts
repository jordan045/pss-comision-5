import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { codigo: string } }
) {
  const codigo = params.codigo;
  if (!codigo) {
    return NextResponse.json(
      { error: "Código de carrera no proporcionado" },
      { status: 400 }
    );
  }

  try {
    await prisma.$connect();
    
    // Buscar la carrera por código
    const carrera = await prisma.carrera.findUnique({
      where: {
        codigo: codigo,
      },
      include: {
        planes: {
          include: {
            materias: {
              include: {
                materia: true
              }
            }
          }
        }
      }
    });

    if (!carrera) {
      return NextResponse.json(
        { error: "No se encontró una carrera con ese código" },
        { status: 404 }
      );
    }

    return NextResponse.json(carrera);
  } catch (error) {
    console.error("Error al buscar carrera:", error);
    return NextResponse.json(
      { error: "Error al buscar la carrera. Verifique la conexión a la base de datos." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}