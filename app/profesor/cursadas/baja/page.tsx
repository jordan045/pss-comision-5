"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function BajaCursadaPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/cursadas/${data.id_materia}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: data.estado }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Error al actualizar la cursada")

      // ✅ Redirección a página de éxito
      router.push("/profesor/cursadas/baja/exito")
    } catch (error: any) {
      alert(`❌ ${error.message}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-3xl px-4">
        {/* Encabezado */}
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Dar de baja una cursada</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          {/* Campos principales centrados */}
          <div className="flex justify-center gap-6">
            <div className="w-60 space-y-4">
              <div>
                <Label htmlFor="id_materia">ID de la cursada*</Label>
                <Input
                  id="id_materia"
                  type="text"
                  placeholder="Ej: 123"
                  {...register("id_materia", { required: true })}
                />
                {errors.id_materia && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>

              <div>
                <Label htmlFor="estado">Estado*</Label>
                <select
                  id="estado"
                  {...register("estado", { required: true })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="CERRADA">Cerrada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
                {errors.estado && (
                  <p className="text-sm text-red-600 mt-1">Campo obligatorio</p>
                )}
              </div>
            </div>
          </div>

          {/* Pie con cartel y botones */}
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
                {isSubmitting ? "Dando de baja..." : "Dar de baja"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
