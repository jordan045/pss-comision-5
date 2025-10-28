"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select" // opcional, si quieres un select bonito

export default function ListaInscriptosPage() {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm()

  const onSubmit = async (data: any) => {
    console.log("Datos enviados:", data)
    alert("Simulando generación de lista de inscriptos...")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-6xl px-4">
        {/* Encabezado */}
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Generar Lista de Inscriptos</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          {/* Grid principal: 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda: filtros */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materia">Materia*</Label>
                  <Input id="materia" {...register("materia")} />
                  {errors.materia && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
                </div>

                <div>
                  <Label htmlFor="estado">Filtrar por: Estado</Label>
                  <select
                    id="estado"
                    {...register("estado")}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Listado de estados de cursadas</option>
                    <option value="Activa">Activa</option>
                    <option value="Inactiva">Inactiva</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="cuatrimestre">Cuatrimestre*</Label>
                  <Input id="cuatrimestre" {...register("cuatrimestre")} />
                  {errors.cuatrimestre && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
                </div>

                <div>
                  <Label htmlFor="carrera">Carrera</Label>
                  <Input id="carrera" {...register("carrera")} />
                </div>

                <div>
                  <Label htmlFor="anio">Año*</Label>
                  <Input id="anio" type="number" {...register("anio")} />
                  {errors.anio && <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>}
                </div>

                <div>
                  <Label htmlFor="fecha_inscripcion">Fecha de inscripción</Label>
                  <Input id="fecha_inscripcion" type="date" {...register("fecha_inscripcion")} />
                </div>
              </div>
            </div>

            {/* Columna derecha: lista de inscriptos */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="lista">Lista de Inscriptos</Label>
              <Textarea
                id="lista"
                rows={12}
                placeholder="Campo de texto vacío"
                className="resize-none w-full"
                {...register("lista")}
              />
              <div className="flex gap-3 mt-2">
                <Button type="button" className="bg-black hover:bg-gray-800 text-white w-32">
                  Legajo
                </Button>
                <Button type="button" className="bg-black hover:bg-gray-800 text-white w-32">
                  Alfabéticamente
                </Button>
              </div>
            </div>
          </div>

          {/* Pie con leyenda y botones */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Los campos etiquetados con * son obligatorios
            </p>

            <div className="flex gap-3">
              <Link href="/profesor/cursadas">
                <Button type="button" className="w-40 bg-black hover:bg-gray-800 text-white">
                  Volver
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-40 bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? "Generando..." : "Generar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
