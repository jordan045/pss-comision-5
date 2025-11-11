// app/api/cursadas/profesor/[id]/inscriptos/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const usuarioId = parseInt(session.user.id)
    const cursadaId = parseInt(id)

    if (isNaN(cursadaId)) {
      return NextResponse.json(
        { error: "ID de cursada inválido" },
        { status: 400 }
      )
    }

    // Verificar que el usuario sea profesor
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true },
    })

    if (!usuario || usuario.rol !== "PROFESOR") {
      return NextResponse.json(
        { message: "Solo los profesores pueden acceder a este recurso" },
        { status: 403 }
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
        docentesAdicionales: {
          select: {
            id: true,
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

    // Verificar que el profesor tenga acceso a esta cursada
    const tieneAcceso =
      cursada.docentePrincipalId === usuarioId ||
      cursada.docentesAdicionales.some((docente) => docente.id === usuarioId)

    if (!tieneAcceso) {
      return NextResponse.json(
        { error: "No tiene permisos para acceder a esta cursada" },
        { status: 403 }
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
