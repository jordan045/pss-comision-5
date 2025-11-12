"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
 import { useSession } from "next-auth/react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" 



type MesaItem = {
  id: number;
  label: string;
  cursadaId: number; 
}

type AlumnoItem = {
  id: number;
  label: string; 
}

const NotaConceptualEnum = z.enum(["APROBADO", "DESAPROBADO"])
const TipoNotaEnum = z.enum(["numerica", "conceptual"])

const CalificacionCreateSchema = z.object({
  mesaDeExamenId: z.number().refine(val => !isNaN(val) && val > 0, {
    message: "Debe seleccionar una mesa de examen",
  }),
  alumnoId: z.number().refine(val => !isNaN(val) && val > 0, {
    message: "Debes seleccionar un alumno",
  }),
  tipoNota: TipoNotaEnum,
  notaNumerica: z.number().min(1).max(10).optional(),
  notaConceptual: NotaConceptualEnum.optional(),
  observaciones: z.string().max(300, "Máximo 300 caracteres").optional(),
}).refine(data => {
  if (data.tipoNota === 'numerica') {
    return data.notaNumerica !== undefined && data.notaNumerica >= 1;
  }
  if (data.tipoNota === 'conceptual') {
    return data.notaConceptual !== undefined;
  }
  return false;
}, {
  // Mensaje si la nota no coincide con el tipo
  message: "Debes ingresar una nota válida para el tipo seleccionado",
  path: ["tipoNota"],
});

type FormT = z.infer<typeof CalificacionCreateSchema>;

