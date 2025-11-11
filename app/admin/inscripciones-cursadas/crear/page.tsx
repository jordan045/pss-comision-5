"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BuscarAlumnoPorDniSchema } from "@/lib/schemas/inscripciones"
import { InscripcionCursadaCreateAdminSchema } from "@/lib/schemas/inscripciones-cursadas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Usuario { id: number; nombre: string; apellido: string; dni: string }
interface CursadaItem { id: number; label: string; cupoDisponible: number }

export default function AdminCrearInscripcionCursada() {
  const [alumno, setAlumno] = useState<Usuario | null>(null)
  const [cursadas, setCursadas] = useState<CursadaItem[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const formDni = useForm<{ dni: string }>({ resolver: zodResolver(BuscarAlumnoPorDniSchema) })
  const formCrear = useForm<{ usuarioId: number; cursadaId: number }>({
    resolver: zodResolver(InscripcionCursadaCreateAdminSchema.pick({ usuarioId: true, cursadaId: true })),
  })

  const buscarAlumno = async (dni: string) => {
    setBuscando(true); setError(null); setMensaje(null)
    setAlumno(null); setCursadas([])
    try {
      const res = await fetch(`/api/usuarios/by-dni?dni=${encodeURIComponent(dni)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Alumno no encontrado")
      setAlumno(data)
      formCrear.setValue("usuarioId", data.id)

      const resCur = await fetch(`/api/inscripciones-cursadas/admin/disponibles?usuarioId=${data.id}`, { cache: "no-store" })
      const dataCur = await resCur.json()
      if (!resCur.ok) throw new Error(dataCur?.message || "No se pudieron cargar las cursadas")
      setCursadas(dataCur)
    } catch (e: any) {
      setError(e.message || "Error en la búsqueda")
    } finally {
      setBuscando(false)
    }
  }

  const crearInscripcion = async (usuarioId: number, cursadaId: number) => {
    setError(null); setMensaje(null)
    try {
      const res = await fetch(`/api/inscripciones-cursadas/admin/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, cursadaId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la inscripción")
      setMensaje("Inscripción creada correctamente")
    } catch (e: any) {
      setError(e.message || "Error creando la inscripción")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-xl space-y-6">
        <h2 className="text-center text-2xl font-semibold">Inscribir alumno a cursada (Admin)</h2>

        {/* Buscar por DNI */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
          <form
            onSubmit={formDni.handleSubmit(({ dni }) => buscarAlumno(dni))}
            className="flex gap-2 items-end"
          >
            <div className="flex-1">
              <Label htmlFor="dni" className="text-sm">DNI del alumno</Label>
              <input
                id="dni"
                className="w-full h-10 rounded-md border px-3 text-sm"
                placeholder="Ej: 12345678"
                {...formDni.register("dni")}
              />
              {formDni.formState.errors.dni && (
                <p className="text-xs text-red-600">{String(formDni.formState.errors.dni.message)}</p>
              )}
            </div>
            <Button type="submit" className="h-10" disabled={buscando}>
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
          </form>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {mensaje && <p className="text-sm text-green-700">{mensaje}</p>}
        </div>

        {/* Resultado alumno y cursadas */}
        {alumno && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div>
              <p className="text-sm"><strong>Alumno:</strong> {alumno.apellido}, {alumno.nombre} (DNI {alumno.dni})</p>
            </div>

            <form
              onSubmit={formCrear.handleSubmit(({ usuarioId, cursadaId }) => crearInscripcion(usuarioId, cursadaId))}
              className="space-y-3"
            >
              <input type="hidden" {...formCrear.register("usuarioId", { valueAsNumber: true })} />
              <div>
                <Label htmlFor="cursadaId" className="text-sm">Cursada</Label>
                {cursadas.length === 0 ? (
                  <div className="text-sm text-orange-600">No hay cursadas disponibles para este alumno.</div>
                ) : (
                  <select
                    id="cursadaId"
                    className="w-full h-10 rounded-md border px-3 text-sm"
                    defaultValue=""
                    {...formCrear.register("cursadaId", { valueAsNumber: true })}
                  >
                    <option value="" disabled>Seleccionar cursada</option>
                    {cursadas.map(c => (
                      <option key={c.id} value={c.id}>{c.label} ({c.cupoDisponible} cupos)</option>
                    ))}
                  </select>
                )}
                {formCrear.formState.errors.cursadaId && (
                  <p className="text-xs text-red-600">{String(formCrear.formState.errors.cursadaId.message)}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-10 bg-black hover:bg-black/90" disabled={cursadas.length === 0}>
                Inscribir
              </Button>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}
