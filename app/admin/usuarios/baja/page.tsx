// app/admin/usuarios/baja/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Rol = "alumno" | "docente" | "administrativo"
type Usuario = {
  id: string
  rol: Rol
  nombre: string
  apellido: string
  direccion?: string
  dni: string
  email: string
  // Si tu backend los trae, no molestan acá:
  cuil?: string
  obra_social?: string
}

export default function BajaUsuarioPage() {
  const router = useRouter()
  const [dniQuery, setDniQuery] = useState("")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [dandoBaja, setDandoBaja] = useState(false)
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
      const res = await fetch(`/api/usuarios/by-dni?dni=${encodeURIComponent(dniQuery)}`)
      if (!res.ok) {
        if (res.status === 404) setError("No se encontró un usuario con ese DNI.")
        else setError("Hubo un problema al buscar el usuario.")
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

  const onDarDeBaja = async () => {
    if (!usuario) return
    setError(null)
    setDandoBaja(true)

    try {
      // Ahora la baja es lógica: actualiza 'activo' a false
      const BAJA_ENDPOINT = `/api/usuarios/${usuario.id}/baja`
      const res = await fetch(BAJA_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: false, motivo: "baja por solicitud" }),
      })

      if (!res.ok) throw new Error()
      router.push("/admin/usuarios?msg=baja-ok")
    } catch {
      setError("No se pudo dar de baja. Intentá nuevamente.")
    } finally {
      setDandoBaja(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Dar de Baja Usuario</h2>

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

        {/* Card de confirmación de baja */}
        {usuario && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">Se encontró el siguiente usuario:</p>
              <div className="rounded-xl border p-3">
                <p className="text-sm"><span className="font-medium">Nombre:</span> {usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm"><span className="font-medium">DNI:</span> {usuario.dni}</p>
                <p className="text-sm"><span className="font-medium">Email:</span> {usuario.email}</p>
                <p className="text-sm capitalize"><span className="font-medium">Rol:</span> {usuario.rol}</p>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Esta acción dará de baja al usuario y puede ser irreversible.
              </p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full h-10"
                onClick={() => setUsuario(null)}
                disabled={dandoBaja}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="w-full h-10 bg-black hover:bg-black/90"
                onClick={onDarDeBaja}
                disabled={dandoBaja}
              >
                {dandoBaja ? "Dando de baja..." : "Dar de baja"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
