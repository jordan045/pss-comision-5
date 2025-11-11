"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type Materia = {
  id: number;
  nombre: string;
  codigo: string;
};

type MesaExamen = {
  id: number;
  fecha: string;
  estado: string;
  materia: Materia;
};

export default function ConsultarMesasExamenPage() {
  const [mesas, setMesas] = useState<MesaExamen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMesasExamen = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/mesa-examen");
        if (!response.ok) {
          throw new Error("Error al obtener las mesas de examen");
        }
        const data = await response.json();
        setMesas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMesasExamen();
  }, []);

  const handleVolver = () => {
    window.location.href = "/admin/mesas-examen";
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Mesas de Examen</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Materia</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((mesa) => (
                  <tr key={mesa.id} className="border-b">
                    <td className="px-4 py-2">{mesa.materia.nombre}</td>
                    <td className="px-4 py-2">
                      {new Date(mesa.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{mesa.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={handleVolver}>
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
