"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AlumnoSchema, type AlumnoForm, normalizarDireccion } from "@/lib/schemas/usuarios"

export default function CrearAlumno() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<AlumnoForm>({
      resolver: zodResolver(AlumnoSchema),
      defaultValues: { rol: "ALUMNO", cuil: "", obraSocial: "" },
    })

  const onSubmit = async (data: AlumnoForm) => {
    const payload = normalizarDireccion(data)
    
    const res = await fetch("/api/usuarios/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  
    if (res.ok) {
      router.push("/admin/usuarios/crear/exito")
    } else {
      const error = await res.json()
      alert(error.error || "Error al crear usuario")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Crear Alumno</h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("rol")} />
            <input type="hidden" {...register("cuil")} />
            <input type="hidden" {...register("obraSocial")} />

            <div className="space-y-1">
              <Label htmlFor="nombre" className="text-sm">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && <p className="text-xs text-red-600">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="apellido" className="text-sm">Apellido</Label>
              <Input id="apellido" {...register("apellido")} />
              {errors.apellido && <p className="text-xs text-red-600">{errors.apellido.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="direccion" className="text-sm">Dirección (opcional)</Label>
              <Input id="direccion" {...register("direccion")} />
              {errors.direccion && <p className="text-xs text-red-600">{errors.direccion.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="dni" className="text-sm">DNI</Label>
              <Input id="dni" inputMode="numeric" pattern="\d*" placeholder="Solo números" {...register("dni")} />
              {errors.dni && <p className="text-xs text-red-600">{errors.dni.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/admin/usuarios/crear">
                <Button type="button" variant="secondary" className="w-full h-10">Volver</Button>
              </Link>
              <Button type="submit" className="w-full h-10 bg-black hover:bg-black/90" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