export default function CargarNotaFinalPage() {

  const { data: session, status } = useSession()
  const idProfesor = session?.user.id
  const [mesas, setMesas] = useState<MesaItem[]>([])
  const [alumnos, setAlumnos] = useState<AlumnoItem[]>([])
  const [cargandoMesas, setCargandoMesas] = useState(true)
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false)
  const [errorMesas, setErrorMesas] = useState<string | null>(null)

  
  const [selectedCursadaId, setSelectedCursadaId] = useState<number | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } =
    useForm<FormT>({
      resolver: zodResolver(CalificacionCreateSchema),
      defaultValues: {
        tipoNota: "numerica",
      },
    });
  
  const tipoNota = watch('tipoNota')
  const selectedMesaId = watch('mesaDeExamenId')


  // 1. Cargar Mesas de Examen
  useEffect(() => {
    (async () => {
      setCargandoMesas(true)
      try {
        const res = await fetch(`/api/mesa-examen?estado=CERRADA&docenteId=${idProfesor}`)
         if (!res.ok) throw new Error("No se pudieron cargar las mesas")
        const data: MesaItem[] = await res.json()


        setMesas(data)
        setErrorMesas(null)
      } catch (e: any) {
        setErrorMesas(e.message || "Error cargando mesas")
      } finally {
        setCargandoMesas(false)
      }
    })()
  }, [idProfesor])

  // 2. Cargar Alumnos (cuando cambia la mesa seleccionada)
  useEffect(() => {
    // Si no hay mesa seleccionada, limpiar la lista de alumnos
    if (!selectedMesaId || isNaN(selectedMesaId)) {
      setAlumnos([])
      setSelectedCursadaId(null)
      setValue("alumnoId", 0) // Resetear alumno en el form
      return;
    }

    // Buscar la cursadaId de la mesa seleccionada
    const mesa = mesas.find(m => m.id === Number(selectedMesaId)) 
    setSelectedCursadaId(mesa ? mesa.cursadaId : null);

    (async () => {
      setCargandoAlumnos(true)
      setValue("alumnoId", 0)
      try {
         const res = await fetch(`/api/mesa-examen/alumnos?mesaId=${selectedMesaId}`)
        if (!res.ok) throw new Error("No se pudieron cargar los alumnos")
         const data: AlumnoItem[] = await res.json()

        setAlumnos(data)
      } catch (e: any) {
        console.error("Error al cargar alumnos:", e)
        alert("Error al cargar alumnos") 
      } finally {
        setCargandoAlumnos(false)
      }
    })()
  }, [selectedMesaId, setValue, mesas])

  const onSubmit = async (data: FormT) => {

    
    const payload: any = {
      ...data,
      cursadaId: selectedCursadaId, 
      docenteResponsableId: idProfesor
    };

    if (data.tipoNota === 'numerica') {
      delete payload.notaConceptual;
    } else {
      delete payload.notaNumerica;
    }
    
    try {
      console.log("Enviando payload:", JSON.stringify(payload, null, 2))
       const res = await fetch(`/api/profesor/finales/cargar?docenteId=${idProfesor}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       })
       if (!res.ok) {
         const errorData = await res.json()
         throw new Error(errorData.message || "Error al guardar la nota")
       }
      

      await new Promise(resolve => setTimeout(resolve, 1000))


      alert("Nota guardada en Borrador con éxito.")
    
      reset()
      setAlumnos([])


    } catch (e: any) {
      console.error(e)
      alert(e.message || "No se pudo guardar la nota. Intentá nuevamente.")
    }
  }


  const handleVolver = () => {
    window.history.back() 
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <section className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
          Cargar Calificación Final
        </h2>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* --- 1. Mesa de Examen --- */}
            <div className="space-y-1">
              <Label htmlFor="mesaDeExamenId" className="text-sm">Mesa de Examen</Label>
              {cargandoMesas ? (
                <div className="text-sm text-muted-foreground">Cargando mesas…</div>
              ) : errorMesas ? (
                <div className="text-sm text-red-600">{errorMesas}</div>
              ) : (
                <select
                  id="mesaDeExamenId"
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  {...register("mesaDeExamenId", { valueAsNumber: true })}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar mesa...</option>
                  {mesas.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              )}
              {errors.mesaDeExamenId && (
                <p className="text-xs text-red-600">{String(errors.mesaDeExamenId.message)}</p>
              )}
            </div>

            {/* --- 2. Alumno --- */}
            <div className="space-y-1">
              <Label htmlFor="alumnoId" className="text-sm">Alumno</Label>
              <select
                id="alumnoId"
                className="w-full h-10 rounded-md border px-3 text-sm"
                {...register("alumnoId", { valueAsNumber: true })}
                disabled={cargandoAlumnos || alumnos.length === 0}
                defaultValue=""
              >
                <option value="" disabled>
                  {cargandoAlumnos 
                    ? "Cargando alumnos..." 
                    : (selectedMesaId ? "Seleccionar alumno..." : "Seleccione una mesa primero")}
                </option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
              {errors.alumnoId && (
                <p className="text-xs text-red-600">{String(errors.alumnoId.message)}</p>
              )}
            </div>

            {/* --- 3. Tipo de Nota --- */}
            <div className="space-y-1">
              <Label htmlFor="tipoNota" className="text-sm">Tipo de Nota</Label>
              <select
                id="tipoNota"
                className="w-full h-10 rounded-md border px-3 text-sm"
                {...register("tipoNota")}
              >
                <option value="numerica">Numérica (1-10)</option>
                {/*<option value="conceptual">Conceptual (Aprob/Desaprob)</option>*/}
              </select>
            </div>

            {/* --- 4. Nota (Condicional) --- */}
            {tipoNota === 'numerica' ? (
              <div className="space-y-1">
                <Label htmlFor="notaNumerica" className="text-sm">Nota (1-10)</Label>
                <Input
                  id="notaNumerica"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  placeholder="Ej: 7"
                  {...register("notaNumerica", { valueAsNumber: true })}
                />
                {errors.notaNumerica && (
                  <p className="text-xs text-red-600">{String(errors.notaNumerica.message)}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="notaConceptual" className="text-sm">Nota</Label>
                <select
                  id="notaConceptual"
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  {...register("notaConceptual")}
                  defaultValue="DESAPROBADO"
                >
                  <option value="" disabled>Seleccionar resultado</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="DESAPROBADO">Desaprobado</option>
                </select>
                {errors.notaConceptual && (
                  <p className="text-xs text-red-600">{String(errors.notaConceptual.message)}</p>
                )}
              </div>
            )}

            {/* --- 5. Observaciones --- */}
            <div className="space-y-1">
              <Label htmlFor="observaciones" className="text-sm">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Ej: Se destaca la participación en clase. (Máx 300 caracteres)"
                className="min-h-[80px]"
                {...register("observaciones")}
              />
              {errors.observaciones && (
                <p className="text-xs text-red-600">{String(errors.observaciones.message)}</p>
              )}
            </div>
            
            {/* --- Botones --- */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full h-10"
                onClick={handleVolver}
              >
                Volver
              </Button>
              <Button 
                type="submit" 
                className="w-full h-10 bg-gray-800 hover:bg-gray-900" 
                disabled={isSubmitting || cargandoMesas}
              >
                {isSubmitting ? "Guardando..." : "Guardar Borrador"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}