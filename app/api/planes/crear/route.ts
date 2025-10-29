import { NextResponse } from "next/server";
import { PlanCreateSchema } from "@/lib/schemas/planes";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type MateriaPlanInput = {
  materiaId: number;
  correlativaId?: number | null;
  tipoCorrelatividad?: "APROBADA" | "REGULAR" | "CURSADA";
};

export async function POST(request: Request) {
  try {
    // 1) Obtener body y validar el bloque del plan
    const body = await request.json();
    const parsed = PlanCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const planData = parsed.data;
    // `materias` es opcional y NO forma parte del schema del plan:
    const materias = Array.isArray(body?.materias) ? (body.materias as MateriaPlanInput[]) : [];

    // 2) Transacción: crear plan y, si corresponde, crear MateriaPlan en batch
    const nuevoPlan = await prisma.$transaction(async (tx) => {
      const plan = await tx.planDeEstudio.create({
        data: {
          codigo: planData.codigo,
          nombre: planData.nombre,
          version: planData.version,
          fechaVigencia: new Date(planData.fechaVigencia),
          estado: planData.estado ?? "VIGENTE",
        },
      });

      if (materias.length > 0) {
        // normalizo y filtro por si llegan valores vacíos/duplicados
        const rows = materias
          .filter((m) => typeof m?.materiaId === "number" && Number.isFinite(m.materiaId))
          .map((m) => ({
            planDeEstudioId: plan.id,
            materiaId: m.materiaId,
            correlativaId: m.correlativaId ?? null,
            tipo: "Obligatoria" as const, // si querés hacerlo variable, agregá al payload un 'tipo'
            tipoCorrelatividad: m.tipoCorrelatividad ?? null,
          }));

        if (rows.length > 0) {
          await tx.materiaPlan.createMany({ data: rows, skipDuplicates: true });
        }
      }

      return plan;
    });

    // 3) Respuesta
    return NextResponse.json(
      { message: "Plan creado exitosamente", plan: nuevoPlan },
      { status: 201 }
    );
  } catch (error) {
    // 4) Errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // viola unique (p.ej., codigo duplicado)
        return NextResponse.json(
          { message: "Ya existe un plan con ese código" },
          { status: 409 }
        );
      }
      return NextResponse.json({ message: "Error en la base de datos" }, { status: 400 });
    }

    console.error("[Error CrearPlan]:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
