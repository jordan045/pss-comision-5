// app/alumno/inscripcion/crear/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  InscripcionCarreraCreateSchema,
  type InscripcionCarreraCreate,
} from "@/lib/schemas/inscripciones"

type CarreraItem = { id: number; codigo: string; nombre: string }
type PlanItem = { id: number; label: string }

export default function CrearInscripcionPage() {
  const [carreras, setCarreras] = useState<CarreraItem[]>([])
  const [planes, setPlanes] = useState<PlanItem[]>([])
  const [cargandoCarreras, setCargandoCarreras] = useState(true)
  const [cargandoPlanes, setCargandoPlanes] = useState(false)
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null)
  const [errorPlanes, setErrorPlanes] = useState<string | null>(null)
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null)

  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } =
    useForm<InscripcionCarreraCreate>({
      resolver: zodResolver(InscripcionCarreraCreateSchema),
    })

  // Cargar carreras activas al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/carreras?estado=ACTIVA", { cache: "no-store" })
        if (!res.ok) throw new Error("No se pudieron cargar las carreras")
        const data: CarreraItem[] = await res.json()
        setCarreras(data)
      } catch (e: any) {
        setErrorCarreras(e.message || "Error cargando carreras")
      } finally {
        setCargandoCarreras(false)
      }
    })()
  }, [])

  // Observar cambios en la carrera seleccionada
  const carreraId = watch("carreraId")

  useEffect(() => {
    if (carreraId && carreraId !== carreraSeleccionada) {
      setCarreraSeleccionada(carreraId)
      setPlanes([])
      setValue("planDeEstudioId", 0) // Reset plan
      setCargandoPlanes(true)
      setErrorPlanes(null)

      // Cargar planes de la carrera seleccionada
      ;(async () => {
        try {
          const res = await fetch(`/api/planes/by-carrera/${carreraId}?estado=VIGENTE`, { 
            cache: "no-store" 
          })
          if (!res.ok) throw new Error("No se pudieron cargar los planes")
          const data: PlanItem[] = await res.json()
          setPlanes(data)
          
          // Si solo hay un plan, seleccionarlo automáticamente
          if (data.length === 1) {
            setValue("planDeEstudioId", data[0].id)
          }
        } catch (e: any) {
          setErrorPlanes(e.message || "Error cargando planes")
        } finally {
          setCargandoPlanes(false)
        }
      })()
    }
  }, [carreraId, carreraSeleccionada, setValue])

  const onSubmit = async (data: InscripcionCarreraCreate) => {
    try {
      const res = await fetch("/api/inscripciones/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await res.json()
      
      if (!res.ok) {
        alert(responseData.message || "No se pudo crear la inscripción. Intentá nuevamente.")
        return
      }
      
      router.push("/alumno/inscripcion/exito")
    } catch (error) {
      alert("No se pudo crear la inscripción. Intentá nuevamente.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">
          Inscripción a Carrera
        </h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Carrera */}
            <div className="space-y-1">
              <Label htmlFor="carreraId" className="text-sm">Carrera</Label>

              {cargandoCarreras ? (
                <div className="text-sm text-muted-foreground">Cargando carreras…</div>
              ) : errorCarreras ? (
                <div className="text-sm text-red-600">{errorCarreras}</div>
              ) : (
                <select
                  id="carreraId"
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  {...register("carreraId", { valueAsNumber: true })}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar carrera</option>
                  {carreras.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.nombre}
                    </option>
                  ))}
                </select>
              )}

              {errors.carreraId && (
                <p className="text-xs text-red-600">{String(errors.carreraId.message)}</p>
              )}
            </div>

            {/* Plan de estudio */}
            <div className="space-y-1">
              <Label htmlFor="planDeEstudioId" className="text-sm">Plan de estudio</Label>

              {!carreraId ? (
                <div className="text-sm text-muted-foreground">
                  Primero seleccioná una carrera
                </div>
              ) : cargandoPlanes ? (
                <div className="text-sm text-muted-foreground">Cargando planes…</div>
              ) : errorPlanes ? (
                <div className="text-sm text-red-600">{errorPlanes}</div>
              ) : planes.length === 0 ? (
                <div className="text-sm text-orange-600">
                  No hay planes vigentes para esta carrera
                </div>
              ) : (
                <select
                  id="planDeEstudioId"
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  {...register("planDeEstudioId", { valueAsNumber: true })}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar plan</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              )}

              {errors.planDeEstudioId && (
                <p className="text-xs text-red-600">{String(errors.planDeEstudioId.message)}</p>
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
                disabled={isSubmitting || !carreraId || planes.length === 0}
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
