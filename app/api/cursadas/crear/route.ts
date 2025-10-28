// /app/api/cursadas/crear/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica (podrías reemplazarla con zod)
    const {
      materiaId,
      planDeEstudioId,
      docentePrincipalId,
      cuatrimestre,
      anio,
      cupoMaximo,
      cupoActual,
      estado,
      observaciones,
    } = body;

    if (
      !materiaId ||
      !planDeEstudioId ||
      !docentePrincipalId ||
      !cuatrimestre ||
      !anio ||
      !cupoMaximo
    ) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const nuevaCursada = await prisma.cursada.create({
      data: {
        materiaId: Number(materiaId),
        planDeEstudioId: Number(planDeEstudioId),
        docentePrincipalId: Number(docentePrincipalId),
        cuatrimestre,
        anio: Number(anio),
        cupoMaximo: Number(cupoMaximo),
        cupoActual: Number(cupoActual) || 0,
        estado,
        observaciones,
      },
    });

    console.log("✅ Nueva cursada creada:", nuevaCursada);
    return NextResponse.json(nuevaCursada, { status: 201 });
  } catch (error) {
    console.error("❌ Error al crear cursada:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || ["campo único"];
        const message = `Ya existe una cursada con este ${target.join(", ")}.`;
        return NextResponse.json({ message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { message: "Error al crear la cursada." },
      { status: 500 }
    );
  }
}
