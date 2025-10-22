"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

// --- Tipos y Simulación de la Base de Datos ---
type Materia = {
  id: number;
  nombre: string;
  tipo: string;
  creditos: number;
  año: number;
};

type PlanDeEstudio = {
  id: number;
  nombre: string;
  estado: "VIGENTE" | "BORRADOR" | "INACTIVO";
  materias: Materia[];
};

type CarreraEncontrada = {
  id: number;
  codigo: string;
  nombre: string;
  planes: PlanDeEstudio[];
};

// Datos de ejemplo que simulan una carrera encontrada en la BD
const carreraMock: CarreraEncontrada = {
  id: 1,
  codigo: "LIC-COMP",
  nombre: "Licenciatura en Ciencias de la Computación",
  planes: [
    {
      id: 10,
      nombre: "Plan de Estudios 2020",
      estado: "VIGENTE",
      materias: [
        { id: 101, nombre: "Algoritmos I", tipo: "Obligatoria", creditos: 8, año: 1 },
        { id: 102, nombre: "Matemática Discreta", tipo: "Obligatoria", creditos: 8, año: 1 },
        { id: 201, nombre: "Sistemas Operativos", tipo: "Obligatoria", creditos: 8, año: 2 },
      ],
    },
    {
      id: 11,
      nombre: "Plan de Estudios 2023",
      estado: "VIGENTE",
      materias: [
        { id: 101, nombre: "Algoritmos y Estructuras de Datos", tipo: "Obligatoria", creditos: 10, año: 1 },
        { id: 102, nombre: "Análisis Matemático", tipo: "Obligatoria", creditos: 8, año: 1 },
        { id: 301, nombre: "Inteligencia Artificial", tipo: "Optativa", creditos: 6, año: 3 },
      ],
    },
    {
      id: 9,
      nombre: "Plan de Estudios 2015",
      estado: "INACTIVO",
      materias: [
        { id: 51, nombre: "Introducción a la Programación", tipo: "Obligatoria", creditos: 6, año: 1 },
      ],
    },
  ],
};
// --- Fin de la simulación ---

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
      setSelectedPlan(carrera.planes[0] || null);
      setStep('consultar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar la carrera');
    } finally {
      setIsLoading(false);
    }
  };

  const planesFiltrados = carreraData?.planes.filter(p => 
    filtroEstado === 'todos' || p.estado === filtroEstado
  ) || [];

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
              <div className="border rounded-md p-2 h-80 overflow-y-auto bg-white">
                {planesFiltrados.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-2 rounded cursor-pointer ${selectedPlan?.id === plan.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <p className="font-semibold">{plan.nombre}</p>
                    <p className="text-xs text-gray-500">{plan.estado}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna de Materias */}
            <div className="md:col-span-1 space-y-2">
              <Label>Materias</Label>
              <div className="border rounded-md p-2 h-80 overflow-y-auto bg-white">
                {selectedPlan ? selectedPlan.materias.map(materia => (
                  <div key={materia.id} className="p-2 border-b">
                    <p className="font-semibold">{materia.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {materia.año}º año - {materia.creditos} créditos - {materia.tipo}
                    </p>
                  </div>
                )) : <p className="text-sm text-gray-500 p-4">Seleccione un plan para ver sus materias.</p>}
              </div>
            </div>
            
            {/* Columna de Filtros */}
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="filtro-estado">Filtrar por Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger id="filtro-estado">
                  <SelectValue placeholder="Listado de estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="VIGENTE">Vigente</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setStep('buscar')}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
