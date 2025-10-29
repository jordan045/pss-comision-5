"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ModificarCursadaPage() {
  const router = useRouter()
  const params = useParams() // obtenemos { id }
  const cursadaId = params.id

  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm()

  useEffect(() => {
    async function fetchCursada() {
      try {
        const res = await fetch(`/api/cursadas/${cursadaId}`)
        if (!res.ok) throw new Error("Cursada no encontrada")
        const data = await res.json()

        // precargamos el formulario
        reset({
          materia: data.materiaId,
          docente: data.docentePrincipalId,
          cuatrimestre: data.cuatrimestre,
          anio: data.anio,
          cupo_maximo: data.cupoMaximo,
          cupo_actual: data.cupoActual,
          estado: data.estado,
          plan_estudio: data.planDeEstudioId,
          observaciones: data.observaciones,
        })

        setLoading(false)
      } catch (error) {
        console.error(error)
        alert("Error al cargar los datos de la cursada")
      }
    }

    fetchCursada()
  }, [cursadaId, reset])

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/cursadas/${cursadaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materiaId: data.materia,
          docentePrincipalId: data.docente,
          cuatrimestre: data.cuatrimestre,
          anio: parseInt(data.anio),
          cupoMaximo: parseInt(data.cupo_maximo),
          cupoActual: parseInt(data.cupo_actual),
          estado: data.estado,
          planDeEstudioId: data.plan_estudio,
          observaciones: data.observaciones,
        }),
      })

      if (res.ok) {
        alert("Cursada modificada correctamente")
        router.push("/profesor/cursadas/seleccionar/modificar/exito") // redirige a listado
      } else {
        const err = await res.json()
        alert(`Error al modificar: ${err.message}`)
      }
    } catch (error) {
      console.error(error)
      alert("Error al modificar la cursada")
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando cursada...</p>

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Modificar una cursada</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="materia">Materia*</Label>
                <Input id="materia" {...register("materia")} />
                {errors.materia && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="docente">Docente responsable*</Label>
                <Input id="docente" {...register("docente")} />
                {errors.docente && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="cuatrimestre">Cuatrimestre*</Label>
                <Input id="cuatrimestre" {...register("cuatrimestre")} />
                {errors.cuatrimestre && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="anio">Año*</Label>
                <Input id="anio" type="number" {...register("anio")} />
                {errors.anio && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cupo_maximo">Cupo máximo de inscriptos*</Label>
                <Input id="cupo_maximo" type="number" {...register("cupo_maximo")} />
                {errors.cupo_maximo && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="cupo_actual">Cupo actual*</Label>
                <Input id="cupo_actual" type="number" {...register("cupo_actual")} />
                {errors.cupo_actual && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="estado">Estado*</Label>
                <select id="estado" {...register("estado")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
                {errors.estado && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="plan_estudio">Plan de estudio asociado*</Label>
                <Input id="plan_estudio" {...register("plan_estudio")} />
                {errors.plan_estudio && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" rows={14} {...register("observaciones")} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">Los campos etiquetados con * son obligatorios</p>

            <div className="flex gap-3">
              <Link href="/profesor/cursadas">
                <Button type="button" className="w-40">Volver</Button>
              </Link>

              <Button type="submit" disabled={isSubmitting} className="w-40">
                {isSubmitting ? "Modificando..." : "Modificar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
