"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  MateriaUpdateSchema,
  MateriaBase,
  MateriaBaseSchema,
  normalizarMateria,
  EstadoMateriaEnum,
} from "@/lib/schemas/materias"

// --- Tipos auxiliares para la materia traída del backend ---
type Materia = MateriaBase & { id: string }

export default function ModificarMateriaPage() {
  const [codigoQuery, setCodigoQuery] = useState("")
  const [materia, setMateria] = useState<Materia | null>(null)
  const [buscando, setBuscando] = useState(false)
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
        if (res.status === 404) {
          setError("No se encontró una materia con ese código.")
        } else {
          setError("Hubo un problema al buscar la materia.")
        }
        return
      }
      const data = await res.json() as any
      // Mapear cargaHoraria (backend) a carga_horaria_semanal (frontend)
      setMateria({
        ...data,
        carga_horaria_semanal: data.cargaHoraria ?? data.carga_horaria_semanal,
      })
    } catch {
      setError("No se pudo conectar con el servidor.")
    } finally {
      setBuscando(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Modificar Materia</h2>

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

        {/* Card de edición */}
        {materia && <EditarMateriaCard materia={materia} onCancelar={() => setMateria(null)} />}
      </section>
    </main>
  )
}

function EditarMateriaCard({
  materia,
  onCancelar,
}: {
  materia: Materia
  onCancelar: () => void
}) {
  const router = useRouter()
  const estados = EstadoMateriaEnum.options

  // Defaults para el formulario
  const defaults = useMemo(() => ({
    ...materia,
  }), [materia])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MateriaBase>({
    resolver: zodResolver(MateriaBaseSchema),
    defaultValues: defaults,
  })

  const onSubmit = async (data: MateriaBase) => {
    const payload = normalizarMateria(data)
    try {
      const res = await fetch(`/api/materias/${materia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      router.push("/admin/materias/modificar/exito")
    } catch {
      alert("No se pudo guardar. Intentá nuevamente.")
    }
  }
  const onError = (errors: any) => {
    console.log("❌ Errores de validación:", errors)
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        {/* Código oculto, no editable */}
        <input type="hidden" {...register("codigo")} />

        <div className="space-y-1">
          <Label htmlFor="nombre" className="text-sm">Nombre</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors?.nombre && <p className="text-xs text-red-600">{errors.nombre.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="descripcion" className="text-sm">Descripción</Label>
          <Textarea id="descripcion" rows={4} {...register("descripcion")} />
          {errors?.descripcion && <p className="text-xs text-red-600">{errors.descripcion.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="creditos" className="text-sm">Créditos</Label>
          <Input id="creditos" type="number" inputMode="numeric" {...register("creditos", { valueAsNumber: true })} />
          {errors?.creditos && <p className="text-xs text-red-600">{errors.creditos.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="carga_horaria_semanal" className="text-sm">Carga horaria semanal</Label>
          <Input id="carga_horaria_semanal" type="number" inputMode="numeric" {...register("carga_horaria_semanal", { valueAsNumber: true })} />
          {errors?.carga_horaria_semanal && <p className="text-xs text-red-600">{errors.carga_horaria_semanal.message as string}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="estado" className="text-sm">Estado</Label>
          <select id="estado" {...register("estado")} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {estados.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          {errors?.estado && <p className="text-xs text-red-600">{errors.estado.message as string}</p>}
        </div>

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
