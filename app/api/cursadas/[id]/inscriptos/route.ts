// app/api/cursadas/[id]/inscriptos/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cursadaId = parseInt(id)

    if (isNaN(cursadaId)) {
      return NextResponse.json(
        { error: "ID de cursada inválido" },
        { status: 400 }
      )
    }

    // Obtener la cursada con toda la información necesaria
    const cursada = await prisma.cursada.findUnique({
      where: { id: cursadaId },
      include: {
        materia: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        planDeEstudio: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            version: true,
          },
        },
        docentePrincipal: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        inscripciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                legajo: true,
              },
            },
          },
          orderBy: {
            fechaInscripcion: "asc",
          },
        },
      },
    })

    if (!cursada) {
      return NextResponse.json(
        { error: "Cursada no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que la cursada esté activa o finalizada
    if (cursada.estado !== "ACTIVA" && cursada.estado !== "CERRADA") {
      return NextResponse.json(
        { error: "La cursada debe estar activa o finalizada para generar la lista de inscriptos" },
        { status: 400 }
      )
    }

    // Para cada inscripción, obtener información de la carrera del alumno
    const inscriptosConCarrera = await Promise.all(
      cursada.inscripciones.map(async (inscripcion) => {
        // Buscar la inscripción a carrera del alumno que corresponda al plan de estudio de la cursada
        const inscripcionCarrera = await prisma.inscripcionCarrera.findFirst({
          where: {
            usuarioId: inscripcion.usuarioId,
            planDeEstudioId: cursada.planDeEstudioId,
          },
          include: {
            carrera: {
              select: {
                codigo: true,
                nombre: true,
              },
            },
            plan: {
              select: {
                codigo: true,
                nombre: true,
                version: true,
              },
            },
          },
        })

        return {
          id: inscripcion.id,
          alumno: {
            id: inscripcion.usuario.id,
            nombre: inscripcion.usuario.nombre,
            apellido: inscripcion.usuario.apellido,
            dni: inscripcion.usuario.dni,
            legajo: inscripcion.usuario.legajo,
          },
          carrera: inscripcionCarrera
            ? {
                codigo: inscripcionCarrera.carrera.codigo,
                nombre: inscripcionCarrera.carrera.nombre,
              }
            : null,
          plan: inscripcionCarrera
            ? {
                codigo: inscripcionCarrera.plan.codigo,
                nombre: inscripcionCarrera.plan.nombre,
                version: inscripcionCarrera.plan.version,
              }
            : null,
          estado: inscripcion.estado,
          resultadoFinal: inscripcion.resultadoFinal,
          fechaInscripcion: inscripcion.fechaInscripcion,
          modalidad: inscripcion.modalidad,
        }
      })
    )

    // Preparar la respuesta con la cabecera y los inscriptos
    const response = {
      cursada: {
        id: cursada.id,
        materia: {
          codigo: cursada.materia.codigo,
          nombre: cursada.materia.nombre,
        },
        cuatrimestre: cursada.cuatrimestre,
        anio: cursada.anio,
        estado: cursada.estado,
        docenteResponsable: {
          nombre: cursada.docentePrincipal.nombre,
          apellido: cursada.docentePrincipal.apellido,
        },
        cupoMaximo: cursada.cupoMaximo,
        totalInscriptos: cursada.inscripciones.length,
        fechaGeneracion: new Date().toISOString(),
      },
      inscriptos: inscriptosConCarrera,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener inscriptos de cursada:", error)
    return NextResponse.json(
      { error: "Error al obtener inscriptos de cursada" },
      { status: 500 }
    )
  }
}
