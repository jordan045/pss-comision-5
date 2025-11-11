"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface MesaExamen {
  id: number; // El ID es numérico según el schema
  fecha: string;
  materia: {
    nombre: string;
  };
}

export default function InscribirAlumnoMesaPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mesaExamen, setMesaExamen] = useState('');
  const [mesas, setMesas] = useState<MesaExamen[]>([]);
  const [alumno, setAlumno] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch('/api/mesa-examen');
        if (res.ok) {
          const data = await res.json();
          setMesas(data);
        }
      } catch (error) {
        console.error("Error fetching mesas de examen:", error);
      }
    };
    fetchMesas();
  }, []);

  const handleVolver = () => {
    window.location.href = "/admin/mesas-examen/gestionar-alumnos"
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() 
    console.log({ mesaExamen, alumno, estado });
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[50vh] relative flex items-center justify-center">
          
          <h2 className="text-3xl font-semibold text-gray-800 text-center">
            ¡Alumno inscripto a examen con éxito!
          </h2>
          
          <Button 
            type="button" 
            onClick={handleVolver} 
            className="bg-gray-900 hover:bg-black text-white absolute bottom-6 right-6 h-14 px-8 text-base"
          >
            Volver
          </Button>
        
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-lg shadow-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Gestión de Alumnos y Mesas de Examen</h1>
          <p className="text-gray-600">Inscribir alumno a examen</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="mesaExamen">Mesa de Examen<span className="text-red-500">*</span></Label>
              <Select name="mesaExamen" value={mesaExamen} onValueChange={setMesaExamen}>
                <SelectTrigger id="mesaExamen">
                  <SelectValue placeholder="Listado de mesas de examen" />
                </SelectTrigger>
                <SelectContent>
                  {mesas.map((mesa) => (
                    <SelectItem key={mesa.id} value={String(mesa.id)}>
                      {`${mesa.materia.nombre} - ${new Date(mesa.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="alumno">ID Alumno<span className="text-red-500">*</span></Label>
              <Input id="alumno" placeholder="Campo de texto vacío" value={alumno} onChange={(e) => setAlumno(e.target.value)} />
            </div>
            
            <div>
              <Label htmlFor="estado">Estado de la inscripcion<span className="text-red-500">*</span></Label>
              <Select name="estado" value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Listado de estados de inscripcion..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inscripto">Inscripto</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Los campos etiquetados con <span className="text-red-500">*</span> son obligatorios
            </p>
            
            <div className="flex justify-between items-center gap-4">
              <Button 
                type="button" 
                onClick={handleVolver}
                className="bg-gray-900 hover:bg-black text-white h-14 w-2/5 text-base"
              >
                Volver
              </Button>
              
              <Button 
                type="submit" 
                className="bg-gray-800 hover:bg-gray-900 text-white h-14 w-3/5 text-base"
              >
                Inscribir
              </Button>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}