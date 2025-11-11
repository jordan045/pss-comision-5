// app/admin/inscripciones/crear/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  BuscarAlumnoPorDniSchema,
  InscripcionCarreraCreateAdminSchema,
  type BuscarAlumnoPorDni,
  type InscripcionCarreraCreateAdmin,
} from "@/lib/schemas/inscripciones"

type Alumno = {
  id: number
  nombre: string
  apellido: string
  dni: string
  email: string
  legajo: string | null
}

type CarreraItem = { id: number; codigo: string; nombre: string }
type PlanItem = { id: number; label: string }

export default function CrearInscripcionAdminPage() {
  const router = useRouter()
  
  // Estado para búsqueda de alumno
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [buscandoAlumno, setBuscandoAlumno] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  
  // Estado para carreras y planes
  const [carreras, setCarreras] = useState<CarreraItem[]>([])
  const [planes, setPlanes] = useState<PlanItem[]>([])
  const [cargandoCarreras, setCargandoCarreras] = useState(false)
  const [cargandoPlanes, setCargandoPlanes] = useState(false)
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null)
  const [errorPlanes, setErrorPlanes] = useState<string | null>(null)
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null)

  // Form para buscar alumno
  const { register: registerBusqueda, handleSubmit: handleSubmitBusqueda, formState: { errors: errorsBusqueda } } =
    useForm<BuscarAlumnoPorDni>({
      resolver: zodResolver(BuscarAlumnoPorDniSchema),
    })

  // Form para crear inscripción
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } =
    useForm<InscripcionCarreraCreateAdmin>({
      resolver: zodResolver(InscripcionCarreraCreateAdminSchema),
    })

  // Buscar alumno por DNI
  const onBuscarAlumno = async (data: BuscarAlumnoPorDni) => {
    setErrorBusqueda(null)
    setAlumno(null)
    setBuscandoAlumno(true)

    try {
      const res = await fetch(`/api/usuarios/by-dni?dni=${encodeURIComponent(data.dni)}`, {
        cache: "no-store"
      })
      
      if (!res.ok) {
        if (res.status === 404) {
          setErrorBusqueda("No se encontró un alumno con ese DNI")
        } else {
          setErrorBusqueda("Error al buscar el alumno")
        }
        return
      }

      const usuario = await res.json()
      
      // Verificar que sea alumno
      if (usuario.rol !== "ALUMNO") {
        setErrorBusqueda("El usuario encontrado no es un alumno")
        return
      }

      setAlumno(usuario)
      setValue("usuarioId", usuario.id)
      
      // Cargar carreras cuando se encuentra el alumno
      cargarCarreras()
    } catch (error) {
      setErrorBusqueda("Error de conexión al buscar el alumno")
    } finally {
      setBuscandoAlumno(false)
    }
  }

  // Cargar carreras activas
  const cargarCarreras = async () => {
    setCargandoCarreras(true)
    setErrorCarreras(null)
    
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
  }

  // Observar cambios en la carrera seleccionada
  const carreraId = watch("carreraId")

  // Cargar planes cuando cambia la carrera
  useEffect(() => {
    if (carreraId && carreraId !== carreraSeleccionada && alumno) {
      setCarreraSeleccionada(carreraId)
      setPlanes([])
      setValue("planDeEstudioId", 0)
      setCargandoPlanes(true)
      setErrorPlanes(null)

      ;(async () => {
        try {
          const res = await fetch(`/api/planes/by-carrera/${carreraId}?estado=VIGENTE`, {
            cache: "no-store"
          })
          if (!res.ok) throw new Error("No se pudieron cargar los planes")
          const data: PlanItem[] = await res.json()
          setPlanes(data)
          
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
  }, [carreraId, carreraSeleccionada, alumno, setValue])

  const onSubmit = async (data: InscripcionCarreraCreateAdmin) => {
    try {
      const res = await fetch("/api/inscripciones/admin/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const responseData = await res.json()
      
      if (!res.ok) {
        alert(responseData.message || "No se pudo crear la inscripción. Intentá nuevamente.")
        return
      }
      
      router.push("/admin/inscripciones/exito")
    } catch (error) {
      alert("No se pudo crear la inscripción. Intentá nuevamente.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">
          Crear Inscripción a Carrera
        </h2>

        {/* Card de búsqueda de alumno */}
        {!alumno && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm mb-4">
            <form onSubmit={handleSubmitBusqueda(onBuscarAlumno)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="dni" className="text-sm">DNI del Alumno</Label>
                <Input
                  id="dni"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Ingrese DNI (solo números)"
                  {...registerBusqueda("dni")}
                />
                {errorsBusqueda.dni && (
                  <p className="text-xs text-red-600">{errorsBusqueda.dni.message}</p>
                )}
                {errorBusqueda && (
                  <p className="text-xs text-red-600">{errorBusqueda}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/admin/inscripciones" className="w-full">
                  <Button type="button" variant="secondary" className="w-full h-10">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" className="w-full h-10" disabled={buscandoAlumno}>
                  {buscandoAlumno ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Card de inscripción */}
        {alumno && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            {/* Información del alumno */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-1">Alumno seleccionado:</p>
              <p className="text-sm"><strong>Nombre:</strong> {alumno.nombre} {alumno.apellido}</p>
              <p className="text-sm"><strong>DNI:</strong> {alumno.dni}</p>
              {alumno.legajo && <p className="text-sm"><strong>Legajo:</strong> {alumno.legajo}</p>}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => {
                  setAlumno(null)
                  setCarreras([])
                  setPlanes([])
                  setCarreraSeleccionada(null)
                }}
              >
                Buscar otro alumno
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register("usuarioId", { valueAsNumber: true })} />

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
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-10"
                  onClick={() => {
                    setAlumno(null)
                    setCarreras([])
                    setPlanes([])
                    setCarreraSeleccionada(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full h-10 bg-black hover:bg-black/90"
                  disabled={isSubmitting || !carreraId || planes.length === 0}
                >
                  {isSubmitting ? "Inscribiendo..." : "Crear Inscripción"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}
