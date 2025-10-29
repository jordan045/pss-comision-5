"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

// --- Tipos de datos que esperamos del backend ---
type Materia = {
  id: number;
  nombre: string;
  // Agrega otros campos de materia si los necesitas, ej: codigo, creditos
};

type PlanDeEstudio = {
  id: number;
  nombre: string;
  estado: "VIGENTE" | "BORRADOR" | "INACTIVO";
  materias: { materia: Materia }[]; // Asumo que la relación es a través de MateriaPlan
};

type CarreraEncontrada = {
  id: number;
  codigo: string;
  nombre: string;
  planDeEstudio: PlanDeEstudio; // Según tu modelo de Prisma, una carrera tiene UN plan.
};

export default function ConsultarPlanesPage() {
  // Estado para controlar el flujo: buscar o consultar
  const [step, setStep] = useState<'buscar' | 'consultar'>('buscar');
  const [codigoCarrera, setCodigoCarrera] = useState('');
  const [carreraData, setCarreraData] = useState<CarreraEncontrada | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDeEstudio | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBuscarCarrera = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/carreras/by-codigo/${codigoCarrera}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al buscar la carrera');
      }
      const carrera = await response.json();
      setCarreraData(carrera);
      // Como una carrera tiene un solo plan, lo seleccionamos directamente.
      setSelectedPlan(carrera.planDeEstudio || null);
      setStep('consultar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar la carrera');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderizado Condicional de las Pantallas ---

  // 1. Pantalla de Búsqueda
  if (step === 'buscar') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Consultar Planes de Estudio</CardTitle>
            <CardDescription>Ingrese el código único de la carrera.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigoCarrera">Código de Carrera</Label>
                <Input
                  id="codigoCarrera"
                  value={codigoCarrera}
                  onChange={(e) => setCodigoCarrera(e.target.value)}
                  placeholder="Ej: LIC-COMP"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleBuscarCarrera} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Consultar'}
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
  
  // 2. Pantalla de Consulta
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Gestión de Planes</CardTitle>
          <CardDescription>Consultar un plan de estudio para la carrera: <strong>{carreraData?.nombre}</strong></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna de Planes */}
            <div className="md:col-span-1 space-y-2">
              <Label>Planes de estudio</Label>
              <div className="border rounded-md p-2 h-80 bg-white">
                {carreraData?.planDeEstudio ? (
                  <div
                    key={carreraData.planDeEstudio.id}
                    className="p-2 rounded bg-blue-100" // Siempre seleccionado porque solo hay uno
                  >
                    <p className="font-semibold">{carreraData.planDeEstudio.nombre}</p>
                    <p className="text-xs text-gray-500">{carreraData.planDeEstudio.estado}</p>
                  </div>
                ) : <p className="text-sm text-gray-500 p-4">Esta carrera no tiene un plan de estudio asociado.</p>}
              </div>
            </div>

            {/* Columna de Materias */}
            <div className="md:col-span-1 space-y-2">
              <Label>Materias</Label>
              <div className="border rounded-md p-2 h-80 overflow-y-auto bg-white">
                {selectedPlan ? selectedPlan.materias.map(item => (
                  <div key={item.materia.id} className="p-2 border-b">
                    <p className="font-semibold">{item.materia.nombre}</p>
                    <p className="text-xs text-gray-500">
                    </p>
                  </div>
                )) : <p className="text-sm text-gray-500 p-4">Seleccione un plan para ver sus materias.</p>}
              </div>
            </div>
            
            {/* Columna de Filtros */}
            <div className="md:col-span-1 space-y-2"></div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setStep('buscar')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
