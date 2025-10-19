// app/admin/materias/crear/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  MateriaCreateSchema,
  EstadoMateriaEnum,
  MateriaCreate,
  normalizarMateria,
} from "@/lib/schemas/materias"

export default function CrearMateriaPage() {
  const router = useRouter()
  type FormT = z.infer<typeof MateriaCreateSchema>

  const estados = EstadoMateriaEnum.options

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormT>({
      resolver: zodResolver(MateriaCreateSchema),
      defaultValues: {
        estado: "Activa",   // <-- definido; no uses Partial ni lo dejes afuera
      },
    });

  const onSubmit = async (data: MateriaCreate) => {
    const payload = normalizarMateria(data)
    try {
      const res = await fetch("/api/materias/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      reset()
      router.push("/admin/materias/exito")
    } catch {
      alert("No se pudo crear la materia. Intentá nuevamente.")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-4xl px-4">
        <header className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Gestión de Materias</h2>
          <p className="text-sm text-muted-foreground">Crear una materia</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo" className="mb-2">Código Único de Materia*</Label>
                <Input
                  id="codigo"
                  placeholder="Ej: SISOP01"
                  {...register("codigo")}
                />
                {errors.codigo && (
                  <p className="text-sm text-red-600 mt-1">{errors.codigo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nombre" className="mb-2">Nombre de Materia*</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Sistemas Operativos"
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="creditos" className="mb-2">Créditos*</Label>
                <Input
                  id="creditos"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 4"
                  {...register("creditos", { valueAsNumber: true })}
                />
                {errors.creditos && (
                  <p className="text-sm text-red-600 mt-1">{errors.creditos.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="carga_horaria_semanal" className="mb-2">Carga horaria semanal*</Label>
                <Input
                  id="carga_horaria_semanal"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 8"
                  {...register("carga_horaria_semanal", { valueAsNumber: true })}
                />
                {errors.carga_horaria_semanal && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.carga_horaria_semanal.message}
                  </p>
                )}
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="descripcion" className="mb-2">Descripción*</Label>
                <Textarea
                  id="descripcion"
                  rows={8}
                  placeholder="Ej: Esta materia aborda los conceptos fundamentales de ..."
                  {...register("descripcion")}
                  className="resize-none"
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-600 mt-1">{errors.descripcion.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="estado" className="mb-0">Estado*</Label>
                <select
                  id="estado"
                  {...register("estado")}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                {errors.estado && (
                  <p className="text-sm text-red-600 mt-1">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Los campos etiquetados con * son obligatorios</p>

          {/* Acciones */}
          <div className="flex items-center gap-3 justify-center pt-0">
            <Link href="/admin/materias">
              <Button type="button" className="w-60">
                Volver
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-60"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
