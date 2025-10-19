import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { MateriaCreateSchema } from "@/lib/schemas/materias";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = MateriaCreateSchema.parse(body);

    const dataForDb = {
      codigo: validatedData.codigo,
      nombre: validatedData.nombre,
      descripcion: validatedData.descripcion,
      creditos: validatedData.creditos,
      cargaHoraria: validatedData.carga_horaria_semanal,
      estado: validatedData.estado,
    };

    const nuevaMateria = await prisma.materia.create({
      data: dataForDb,
    });
    console.log("Nueva materia creada en la base de datos:", nuevaMateria);

    return NextResponse.json(nuevaMateria, { status: 201 });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || ["campo"];
        const message = `Ya existe una materia con este ${target.join(", ")}.`;
        return NextResponse.json({ message }, { status: 409 });
      }
    }
    return NextResponse.json(
      { message: "No se pudo crear la materia. Verifique los datos enviados." },
      { status: 400 }
    );
  }
}
