import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { CarreraUpdateSchema } from "@/lib/schemas/carreras";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 en Next 15, params es Promise
) {
  try {
    const { id: idStr } = await context.params;   // 👈 await aquí
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "El ID proporcionado no es un número válido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = CarreraUpdateSchema.parse(body);

    const dataForDb = {
      nombre: validatedData.nombre,
      titulo: validatedData.titulo_otorgado,
      nivelAcademico: validatedData.nivel_academico,
      duracionAnios: validatedData.duracion_estimada,
      facultad: validatedData.facultad_asociada,
      estado: validatedData.estado,
    };

    const updatedCarrera = await prisma.carrera.update({
      where: { id },
      data: dataForDb,
    });

    return NextResponse.json(updatedCarrera, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la carrera:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: `No se encontró una carrera con el ID proporcionado.` },
          { status: 404 }
        );
      }
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || ["campo"];
        const message = `El ${target.join(", ")} '${
          (error.meta?.target as any)?.nombre
        }' ya existe en otra carrera.`;
        return NextResponse.json({ message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { message: "Los datos enviados no son válidos o están incompletos." },
      { status: 400 }
    );
  }
}
