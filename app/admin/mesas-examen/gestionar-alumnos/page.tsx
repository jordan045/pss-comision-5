"use client"

// No se usa 'Link' para mantener la compatibilidad
import { Button } from "@/components/ui/button"

export default function GestionAlumnosMesasPage() {

  // Función para el botón Volver
  const handleVolver = () => {
    // Redirige a la página anterior de gestión de mesas
    window.location.href = "/admin/mesas-examen"
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 relative">
      
      {/* Contenedor blanco principal */}
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[70vh] flex flex-col items-center justify-center">
        
        {/* --- Título --- */}
        <h1 className="text-3xl font-semibold mb-10 text-gray-800 text-center">
          Gestión de Alumnos y Mesas de Examen
        </h1>

        {/* --- Contenedor de Botones Centrales --- */}
        <div className="flex flex-col gap-5 w-80">
          
          {/* Asumimos rutas lógicas para cada acción */}
          <a href="/admin/mesas-examen/gestionar-alumnos/inscribir">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Inscribir alumno
            </Button>
          </a>
          
          <a href="/admin/mesas-examen/gestionar-alumnos/dar-baja">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Dar de baja inscripcion
            </Button>
          </a>
          
        </div>

        {/* --- Botón Volver (Centrado abajo) --- */}
        {/* Se posiciona de forma absoluta en el div, pero centrado en la parte inferior */}
        <div className="absolute bottom-6">
          <Button 
            type="button" 
            onClick={handleVolver}
            className="bg-gray-900 hover:bg-black text-white h-14 w-80 text-base"
          >
            Volver
          </Button>
        </div>
      
      </div>
    </main>
  )
}