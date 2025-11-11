// app/admin/inscripciones/consultar/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Inscripcion = {
  id: number
  fechaInscripcion: string
  estado: string
  modalidad: string
  usuario: {
    nombre: string
    apellido: string
    dni: string
    legajo: string | null
  }
  carrera: {
    codigo: string
    nombre: string
  }
  plan: {
    codigo: string
    nombre: string
    version: string
  }
}

export default function ConsultarInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/inscripciones/admin/listar", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Error al cargar inscripciones")
        }
        const data = await res.json()
        setInscripciones(data)
      } catch (error) {
        console.error("Error cargando inscripciones:", error)
        setError("No se pudieron cargar las inscripciones")
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <section className="w-full max-w-4xl">
        <h2 className="text-center text-2xl font-semibold mb-6">
          Consultar Inscripciones
        </h2>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Listado de Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : inscripciones.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay inscripciones registradas en el sistema.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {inscripciones.map((insc) => (
                  <div
                    key={insc.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {insc.usuario.nombre} {insc.usuario.apellido}
                        </h3>
                        <p className="text-xs text-gray-600">
                          DNI: {insc.usuario.dni}
                          {insc.usuario.legajo && ` | Legajo: ${insc.usuario.legajo}`}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            insc.estado === "ACTIVA"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {insc.estado}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            insc.modalidad === "INSCRIPCION_POR_ALUMNO"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {insc.modalidad === "INSCRIPCION_POR_ALUMNO"
                            ? "Por Alumno"
                            : "Por Admin"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm mt-2 pt-2 border-t">
                      <p className="text-gray-700">
                        <strong>Carrera:</strong> {insc.carrera.codigo} -{" "}
                        {insc.carrera.nombre}
                      </p>
                      <p className="text-gray-700">
                        <strong>Plan:</strong> {insc.plan.codigo} -{" "}
                        {insc.plan.nombre} (v{insc.plan.version})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Inscripto el{" "}
                        {new Date(insc.fechaInscripcion).toLocaleDateString(
                          "es-AR"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/admin/inscripciones">
            <Button variant="secondary" className="px-6 py-2">
              Volver
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
