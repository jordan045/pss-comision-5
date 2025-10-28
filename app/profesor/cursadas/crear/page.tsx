"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation" // 👈 agregado

export default function CrearCursadaPage() {
  const router = useRouter() // 👈 agregado

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/cursadas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materiaId: data.materia,
          docentePrincipalId: data.docente,
          cuatrimestre: data.cuatrimestre.toUpperCase(),
          anio: parseInt(data.anio),
          cupoMaximo: parseInt(data.cupo_maximo),
          cupoActual: parseInt(data.cupo_actual) || 0,
          estado: data.estado.toUpperCase(),
          planDeEstudioId: data.plan_estudio,
          observaciones: data.observaciones,
        }),
      })

      if (response.ok) {
        reset()
        router.push("/profesor/cursadas/crear/exito") // 👈 redirección a la pantalla de éxito
      } else {
        const errorData = await response.json()
        alert(`⚠️ ${errorData.message}`) // muestra la validación
      }
    } catch (error) {
      console.error("Error en la creación:", error)
      alert("❌ Error al enviar los datos al servidor.")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        {/* Encabezado */}
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Crear una cursada</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="materia">Materia ID*</Label>
                <Input id="materia" {...register("materia", { required: true })} />
                {errors.materia && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="docente">Docente responsable ID*</Label>
                <Input id="docente" {...register("docente", { required: true })} />
                {errors.docente && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
              </div>

              <div>
                <Label htmlFor="cuatrimestre">Cuatrimestre*</Label>
                <select
                  id="cuatrimestre"
                  {...register("cuatrimestre", { required: true })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PRIMERO">PRIMERO</option>
                  <option value="SEGUNDO">SEGUNDO</option>
                </select>
              </div>

              <div>
                <Label htmlFor="anio">Año*</Label>
                <Input id="anio" type="number" {...register("anio", { required: true })} />
              </div>
            </div>

            {/* Columna central */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="cupo_maximo">Cupo máximo*</Label>
                <Input id="cupo_maximo" type="number" {...register("cupo_maximo", { required: true })} />
              </div>

              <div>
                <Label htmlFor="cupo_actual">Cupo actual*</Label>
                <Input id="cupo_actual" type="number" {...register("cupo_actual")} />
              </div>

              <div>
                <Label htmlFor="estado">Estado*</Label>
                <select
                  id="estado"
                  {...register("estado", { required: true })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ACTIVA">Activa</option>
                  <option value="CERRADA">Cerrada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <div>
                <Label htmlFor="plan_estudio">Plan de Estudio ID*</Label>
                <Input id="plan_estudio" {...register("plan_estudio", { required: true })} />
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" rows={14} {...register("observaciones")} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Los campos con * son obligatorios
            </p>

            <div className="flex gap-3">
              <Link href="/profesor/cursadas">
                <Button type="button" className="w-40">
                  Volver
                </Button>
              </Link>

              <Button type="submit" disabled={isSubmitting} className="w-40">
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
