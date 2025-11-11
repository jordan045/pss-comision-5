"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"

type Inscripcion = {
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

export default function PortalAlumno() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/inscripciones", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setInscripciones(data)
        }
      } catch (error) {
        console.error("Error cargando inscripciones:", error)
      } finally {
        setCargando(false)
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
        {/* Botón de inscripción */}
        <Link href="/alumno/inscripcion/crear" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Inscribirme a una carrera
          </Button>
        </Link>

        {/* Mis inscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : inscripciones.length === 0 ? (
              <p className="text-sm text-gray-500">
                No tenés inscripciones aún. ¡Inscribite a una carrera!
              </p>
            ) : (
              <div className="space-y-3">
                {inscripciones.map((insc) => (
                  <div 
                    key={insc.id} 
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {insc.carrera.codigo} - {insc.carrera.nombre}
                      </h3>
                      <span 
                        className={`text-xs px-2 py-1 rounded ${
                          insc.estado === "ACTIVA" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {insc.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Título:</strong> {insc.carrera.titulo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Plan:</strong> {insc.plan.codigo} - {insc.plan.nombre} (v{insc.plan.version})
                    </p>
                    <p className="text-xs text-gray-500">
                      Inscripto el {new Date(insc.fechaInscripcion).toLocaleDateString("es-AR")}
                    </p>
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
