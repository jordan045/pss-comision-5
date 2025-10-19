"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { MateriaBase } from "@/lib/schemas/materias"

export default function BajaMateriaPage() {
  const router = useRouter()
  const [codigoQuery, setCodigoQuery] = useState("")
  const [materia, setMateria] = useState<(MateriaBase & { id: string }) | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [dandoBaja, setDandoBaja] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validarCodigo = (codigo: string) => /^[A-Za-z0-9]{5,10}$/.test(codigo.trim())

  const onBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMateria(null)

    if (!validarCodigo(codigoQuery)) {
      setError("El código debe ser alfanumérico (5-10 caracteres, sin espacios).")
      return
    }

    setBuscando(true)
    try {
      const res = await fetch(`/api/materias/by-codigo?codigo=${encodeURIComponent(codigoQuery)}`)
      if (!res.ok) {
        if (res.status === 404) setError("No se encontró una materia con ese código.")
        else setError("Hubo un problema al buscar la materia.")
        return
      }
      const data = await res.json()
      // Si la materia ya está inactiva, no permitimos la operación
      const estadoBackend = data.estado ?? data.estado?.toString()
      if (estadoBackend === "Inactiva") {
        setError("La materia ya está dada de baja.")
        return
      }
      setMateria({ ...data, carga_horaria_semanal: data.cargaHoraria ?? data.carga_horaria_semanal })
    } catch {
      setError("No se pudo conectar con el servidor.")
    } finally {
      setBuscando(false)
    }
  }

  const onDarDeBaja = async () => {
    if (!materia) return
    setError(null)
    setDandoBaja(true)

    try {
      const BAJA_ENDPOINT = `/api/materias/${materia.id}/baja`
      const res = await fetch(BAJA_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Inactiva", motivo: "baja por solicitud" }),
      })

      if (!res.ok) throw new Error()
      router.push("/admin/materias/baja/exito")
    } catch {
      setError("No se pudo dar de baja. Intentá nuevamente.")
    } finally {
      setDandoBaja(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Dar de Baja Materia</h2>

        {/* Card de búsqueda */}
        {!materia && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <form onSubmit={onBuscar} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="codigoBuscar" className="text-sm">Buscar por código</Label>
                <Input
                  id="codigoBuscar"
                  placeholder="Ingrese código de materia"
                  value={codigoQuery}
                  onChange={(e) => setCodigoQuery(e.target.value)}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/admin/materias" className="w-full">
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
        {materia && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500">Se encontró la siguiente materia:</p>
              <div className="rounded-xl border p-3">
                <p className="text-sm"><span className="font-medium">Nombre:</span> {materia.nombre}</p>
                <p className="text-sm"><span className="font-medium">Código:</span> {materia.codigo}</p>
                <p className="text-sm"><span className="font-medium">Créditos:</span> {materia.creditos}</p>
                <p className="text-sm"><span className="font-medium">Carga horaria semanal:</span> {materia.carga_horaria_semanal}</p>
                <p className="text-sm"><span className="font-medium">Estado:</span> {materia.estado}</p>
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full h-10"
                onClick={() => setMateria(null)}
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
                {dandoBaja ? "Procesando..." : "Dar de baja"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
