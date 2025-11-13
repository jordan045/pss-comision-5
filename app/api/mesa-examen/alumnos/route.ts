import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  EstadoMesaExamen, 
} from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 1. Leemos los parámetros (ahora son obligatorios)
    const mesaId = searchParams.get("mesaId");

    // 2. Validamos que AMBOS existan
    if (!mesaId) {
      return NextResponse.json(
        { message: "Se requieren los parámetros 'docenteId' y 'estado'" },
        { status: 400 }
      );
    }


    const mesaIdNum = parseInt(mesaId, 10);
    if (isNaN(mesaIdNum)) {
      return NextResponse.json(
        { message: "El 'docenteId' debe ser un número" },
        { status: 400 }
      );
    }

  
    // 5. Consultamos la base de datos
    const inscripciones = await prisma.inscripcionMesaExamen.findMany({
      where: {
        mesaExamenId: mesaIdNum
      },
      include:{
        usuario:{
            select:{
                id:true,
                nombre:true,
                apellido:true,
                legajo:true
            }
        }
      }
    });

    const alumnosInscriptos = inscripciones.map((inscripcion)=>({
        id:inscripcion.usuario.id,
        label:`${inscripcion.usuario.nombre} ${inscripcion.usuario.apellido} - ${inscripcion.usuario.legajo}`
    })

    )


    return NextResponse.json(alumnosInscriptos);
    
  } catch (error) {
    console.error("Error al obtener mesas de examen:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}