import { NextResponse } from "next/server";
import { PrismaClient, Prisma, NotaConceptual } from "@prisma/client";
import { auth } from "@/auth"
import { z } from "zod";

const prisma = new PrismaClient();

// --- SCHEMA SIMPLIFICADO ---
// Ahora solo esperamos una nota numérica
const NotaEditSchema = z.object({
  notaNumerica: z.number({

  })
  .min(1, "La nota debe ser entre 1 y 10")
  .max(10, "La nota debe ser entre 1 y 10"),
  observaciones: z.string().max(300, "Máximo 300 caracteres").optional(),
});
// --- FIN SCHEMA ---


export async function PATCH(request: Request, { params }: { params: { calificacionId: string } }) {
  // 1. Validar Sesión (Seguridad)
     const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ message: "No autenticado" }, { status: 401 })
  if (!session || !session.user || session.user.rol !== 'PROFESOR') {
    return NextResponse.json({ message: "Acceso no autorizado" }, { status: 401 });
  }

  const docenteIdNum = parseInt(session.user.id, 10);
  const calificacionIdNum = parseInt(params.calificacionId, 10);

  if (isNaN(calificacionIdNum)) {
    return NextResponse.json({ message: "ID de calificación inválido" }, { status: 400 });
  }

  try {
    // 2. Validar el Body (Payload)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }
    
    // Validamos con el schema simplificado
    const validatedData = NotaEditSchema.parse(body);

    // 3. Verificar que el docente sea el dueño de esta nota
    const notaActual = await prisma.calificacionFinal.findUnique({
      where: {
        id: calificacionIdNum,
        docenteResponsableId: docenteIdNum, // ¡Seguridad!
        estado: 'BORRADOR' // Solo se pueden editar borradores
      }
    });

    if (!notaActual) {
      return NextResponse.json({ message: "Nota no encontrada, no tiene permisos para editarla, o ya fue confirmada." }, { status: 404 });
    }

    // 4. Preparar el payload limpio para la DB (Simplificado)
    const dataForDB: Prisma.CalificacionFinalUpdateInput = {
      observaciones: validatedData.observaciones,
      notaNumerica: validatedData.notaNumerica, // Guardamos la nota numérica
      notaConceptual: null, // Limpiamos el campo conceptual
    };

    // 5. Actualizar la nota en la DB
    const notaActualizada = await prisma.calificacionFinal.update({
      where: {
        id: calificacionIdNum
      },
      data: dataForDB,
      // Devolvemos la nota actualizada con los mismos datos que el GET
      include: {
        alumno: {
          select: { id: true, nombre: true, apellido: true, legajo: true }
        },
        mesaExamen: {
          select: {
            id: true,
            fecha: true,
            materia: { select: { nombre: true } }
          }
        },
      },
    });

    return NextResponse.json(notaActualizada, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Datos inválidos", errors: error }, { status: 400 });
    }
    console.error("Error al actualizar la calificación:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}