import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { CarreraCreateSchema } from "@/lib/schemas/carreras"; 

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CarreraCreateSchema.parse(body);

    const dataForDb = {
      codigo: validatedData.codigo,
      nombre: validatedData.nombre,
      titulo: validatedData.titulo_otorgado,
      nivelAcademico: validatedData.nivel_academico,
      duracionAnios: validatedData.duracion_estimada,
      facultad: validatedData.facultad_asociada,
      estado: validatedData.estado,
      planDeEstudioId: validatedData.plan_de_estudio_id,
    };

    const nuevaCarrera = await prisma.carrera.create({
      data: dataForDb,
    });
    console.log("Nueva carrera creada en la base de datos:", nuevaCarrera);

    return NextResponse.json(nuevaCarrera, { status: 201 });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || ["campo"];
        const message = `Ya existe una carrera con este ${target.join(", ")}.`;
        return NextResponse.json({ message }, { status: 409 }); 
      }
    }
    return NextResponse.json(
      { message: "No se pudo crear la carrera. Verifique los datos enviados." },
      { status: 400 }
    );
  }
}

