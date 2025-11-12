import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma, NotaConceptual } from "@prisma/client";
import { z } from "zod";


const prisma = new PrismaClient();

const ApiCalificacionSchema = z.object({
  mesaDeExamenId: z.number(),
  alumnoId: z.number(),
  cursadaId: z.number(), 
  notaNumerica: z.number().min(1).max(10).optional(),
  notaConceptual: z.enum(["APROBADO", "DESAPROBADO"]).optional(),
  observaciones: z.string().max(300).optional(),
});

export async function POST(request: NextRequest) {
  let body;
  try {

     const { searchParams } = request.nextUrl;

    // 1. Leemos los parámetros (ahora son obligatorios)
    const docenteResponsableId = searchParams.get("docenteId");

     if (!docenteResponsableId) {
      return NextResponse.json(
        { message: "Error en la sesion actual" },
        { status: 400 }
      );
    }


    const docenteIdNum = parseInt(docenteResponsableId, 10);
    if (isNaN(docenteIdNum)) {
      return NextResponse.json(
        { message: "El 'docenteId' debe ser un número" },
        { status: 400 }
      );
    }


    body = await request.json();
    const validatedData = ApiCalificacionSchema.parse(body);


    const dataForDB = {
      mesaDeExamenId: validatedData.mesaDeExamenId,
      alumnoId: validatedData.alumnoId,
      cursadaId: validatedData.cursadaId,
      docenteResponsableId: docenteIdNum, 
      notaNumerica: validatedData.notaNumerica,
      notaConceptual: validatedData.notaConceptual as NotaConceptual, 
      observaciones: validatedData.observaciones,
    };

    // 5. Crear la calificación
    const nuevaNotaFinal = await prisma.calificacionFinal.create({
      data: dataForDB,
    });

    console.log(
      "Nueva nota final cargada a la base de datos",
      nuevaNotaFinal
    );
    return NextResponse.json(nuevaNotaFinal, { status: 201 });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);

    // 6. Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos de formulario inválidos", errors: error },
        { status: 400 }
      );
    }

    // 7. Manejar errores de Prisma (Error de "carrera" corregido)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        if (
          (error.meta?.target as string[])?.includes(
            "calificacion_unica_alumno_mesa"
          )
        ) {
          const message =
            "Ya existe una calificación para este alumno en esta mesa de examen.";
          return NextResponse.json({ message }, { status: 409 });
        }
        const target = (error.meta?.target as string[]) || ["campo"];
        const message = `Ya existe un registro con este ${target.join(", ")}.`;
        return NextResponse.json({ message }, { status: 409 });
      }
    }


    return NextResponse.json(
      {
        message:
          "No se pudo crear la calificación. Verifique los datos enviados.",
      },
      { status: 500 } 
    );
  }
}