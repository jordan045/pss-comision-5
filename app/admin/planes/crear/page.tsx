// app/admin/planes/crear/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlanCreateSchema, normalizarPlan, EstadoPlanEnum } from "@/lib/schemas/planes"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from "lucide-react"

// --- mocks de materias (reemplazar por fetch real) ---
type Materia = { id: number; nombre: string }
const materiasMock: Materia[] = [
  { id: 101, nombre: "Algoritmos y Estructuras de Datos" },
  { id: 102, nombre: "Análisis Matemático I" },
  { id: 201, nombre: "Sistemas Operativos" },
  { id: 202, nombre: "Bases de Datos" },
]
const tiposCorrelatividadMock = ["APROBADA", "REGULAR", "CURSADA"] as const

type MateriaAgregada = {
  materiaId: number
  materiaNombre: string
  correlativaId?: number
  correlativaNombre?: string
  tipoCorrelatividad?: (typeof tiposCorrelatividadMock)[number]
}

// 🔧 Tipo del FORM = INPUT del schema (antes de defaults/coerciones)
type FormT = z.input<typeof PlanCreateSchema>

export default function CrearPlanPage() {
  const router = useRouter()
  const [materiasAgregadas, setMateriasAgregadas] = useState<MateriaAgregada[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } =
    useForm<FormT>({
      resolver: zodResolver(PlanCreateSchema),
      defaultValues: { estado: "VIGENTE" }, // ayuda al Select
    })

  const watchMateriaId = watch("materiaId") // string | undefined

  const handleAgregarMateria = () => {
    const materiaIdStr = watch("materiaId")           // string | undefined
    const correlativaIdStr = watch("correlativaId")   // string | undefined
    const tipoCorrelatividad = watch("tipoCorrelatividad")

    if (!materiaIdStr) { alert("Debe seleccionar una materia."); return }

    const materiaId = Number(materiaIdStr)
    const correlativaId = correlativaIdStr ? Number(correlativaIdStr) : undefined

    const materia = materiasMock.find(m => m.id === materiaId)
    if (!materia) { alert("Materia inválida."); return }

    const correlativa = correlativaId != null
      ? materiasMock.find(m => m.id === correlativaId)
      : undefined

    setMateriasAgregadas(prev => [
      ...prev,
      {
        materiaId: materia.id,
        materiaNombre: materia.nombre,
        correlativaId: correlativa?.id,
        correlativaNombre: correlativa?.nombre,
        tipoCorrelatividad,
      },
    ])
  }

  const handleRemoveMateria = (idx: number) => {
    setMateriasAgregadas(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (raw: FormT) => {
    setFormError(null)

    // Parseo con Zod → aplica defaults y coerce (output del schema)
    const data = PlanCreateSchema.parse(raw)
    const plan = normalizarPlan(data)

    const payload = {
      ...plan
      // si querés crear MateriaPlan en el mismo endpoint:
      // materias: materiasAgregadas.map(m => ({
      //   materiaId: m.materiaId,
      //   correlativaId: m.correlativaId,
      //   tipoCorrelatividad: m.tipoCorrelatividad,
      // })),
    }

    try {
      const res = await fetch("/api/planes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Error al crear el plan")
      router.push("/admin/planes/exito?accion=crear")
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Crear Plan de Estudio</CardTitle>
          <CardDescription>Complete los campos obligatorios del plan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código*</Label>
                  <Input id="codigo" {...register("codigo")} />
                  {errors.codigo && <p className="text-red-500 text-sm mt-1">{String(errors.codigo.message)}</p>}
                </div>

                <div>
                  <Label htmlFor="nombre">Nombre*</Label>
                  <Input id="nombre" {...register("nombre")} />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{String(errors.nombre.message)}</p>}
                </div>

                <div>
                  <Label htmlFor="version">Versión*</Label>
                  <Input id="version" {...register("version")} />
                  {errors.version && <p className="text-red-500 text-sm mt-1">{String(errors.version.message)}</p>}
                </div>

                <div>
                  <Label htmlFor="fechaVigencia">Fecha de Vigencia*</Label>
                  <Input id="fechaVigencia" type="date" {...register("fechaVigencia")} />
                  {errors.fechaVigencia && <p className="text-red-500 text-sm mt-1">{String(errors.fechaVigencia.message)}</p>}
                </div>

                <div>
                  <Label>Estado*</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? "VIGENTE"}>
                        <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                        <SelectContent>
                          {(EstadoPlanEnum.options || []).map(e => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && <p className="text-red-500 text-sm mt-1">{String(errors.estado.message)}</p>}
                </div>
              </div>

              {/* Columna Derecha (Materias opcionales) */}
              <div className="space-y-4">
                <div>
                  <Label>Materias del Plan (opcional)</Label>
                  <Controller
                    name="materiaId"
                    control={control}
                    render={({ field }) => {
                      // normalizo a string para el Select
                      const value: string =
                        typeof field.value === "string"
                          ? field.value
                          : field.value == null
                            ? ""
                            : String(field.value)

                      return (
                        <Select
                          value={value} // <- string OK
                          onValueChange={(val) => field.onChange(val === "" ? undefined : val)} // string | undefined
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Listado de materias global" />
                          </SelectTrigger>
                          <SelectContent>
                            {materiasMock.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />

                </div>

                <div>
                  <Label>Correlativas</Label>
                  <Controller
                    name="correlativaId"
                    control={control}
                    render={({ field }) => {
                      const value: string =
                        typeof field.value === "string"
                          ? field.value
                          : field.value == null
                            ? ""
                            : String(field.value)

                      return (
                        <Select
                          value={value}
                          onValueChange={(val) => field.onChange(val === "" ? undefined : val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione correlativa (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {materiasMock
                              .filter((m) => m.id !== Number(watch("materiaId") ?? 0))
                              .map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                  {m.nombre}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                </div>

                <div>
                  <Label>Tipo de correlatividad</Label>
                  <Controller
                    name="tipoCorrelatividad"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger><SelectValue placeholder="Seleccione tipo (si aplica)" /></SelectTrigger>
                        <SelectContent>
                          {tiposCorrelatividadMock.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button type="button" onClick={handleAgregarMateria} className="w-full">Agregar Materia</Button>

                <div className="border rounded-md p-2 h-32 bg-gray-100 overflow-y-auto space-y-1">
                  {materiasAgregadas.length === 0
                    ? <p className="text-sm text-gray-500 text-center pt-10">Materias agregadas al plan...</p>
                    : materiasAgregadas.map((m, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                        <span className="text-sm font-medium">
                          {m.materiaNombre}
                          {m.correlativaNombre ? ` — Correlativa: ${m.correlativaNombre} (${m.tipoCorrelatividad})` : ""}
                        </span>
                        <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveMateria(i)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600">Los campos con * son obligatorios</p>
            {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Volver</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
