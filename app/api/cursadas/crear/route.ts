// /app/api/cursadas/crear/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient, Prisma, Cuatrimestre, EstadoCursada } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// 🧱 Esquema de validación con Zod
const cursadaSchema = z.object({
  materiaId: z.coerce.number().int().positive(),
  planDeEstudioId: z.coerce.number().int().positive(),
  docentePrincipalId: z.coerce.number().int().positive(),
  cuatrimestre: z.nativeEnum(Cuatrimestre),
  anio: z.coerce.number().int(),
  cupoMaximo: z.coerce.number().int().positive(),
  cupoActual: z.coerce.number().int().nonnegative().optional().default(0),
  estado: z.nativeEnum(EstadoCursada).optional().default(EstadoCursada.ACTIVA),
  observaciones: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("📩 Recibiendo solicitud POST /api/cursadas/crear");

    const body = await request.json();
    console.log("📦 Body recibido:", body);

    // ✅ Validación con Zod
    const data = cursadaSchema.parse(body);
    console.log("✅ Datos validados con Zod:", data);

    // 🧠 Verificar que la materia exista y esté ACTIVA
    console.log("🔍 Buscando materia con ID:", data.materiaId);

    const materia = await prisma.materia.findUnique({
      where: { id: data.materiaId },
      select: { estado: true, nombre: true },
    });

    console.log("📘 Resultado de búsqueda de materia:", materia);

    if (!materia) {
      console.warn("⚠️ La materia no existe");
      return NextResponse.json(
        { message: "La materia indicada no existe." },
        { status: 400 }
      );
    }

    if (materia.estado !== "Activa") {
      console.warn(`⚠️ Materia "${materia.nombre}" no activa (estado: ${materia.estado})`);
      return NextResponse.json(
        {
          message: `No se puede crear una cursada para la materia "${materia.nombre}" porque su estado es "${materia.estado}".`,
        },
        { status: 400 }
      );
    }

    // Validar docente
    const docente = await prisma.usuario.findUnique({
      where: { id: data.docentePrincipalId },
      select: { activo: true, rol: true, nombre: true, apellido: true },
    });

    if (!docente) {
      return NextResponse.json(
        { message: "El docente principal indicado no existe." },
        { status: 400 }
      );
    }

    if (docente.rol !== "PROFESOR") {
      return NextResponse.json(
        {
          message: `El usuario "${docente.nombre} ${docente.apellido}" no tiene rol de PROFESOR.`,
        },
        { status: 400 }
      );
    }

    if (!docente.activo) {
      return NextResponse.json(
        {
          message: `El docente "${docente.nombre} ${docente.apellido}" no se encuentra activo.`,
        },
        { status: 400 }
      );
    }


    // 🧾 Crear la cursada
    console.log("🛠️ Intentando crear cursada en base de datos...");
    const nuevaCursada = await prisma.cursada.create({
      data: {
        materiaId: data.materiaId,
        planDeEstudioId: data.planDeEstudioId,
        docentePrincipalId: data.docentePrincipalId,
        cuatrimestre: data.cuatrimestre,
        anio: data.anio,
        cupoMaximo: data.cupoMaximo,
        cupoActual: data.cupoActual,
        estado: data.estado,
        observaciones: data.observaciones,
      },
    });

    console.log("✅ Nueva cursada creada exitosamente:", nuevaCursada);
    return NextResponse.json(nuevaCursada, { status: 201 });

  } catch (error) {
    console.error("❌ Error al crear cursada:", error);

    // Errores de validación (Zod)
    if (error instanceof z.ZodError) {
      console.error("🧩 Error de validación Zod:", error.flatten());
      return NextResponse.json(
        { message: "Datos inválidos", errors: error.flatten() },
        { status: 400 }
      );
    }

    // Errores de Prisma (por ejemplo, constraint duplicada)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("🧱 Error de Prisma (KnownRequestError):", error);
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || ["campo único"];
        const message = `Ya existe una cursada con este ${target.join(", ")}.`;
        return NextResponse.json({ message }, { status: 409 });
      }
    }

    // Cualquier otro error inesperado
    console.error("💥 Error inesperado:", error);
    return NextResponse.json(
      { message: "Error al crear la cursada." },
      { status: 500 }
    );
  }
}
