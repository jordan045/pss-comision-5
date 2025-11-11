// app/alumno/cursadas/inscripcion/crear/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InscripcionCursadaCreateSchema, type InscripcionCursadaCreate } from "@/lib/schemas/inscripciones-cursadas"

interface CursadaItem {
  id: number
  label: string
  materiaId: number
  cuatrimestre: string
  anio: number
  cupoDisponible: number
}

export default function CrearInscripcionCursadaPage() {
  const [cursadas, setCursadas] = useState<CursadaItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<InscripcionCursadaCreate>({
      resolver: zodResolver(InscripcionCursadaCreateSchema),
    })

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/inscripciones-cursadas/disponibles", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Error cargando cursadas")
        setCursadas(data)
      } catch (e: any) {
        setError(e.message || "Error cargando cursadas")
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  const onSubmit = async (data: InscripcionCursadaCreate) => {
    try {
      const res = await fetch("/api/inscripciones-cursadas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const payload = await res.json()
      if (!res.ok) {
        alert(payload?.message || "No se pudo inscribir a la cursada")
        return
      }
      router.push("/alumno/cursadas/inscripcion/exito")
    } catch {
      alert("No se pudo inscribir a la cursada. Intentá nuevamente.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Inscripción a Cursada</h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cursadaId" className="text-sm">Cursada</Label>

              {cargando ? (
                <div className="text-sm text-muted-foreground">Cargando cursadas…</div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : cursadas.length === 0 ? (
                <div className="text-sm text-orange-600">No hay cursadas disponibles en tu plan.</div>
              ) : (
                <select
                  id="cursadaId"
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  {...register("cursadaId", { valueAsNumber: true })}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar cursada</option>
                  {cursadas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.cupoDisponible} cupos)
                    </option>
                  ))}
                </select>
              )}

              {errors.cursadaId && (
                <p className="text-xs text-red-600">{String(errors.cursadaId.message)}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/alumno" className="w-full">
                <Button type="button" variant="secondary" className="w-full h-10">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="w-full h-10 bg-black hover:bg-black/90"
                disabled={isSubmitting || cursadas.length === 0}
              >
                {isSubmitting ? "Inscribiendo..." : "Inscribirme"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
