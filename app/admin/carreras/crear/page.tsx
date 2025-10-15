// app/admin/carreras/crear/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  CarreraCreateSchema,
  NivelAcademicoEnum,
  EstadoCarreraEnum,
  normalizarCarrera,
  type CarreraCreate,
} from "@/lib/schemas/carreras"

export default function CrearCarreraPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CarreraCreate>({
    resolver: zodResolver(CarreraCreateSchema),
    defaultValues: {
      estado: "Activa", // default visual, el backend también puede aplicar su default
    } as Partial<CarreraCreate>,
  })

  const onSubmit = async (data: CarreraCreate) => {
    const payload = normalizarCarrera(data)
    try {
      const res = await fetch("/api/carreras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      // opcional: limpiar form y/o redirigir
      reset()
      router.push("/admin/carreras?msg=creada")
    } catch {
      alert("No se pudo crear la carrera. Intentá nuevamente.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Crear Carrera</h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Código */}
            <div className="space-y-1">
              <Label htmlFor="codigo" className="text-sm">Código único</Label>
              <Input
                id="codigo"
                placeholder="Ej: LCC01"
                {...register("codigo")}
              />
              {errors.codigo && (
                <p className="text-xs text-red-600">{errors.codigo.message as string}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1">
              <Label htmlFor="nombre" className="text-sm">Nombre de la carrera</Label>
              <Input id="nombre" placeholder="Ej: Licenciatura en Computación" {...register("nombre")} />
              {errors.nombre && (
                <p className="text-xs text-red-600">{errors.nombre.message as string}</p>
              )}
            </div>

            {/* Título otorgado */}
            <div className="space-y-1">
              <Label htmlFor="titulo_otorgado" className="text-sm">Título otorgado</Label>
              <Input id="titulo_otorgado" placeholder="Ej: Licenciado/a en ..." {...register("titulo_otorgado")} />
              {errors.titulo_otorgado && (
                <p className="text-xs text-red-600">{errors.titulo_otorgado.message as string}</p>
              )}
            </div>

            {/* Nivel académico */}
            <div className="space-y-1">
              <Label htmlFor="nivel_academico" className="text-sm">Nivel académico</Label>
              <select
                id="nivel_academico"
                className="w-full h-10 rounded-md border px-3 text-sm"
                {...register("nivel_academico")}
                defaultValue=""
              >
                <option value="" disabled>Seleccionar nivel</option>
                {NivelAcademicoEnum.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.nivel_academico && (
                <p className="text-xs text-red-600">{errors.nivel_academico.message as string}</p>
              )}
            </div>

            {/* Duración estimada (años) */}
            <div className="space-y-1">
              <Label htmlFor="duracion_estimada" className="text-sm">Duración estimada (años)</Label>
              <Input
                id="duracion_estimada"
                type="number"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Ej: 4"
                {...register("duracion_estimada", { valueAsNumber: true })}   // ← clave
              />
              {errors.duracion_estimada && (
                <p className="text-xs text-red-600">{errors.duracion_estimada.message as string}</p>
              )}
            </div>

            {/* Facultad asociada */}
            <div className="space-y-1">
              <Label htmlFor="facultad_asociada" className="text-sm">Facultad asociada</Label>
              <Input id="facultad_asociada" placeholder="Ej: Facultad de Informática" {...register("facultad_asociada")} />
              {errors.facultad_asociada && (
                <p className="text-xs text-red-600">{errors.facultad_asociada.message as string}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <Label htmlFor="estado" className="text-sm">Estado</Label>
              <select
                id="estado"
                className="w-full h-10 rounded-md border px-3 text-sm"
                {...register("estado")}
                defaultValue="Activa"
              >
                {EstadoCarreraEnum.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.estado && (
                <p className="text-xs text-red-600">{errors.estado.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/admin/carreras" className="w-full">
                <Button type="button" variant="secondary" className="w-full h-10">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="w-full h-10 bg-black hover:bg-black/90" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear carrera"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
