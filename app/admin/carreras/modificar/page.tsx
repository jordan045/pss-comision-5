"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  CarreraBaseSchema,
  CarreraUpdateSchema,
  NivelAcademicoEnum,
  EstadoCarreraEnum,
  normalizarCarrera,
  type CarreraBase,
  type NivelAcademico,
  type EstadoCarrera,
} from "@/lib/schemas/carreras"

type CarreraFromDB = {
  id: number
  codigo: string
  nombre: string
  titulo: string
  nivelAcademico: string
  duracionAnios: number
  facultad: string
  estado: string
}

type CarreraForForm = CarreraBase & { id: number }

export default function ModificarCarreraPage() {
  const [codigoQuery, setCodigoQuery] = useState("")
  const [carrera, setCarrera] = useState<CarreraForForm | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validarCodigo = (codigo: string) => /^[A-Za-z0-9]{5,10}$/.test(codigo.trim())

  const onBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCarrera(null)

    const cleanCodigo = codigoQuery.trim().toUpperCase()

    if (!validarCodigo(cleanCodigo)) {
      setError("El código debe ser alfanumérico (5–10 caracteres).")
      return
    }
    setBuscando(true)
    try {

      const res = await fetch(`/api/carreras/by-codigo?codigo=${encodeURIComponent(cleanCodigo)}`)

      if (!res.ok) {
        setError(res.status === 404
          ? "No se encontró una carrera con ese código."
          : "Hubo un problema al buscar la carrera."
        )
        return
      }
      
      const data = (await res.json()) as CarreraFromDB
      

      const mappedData: CarreraForForm = {
        id: data.id,
        codigo: data.codigo,
        nombre: data.nombre,
        titulo_otorgado: data.titulo,
        nivel_academico: data.nivelAcademico as NivelAcademico,
        duracion_estimada: data.duracionAnios,
        facultad_asociada: data.facultad,
        estado: data.estado as EstadoCarrera,
      }
      setCarrera(mappedData)
    } catch {
      setError("No se pudo conectar con el servidor.")
    } finally {
      setBuscando(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Modificar Carrera</h2>

        {/* Card de Búsqueda */}
        {!carrera && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <form onSubmit={onBuscar} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="codigoBuscar" className="text-sm">Buscar por código</Label>
                <Input
                  id="codigoBuscar"
                  placeholder="Ingrese el código de la carrera"
                  value={codigoQuery}
                  onChange={(e) => setCodigoQuery(e.target.value)}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/admin/carreras" className="w-full">
                  <Button type="button" variant="secondary" className="w-full h-10">Volver</Button>
                </Link>
                <Button type="submit" className="w-full h-10" disabled={buscando}>
                  {buscando ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Card de Edición */}
        {carrera && <EditarCarreraCard carrera={carrera} onCancelar={() => setCarrera(null)} />}
      </section>
    </main>
  )
}

function EditarCarreraCard({
  carrera,
  onCancelar,
}: {
  carrera: CarreraForForm
  onCancelar: () => void
}) {
  const router = useRouter()
  type FormT = z.infer<typeof CarreraBaseSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormT>({
    resolver: zodResolver(CarreraBaseSchema),
    defaultValues: carrera, 
  })

  const onSubmit = async (data: FormT) => {

    const { codigo, ...dataParaActualizar } = data;

    const result = CarreraUpdateSchema.safeParse(dataParaActualizar);

    if (!result.success) {
      console.error("Error de validación al preparar el payload:", result.error.flatten());
      alert("Hubo un error con los datos del formulario.");
      return;
    }

    const payload = normalizarCarrera(result.data);

    try {
      // La URL de la API es correcta.
      const res = await fetch(`/api/carreras/modificar/${carrera.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/carreras?msg=modificada");
    } catch {
      alert("No se pudo guardar la carrera. Intentá nuevamente.");
    }
}

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Código (mostrado pero no editable) */}
        <div className="space-y-1">
          <Label htmlFor="codigo" className="text-sm">Código único</Label>
          <Input id="codigo" readOnly disabled value={carrera.codigo} className="bg-gray-100" />
        </div>

        {/* Nombre */}
        <div className="space-y-1">
          <Label htmlFor="nombre" className="text-sm">Nombre de la carrera</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors.nombre && <p className="text-xs text-red-600">{errors.nombre.message}</p>}
        </div>

        {/* Título otorgado */}
        <div className="space-y-1">
          <Label htmlFor="titulo_otorgado" className="text-sm">Título otorgado</Label>
          <Input id="titulo_otorgado" {...register("titulo_otorgado")} />
          {errors.titulo_otorgado && <p className="text-xs text-red-600">{errors.titulo_otorgado.message}</p>}
        </div>

        {/* Nivel académico */}
        <div className="space-y-1">
          <Label htmlFor="nivel_academico" className="text-sm">Nivel académico</Label>
          <select id="nivel_academico" className="w-full h-10 rounded-md border px-3 text-sm" {...register("nivel_academico")}>
            {NivelAcademicoEnum.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {errors.nivel_academico && <p className="text-xs text-red-600">{errors.nivel_academico.message}</p>}
        </div>

        {/* Duración estimada (años) */}
        <div className="space-y-1">
          <Label htmlFor="duracion_estimada" className="text-sm">Duración estimada (años)</Label>
          <Input
            id="duracion_estimada"
            type="number"
            {...register("duracion_estimada", { valueAsNumber: true })}
          />
          {errors.duracion_estimada && <p className="text-xs text-red-600">{errors.duracion_estimada.message}</p>}
        </div>

        {/* Facultad asociada */}
        <div className="space-y-1">
          <Label htmlFor="facultad_asociada" className="text-sm">Facultad asociada</Label>
          <Input id="facultad_asociada" {...register("facultad_asociada")} />
          {errors.facultad_asociada && <p className="text-xs text-red-600">{errors.facultad_asociada.message}</p>}
        </div>

        {/* Estado */}
        <div className="space-y-1">
          <Label htmlFor="estado" className="text-sm">Estado</Label>
          <select id="estado" className="w-full h-10 rounded-md border px-3 text-sm" {...register("estado")}>
            {EstadoCarreraEnum.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {errors.estado && <p className="text-xs text-red-600">{errors.estado.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" className="w-full h-10" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
