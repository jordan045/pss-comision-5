"use client"

// Se añade 'useState' para manejar el estado del formulario
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function InscribirAlumnoMesaPage() {
  // Estado para controlar si el formulario fue enviado
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mesaExamen, setMesaExamen] = useState('');
  const [alumno, setAlumno] = useState('');
  const [estado, setEstado] = useState('');

  // Función para el botón Volver
  const handleVolver = () => {
    // Redirige a la página anterior de gestión de alumnos
    window.location.href = "/admin/mesas-examen/gestionar-alumnos"
  }

  // Nueva función para manejar el envío del formulario
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Evita que la página se recargue
    // Lógica de inscripción...
    
    // Mostramos la pantalla de confirmación
    setIsSubmitted(true)
  }

  // --- VISTA DE CONFIRMACIÓN (Screen 77) ---
  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        {/* Contenedor blanco con posicionamiento relativo */}
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[50vh] relative flex items-center justify-center">
          
          {/* Texto de confirmación centrado */}
          <h2 className="text-3xl font-semibold text-gray-800 text-center">
            ¡Alumno inscripto a examen con éxito!
          </h2>
          
          {/* Botón "Volver" posicionado abajo a la derecha */}
          <Button 
            type="button" 
            onClick={handleVolver} // Reutiliza la función 'handleVolver'
            className="bg-gray-900 hover:bg-black text-white absolute bottom-6 right-6 h-14 px-8 text-base"
          >
            Volver
          </Button>
        
        </div>
      </main>
    )
  }

  // --- VISTA DEL FORMULARIO (Screen 76) ---
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-lg shadow-md">
        
        {/* --- Encabezado --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Gestión de Alumnos y Mesas de Examen</h1>
          <p className="text-gray-600">Inscribir alumno a examen</p>
        </div>

        {/* --- Formulario Principal --- */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* --- Campos del Formulario --- */}
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="mesaExamen">Mesa de Examen<span className="text-red-500">*</span></Label>
              <Select name="mesaExamen" value={mesaExamen} onValueChange={setMesaExamen}>
                <SelectTrigger id="mesaExamen">
                  <SelectValue placeholder="Listado de mesas de examen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mesa1">Mesa 1 - Álgebra</SelectItem>
                  <SelectItem value="mesa2">Mesa 2 - Análisis II</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="alumno">ID Alumno<span className="text-red-500">*</span></Label>
              <Input id="alumno" placeholder="Campo de texto vacío" />
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

          {/* --- Pie de página del formulario y botones --- */}
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
                Dar baja
              </Button>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}