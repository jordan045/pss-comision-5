import { NextResponse } from "next/server";
import { PlanCreateSchema } from "@/lib/schemas/planes";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Obtener y validar datos
    const body = await request.json();
    const validatedData = PlanCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          message: "Datos inválidos", 
          errors: validatedData.error.format() 
        },
        { status: 400 }
      );
    }

    const planData = validatedData.data;

    // 2. Crear el plan con sus materias en una transacción
    const nuevoPlan = await prisma.$transaction(async (prismaClient) => {
      // Crear el plan base
      const plan = await prismaClient.planDeEstudio.create({
        data: {
          codigo: planData.codigo,
          version: planData.version,
          fechaVigencia: new Date(planData.fechaVigencia),
          estado: planData.estado,
          carreraId: planData.carreraId,
        },
      });

      // Si hay materia seleccionada, crear la relación
      if (planData.materiaId) {
        await prismaClient.materiaPlan.create({
          data: {
            planDeEstudioId: plan.id,
            materiaId: planData.materiaId,
            tipo: "Obligatoria", // Por defecto todas son obligatorias
          },
        });
      }

      return plan;
    });

    // 3. Devolver respuesta exitosa
    return NextResponse.json(
      {
        message: "Plan creado exitosamente",
        plan: nuevoPlan,
      },
      { status: 201 }
    );

  } catch (error) {
    // 4. Manejar errores específicos de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Ya existe un plan con ese código" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { message: "Error en la base de datos" },
        { status: 400 }
      );
    }

    // Log del error para debugging
    console.error("[Error CrearPlan]:", error);

    // Respuesta genérica de error
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

