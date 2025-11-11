"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"

type InscripcionCarrera = {
  id: number
  fechaInscripcion: string
  estado: string
  modalidad: string
  carrera: {
    codigo: string
    nombre: string
    titulo: string
  }
  plan: {
    codigo: string
    nombre: string
    version: string
  }
}

type InscripcionCursada = {
  id: number
  fechaInscripcion: string
  estado: string
  resultadoFinal: string
  modalidad: string
  cursada: {
    id: number
    anio: number
    cuatrimestre: string
    materia: { codigo: string; nombre: string }
  }
}

export default function PortalAlumno() {
  const [inscripcionesCarrera, setInscripcionesCarrera] = useState<InscripcionCarrera[]>([])
  const [inscripcionesCursada, setInscripcionesCursada] = useState<InscripcionCursada[]>([])
  const [cargandoCarreras, setCargandoCarreras] = useState(true)
  const [cargandoCursadas, setCargandoCursadas] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/inscripciones", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setInscripcionesCarrera(data)
        }
      } catch (error) {
        console.error("Error cargando inscripciones de carrera:", error)
      } finally {
        setCargandoCarreras(false)
      }
    })()

    ;(async () => {
      try {
        const res = await fetch("/api/inscripciones-cursadas", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setInscripcionesCursada(data)
        }
      } catch (error) {
        console.error("Error cargando inscripciones a cursadas:", error)
      } finally {
        setCargandoCursadas(false)
      }
    })()
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-semibold">Portal Alumno</h2>

      <div className="flex flex-col gap-4 w-full max-w-2xl">
        {/* Botón de inscripción a carrera */}
        <Link href="/alumno/inscripcion/crear" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Inscribirme a una carrera
          </Button>
        </Link>

        {/* Botón de inscripción a cursada */}
        <Link href="/alumno/cursadas/inscripcion/crear" className="w-full">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            Inscribirme a una cursada
          </Button>
        </Link>

        {/* Inscripciones a Carreras */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Inscripciones a Carreras</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoCarreras ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : inscripcionesCarrera.length === 0 ? (
              <p className="text-sm text-gray-500">No tenés inscripciones a carreras.</p>
            ) : (
              <div className="space-y-3">
                {inscripcionesCarrera.map((insc) => (
                  <div key={insc.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {insc.carrera.codigo} - {insc.carrera.nombre}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${insc.estado === "ACTIVA" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{insc.estado}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Título:</strong> {insc.carrera.titulo}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Plan:</strong> {insc.plan.codigo} - {insc.plan.nombre} (v{insc.plan.version})</p>
                    <p className="text-xs text-gray-500">Inscripto el {new Date(insc.fechaInscripcion).toLocaleDateString("es-AR")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inscripciones a Cursadas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Inscripciones a Cursadas</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoCursadas ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : inscripcionesCursada.length === 0 ? (
              <p className="text-sm text-gray-500">No tenés inscripciones a cursadas.</p>
            ) : (
              <div className="space-y-3">
                {inscripcionesCursada.map((insc) => (
                  <div key={insc.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {insc.cursada.materia.codigo} - {insc.cursada.materia.nombre}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${insc.estado === "ACTIVA" ? "bg-green-100 text-green-700" : insc.estado === "FINALIZADA" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{insc.estado}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Período:</strong> {insc.cursada.anio} - {insc.cursada.cuatrimestre}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Resultado:</strong> {insc.resultadoFinal}</p>
                    <p className="text-xs text-gray-500">Inscripto el {new Date(insc.fechaInscripcion).toLocaleDateString("es-AR")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón de cerrar sesión */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600"
        >
          Cerrar sesión
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Los campos marcados con * son obligatorios
      </p>
    </main>
  )
}
