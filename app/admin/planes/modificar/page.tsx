"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react'; // Se importa el ícono de carga
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// --- Tipo de dato que esperamos del backend ---
type PlanDeEstudioEncontrado = {
  id: number;
  codigo: string;
  version: string;
  estado: "VIGENTE" | "BORRADOR" | "INACTIVO";
  materias: {
    materia: {
      id: number;
      nombre: string;
    };
  }[];
};

// --- Componente del Formulario de Edición (sin cambios) ---
interface EditarPlanFormProps {
  plan: PlanDeEstudioEncontrado;
  onFinish: () => void;
}

function EditarPlanForm({ plan, onFinish }: EditarPlanFormProps) {
  console.log('Plan recibido en el formulario:', plan);
  console.log('Materias del plan en el formulario:', plan.materias);
  
  const [version, setVersion] = useState(plan.version);
  const [estado, setEstado] = useState(plan.estado);
  const [materias] = useState(plan.materias.map(m => m.materia));
  const [modificationError, setModificationError] = useState<string | null>(null);
  
  const handleModificar = async () => {
    setModificationError(null); 
    
    const noChanges = version === plan.version && estado === plan.estado;
    if (noChanges) {
      setModificationError("No se ha realizado ningún cambio en el plan de estudio.");
      return; 
    }

    try {
      const res = await fetch(`/api/planes/modificar/${plan.codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version,
          estado,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al modificar el plan');
      }

      onFinish();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Gestión de Planes</CardTitle>
          <CardDescription>Modificar un plan de estudio</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código del Plan de Estudio</Label>
                  <Input 
                    id="codigo" 
                    value={plan.codigo}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="version">Versión*</Label>
                  <Input 
                    id="version" 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Estado*</Label>
                  <Select value={estado} onValueChange={(value: "VIGENTE" | "BORRADOR" | "INACTIVO") => setEstado(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Listado de estados de plan de estudio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIGENTE">Vigente</SelectItem>
                      <SelectItem value="BORRADOR">Borrador</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Materias del Plan*</Label>
                <div className="border rounded-md p-3 h-40 bg-gray-50 overflow-y-auto">
                  {materias.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {materias.map(materia => <li key={materia.id} className="text-sm">{materia.nombre}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Este plan aún no tiene materias asignadas. Las materias se agregarán en el próximo paso.</p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4">Los campos etiquetados con * son obligatorios</p>
            
            {modificationError && <p className="text-sm text-center font-semibold text-orange-600 mt-4">{modificationError}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <a href="/admin/planes">
                <Button type="button" variant="outline">Volver</Button>
              </a>
              <Button type="button" onClick={handleModificar}>
                Modificar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
// --- Fin del Componente del Formulario de Edición ---


export default function ModificarPlanPage() {
  const [step, setStep] = useState<'buscar' | 'editar' | 'exito'>('buscar');
  const [codigoPlan, setCodigoPlan] = useState('');
  const [planEncontrado, setPlanEncontrado] = useState<PlanDeEstudioEncontrado | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para la carga

  const handleBuscarPlan = async () => {
    setError('');
    if (!codigoPlan) {
      setError('Por favor, ingrese el código del plan.');
      return;
    }
    setIsLoading(true);

    try {
      // --- Llamada fetch al backend implementada ---
      const res = await fetch(`/api/planes/by-codigo/${codigoPlan}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No se encontró ningún plan de estudio con ese ID.');
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ocurrió un error al buscar el plan.');
      }
      
      const data = await res.json();
      console.log('Plan encontrado:', data);
      console.log('Materias del plan:', data.materias);
      
      setPlanEncontrado(data);
      setStep('editar');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onModificationSuccess = () => {
    setStep('exito');
  };

  if (step === 'buscar') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Modificar Plan de Estudio</CardTitle>
            <CardDescription>Ingrese el código del plan que desea modificar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigoPlan">Código del Plan de Estudio</Label>
                <Input
                  id="codigoPlan"
                  value={codigoPlan}
                  onChange={(e) => setCodigoPlan(e.target.value)}
                  placeholder="0912"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleBuscarPlan} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar Plan'
                )}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <a href="/admin/planes">
                <Button variant="link">Volver</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (step === 'editar' && planEncontrado) {
    return <EditarPlanForm plan={planEncontrado} onFinish={onModificationSuccess} />;
  }

  if (step === 'exito') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4">¡Éxito!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              El plan de estudio ha sido modificado correctamente.
            </p>
            <a href="/admin/planes">
              <Button className="mt-6 w-full">Volver a Gestión de Planes</Button>
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  return null;
}
