"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlanCreateSchema, PlanCreate, normalizarPlan, EstadoPlanEnum } from "@/lib/schemas/planes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from "lucide-react"

// --- Tipos y Datos Harcodeados (Mock) ---
type Materia = { id: number; nombre: string };
type Carrera = { id: number; nombre: string };
type MateriaAgregada = {
  materiaId: number;
  materiaNombre: string;
  correlativaId?: number;
  correlativaNombre?: string;
  tipoCorrelatividad?: "APROBADA" | "REGULAR" | "CURSADA";
};

const carrerasMock: Carrera[] = [
  { id: 1, nombre: "Licenciatura en Ciencias de la Computación" },
  { id: 2, nombre: "Ingeniería en Software" },
];
const materiasMock: Materia[] = [
  { id: 101, nombre: "Algoritmos y Estructuras de Datos" },
  { id: 102, nombre: "Análisis Matemático I" },
  { id: 201, nombre: "Sistemas Operativos" },
  { id: 202, nombre: "Bases de Datos" },
];
const tiposCorrelatividadMock = ["APROBADA", "REGULAR", "CURSADA"];
// --- Fin de Datos Harcodeados ---

export default function CrearPlanPage() {
  const router = useRouter();
  const [materiasAgregadas, setMateriasAgregadas] = useState<MateriaAgregada[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } =
    useForm({
      resolver: zodResolver(PlanCreateSchema),
    });

  const watchMateriaId = watch("materiaId");

  const handleAgregarMateria = () => {
    const materiaId = watch("materiaId");
    const correlativaId = watch("correlativaId");
    const tipoCorrelatividad = watch("tipoCorrelatividad");

    if (!materiaId) {
      alert("Debe seleccionar una materia.");
      return;
    }
    if (correlativaId && !tipoCorrelatividad) {
      alert("Si selecciona una correlativa, debe indicar el tipo.");
      return;
    }

    const materia = materiasMock.find(m => m.id === materiaId);
    const correlativa = materiasMock.find(m => m.id === correlativaId);

    setMateriasAgregadas(prev => [
      ...prev,
      {
        materiaId: materia!.id,
        materiaNombre: materia!.nombre,
        correlativaId: correlativa?.id,
        correlativaNombre: correlativa?.nombre,
        tipoCorrelatividad: tipoCorrelatividad,
      },
    ]);
  };
  
  const handleRemoveMateria = (index: number) => {
    setMateriasAgregadas(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PlanCreate) => {
    setFormError(null);
    if (materiasAgregadas.length === 0) {
      setFormError("Debe agregar al menos una materia al plan.");
      return;
    }
    
    const planNormalizado = normalizarPlan(data);
    
    // Payload final listo para ser enviado al backend
    const payload = {
      ...planNormalizado,
      materias: materiasAgregadas.map(m => ({
        materiaId: m.materiaId,
        correlativaId: m.correlativaId,
        tipoCorrelatividad: m.tipoCorrelatividad,
      })),
    };

    console.log("Payload listo para enviar:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("/api/planes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { message: "Error desconocido en el servidor." };
        }
        throw new Error(errorData.message || "Error al crear el plan");
      }
      
      router.push("/admin/planes/exito?accion=crear");

    } catch (error: any) {
      setFormError(error.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Planes</CardTitle>
          <CardDescription>Crear un plan de estudio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código Único de Plan de Estudio*</Label>
                  <Input id="codigo" {...register("codigo")} />
                  {errors.codigo && <p className="text-red-500 text-sm mt-1">{errors.codigo.message}</p>}
                </div>
                <div>
                  <Label htmlFor="version">Versión*</Label>
                  <Input id="version" {...register("version")} />
                  {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version.message}</p>}
                </div>
                <div>
                  <Label htmlFor="fechaVigencia">Fecha de Vigencia*</Label>
                  <Input id="fechaVigencia" type="date" {...register("fechaVigencia")} />
                  {errors.fechaVigencia && <p className="text-red-500 text-sm mt-1">{errors.fechaVigencia.message}</p>}
                </div>
                <div>
                  <Label>Carrera asociada*</Label>
                  <Controller name="carreraId" control={control} render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "" ? undefined : Number(val))}
                      value={field.value != null ? String(field.value) : ""}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione una carrera" /></SelectTrigger>
                      <SelectContent>{carrerasMock.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                  {errors.carreraId && <p className="text-red-500 text-sm mt-1">{errors.carreraId.message}</p>}
                </div>
                <div>
                  <Label>Estado*</Label>
                  <Controller name="estado" control={control} render={({ field }) => (
                     <Select onValueChange={field.onChange} value={field.value ?? ""}>
                       <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                       <SelectContent>{(EstadoPlanEnum.options || []).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                     </Select>
                  )} />
                  {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>}
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                <div>
                  <Label>Materias del Plan*</Label>
                  <Controller name="materiaId" control={control} render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "" ? undefined : Number(val))}
                      value={field.value != null ? String(field.value) : ""}
                    >
                      <SelectTrigger><SelectValue placeholder="Listado de materias global" /></SelectTrigger>
                      <SelectContent>{materiasMock.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Correlativas</Label>
                  <Controller name="correlativaId" control={control} render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "" ? undefined : Number(val))}
                      value={field.value != null ? String(field.value) : ""}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione correlativa (opcional)" /></SelectTrigger>
                      <SelectContent>{materiasMock.filter(m => m.id !== watchMateriaId).map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Tipo de correlatividad</Label>
                   <Controller name="tipoCorrelatividad" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger><SelectValue placeholder="Seleccione tipo (si aplica)" /></SelectTrigger>
                        <SelectContent>{tiposCorrelatividadMock.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                   )} />
                </div>
                <Button type="button" onClick={handleAgregarMateria} className="w-full">Agregar Materia</Button>
                <div className="border rounded-md p-2 h-32 bg-gray-100 overflow-y-auto space-y-1">
                  {materiasAgregadas.length === 0 
                    ? <p className="text-sm text-gray-500 text-center pt-10">Materias agregadas al plan...</p>
                    : materiasAgregadas.map((m, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                          <span className="text-sm font-medium">{m.materiaNombre}</span>
                          <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveMateria(i)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600">Los campos etiquetados con * son obligatorios</p>
            {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Volver</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}