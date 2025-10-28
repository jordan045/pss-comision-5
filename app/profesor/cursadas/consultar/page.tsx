"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ConsultarCursadaPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()

  const onSubmit = async (data: any) => {
    console.log("Datos enviados:", data)
    alert("Simulando consulta de cursada...")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        {/* Encabezado */}
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Consultar una cursada</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          {/* Grid principal: 3 columnas (2 de inputs + 1 de observaciones) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <p className="text-lg font-semibold mb-2">Consultar por:</p>

              <div>
                <Label htmlFor="materia">Materia</Label>
                <Input id="materia" {...register("materia")} />
                {errors.materia && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>

              <div>
                <Label htmlFor="cuatrimestre">Cuatrimestre</Label>
                <Input id="cuatrimestre" {...register("cuatrimestre")} />
                {errors.cuatrimestre && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>

              <div>
                <Label htmlFor="carrera">Carrera</Label>
                <Input id="carrera" {...register("carrera")} />
                {errors.carrera && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" {...register("estado")} />
                {errors.estado && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="resultado">Resultado</Label>
              <Textarea
                id="resultado"
                rows={14}
                placeholder="Aquí se mostrará el resultado de la consulta..."
                className="resize-none w-full"
                {...register("resultado")}
              />
            </div>
          </div>

          {/* Pie con leyenda y botones */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Los campos con * son obligatorios
            </p>

            <div className="flex gap-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-40 bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? "Consultando..." : "Consultar"}
              </Button>

              <Link href="/profesor/cursadas">
                <Button
                  type="button"
                  className="w-40 bg-black hover:bg-gray-800 text-white"
                >
                  Volver
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
