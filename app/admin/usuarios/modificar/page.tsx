"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UsuarioSchema, type UsuarioForm } from "@/lib/schemas/usuarios"

import {
  normalizarDireccion,
  type AlumnoForm,
  type DocenteForm,
  type AdministrativoForm,
} from "@/lib/schemas/usuarios"

// --- Tipos auxiliares para el usuario traído del backend ---
type Rol = "alumno" | "docente" | "administrativo"
type Usuario =
  | (AlumnoForm & { id: string })
  | (DocenteForm & { id: string })
  | (AdministrativoForm & { id: string })

export default function ModificarUsuarioPage() {
  const [dniQuery, setDniQuery] = useState("")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validarDni = (dni: string) => /^\d{8,12}$/.test(dni.trim())

  const onBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUsuario(null)

    if (!validarDni(dniQuery)) {
      setError("El DNI debe tener entre 8 y 12 dígitos numéricos.")
      return
    }
    setBuscando(true)
    try {
      // AJUSTAR a tu backend real
      const res = await fetch(`/api/usuarios/by-dni?dni=${encodeURIComponent(dniQuery)}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró un usuario con ese DNI.")
        } else {
          setError("Hubo un problema al buscar el usuario.")
        }
        return
      }
      const data = (await res.json()) as Usuario
      setUsuario(data)
    } catch {
      setError("No se pudo conectar con el servidor.")
    } finally {
      setBuscando(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Modificar Usuario</h2>

        {/* Card de búsqueda */}
        {!usuario && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <form onSubmit={onBuscar} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="dniBuscar" className="text-sm">Buscar por DNI</Label>
                <Input
                  id="dniBuscar"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Ingrese DNI (solo números)"
                  value={dniQuery}
                  onChange={(e) => setDniQuery(e.target.value)}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/admin/usuarios" className="w-full">
                  <Button type="button" variant="secondary" className="w-full h-10">Volver</Button>
                </Link>
                <Button type="submit" className="w-full h-10" disabled={buscando}>
                  {buscando ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Card de edición */}
        {usuario && <EditarUsuarioCard usuario={usuario} onCancelar={() => setUsuario(null)} />}
      </section>
    </main>
  )
}

function EditarUsuarioCard({
  usuario,
  onCancelar,
}: {
  usuario: Usuario
  onCancelar: () => void
}) {
  const router = useRouter()
  const rol = usuario.rol as Rol

  // Aseguramos defaults válidos para el discriminated union
  const defaults: UsuarioForm = useMemo(() => {
    if (rol === "alumno") {
      // alumno debe tener cuil y obra_social === ""
      return {
        ...(usuario as any),
        cuil: "",
        obra_social: "",
        rol: "alumno",
      }
    }
    // docente / administrativo traen sus strings reales
    return usuario as UsuarioForm
  }, [usuario, rol])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(UsuarioSchema),
    defaultValues: defaults,
  })

  const onSubmit = async (data: UsuarioForm) => {
    const payload = normalizarDireccion(data)
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      router.push("/admin/usuarios/crear/exito")
    } catch {
      alert("No se pudo guardar. Intentá nuevamente.")
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* rol oculto para mantener el discriminator */}
        <input type="hidden" {...register("rol")} />

        <div className="space-y-1">
          <Label htmlFor="nombre" className="text-sm">Nombre</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors?.nombre && <p className="text-xs text-red-600">{errors.nombre.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="apellido" className="text-sm">Apellido</Label>
          <Input id="apellido" {...register("apellido")} />
          {errors?.apellido && <p className="text-xs text-red-600">{errors.apellido.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="direccion" className="text-sm">Dirección (opcional)</Label>
          <Input id="direccion" {...register("direccion")} />
          {errors?.direccion && <p className="text-xs text-red-600">{errors.direccion.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="dni" className="text-sm">DNI</Label>
          <Input id="dni" inputMode="numeric" pattern="\d*" {...register("dni")} />
          {errors?.dni && <p className="text-xs text-red-600">{errors.dni.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors?.email && <p className="text-xs text-red-600">{errors.email.message as string}</p>}
        </div>

        {/* Campos adicionales según rol */}
        {rol !== "alumno" && (
          <>
            <div className="space-y-1">
              <Label htmlFor="cuil" className="text-sm">CUIL</Label>
              <Input id="cuil" inputMode="numeric" pattern="\d*" {...register("cuil")} />
              {errors?.cuil && <p className="text-xs text-red-600">{errors.cuil.message as string}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="obra_social" className="text-sm">Obra social</Label>
              <Input id="obra_social" {...register("obra_social")} />
              {errors?.obra_social && <p className="text-xs text-red-600">{errors.obra_social.message as string}</p>}
            </div>
          </>
        )}

        {/* Para alumno: ocultos y en "" (cumple el literal del schema) */}
        {rol === "alumno" && (
          <>
            <input type="hidden" {...register("cuil")} value="" />
            <input type="hidden" {...register("obra_social")} value="" />
          </>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" className="w-full h-10" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full h-10 bg-black hover:bg-black/90" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}

