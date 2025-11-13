import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"
// Asumimos que tus authOptions están en esta ruta.
// Si esta ruta es incorrecta, ajústala a donde tengas tu 'export const authOptions'.


const prisma = new PrismaClient();

/**
 * API GET para obtener todas las calificaciones en estado "BORRADOR"
 * para el docente actualmente logueado.
 */
export async function GET(request: Request) {
  // 1. Validar Sesión (Seguridad)
   const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ message: "No autenticado" }, { status: 401 })

  if (!session || !session.user || session.user.rol !== 'PROFESOR') {
    return NextResponse.json({ message: "Acceso no autorizado" }, { status: 401 });
  }

  // Obtenemos el ID del docente de forma segura desde la sesión
  const docenteIdNum = parseInt(session.user.id, 10);
  if (isNaN(docenteIdNum)) {
    return NextResponse.json({ message: "ID de docente inválido en la sesión" }, { status: 400 });
  }

  try {
    // 2. Buscar las calificaciones en borrador
    const borradores = await prisma.calificacionFinal.findMany({
      where: {
        docenteResponsableId: docenteIdNum,
        estado: 'BORRADOR'
      },
      // 3. Incluir datos relacionados para mostrar en el frontend
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            legajo: true
          }
        },
        mesaExamen: {
          select: {
            id: true,
            fecha: true,
            materia: {
              select: {
                nombre: true
              }
            }
          }
        },
      },
      orderBy: {
        // Ordenamos por mesa para facilitar la agrupación en el front
        mesaExamenId: 'asc'
      }
    });

    // 4. Devolver los datos
    return NextResponse.json(borradores);

  } catch (error) {
    console.error("Error al obtener calificaciones en borrador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}