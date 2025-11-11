"use client"

// No se usa 'Link' para mantener la compatibilidad
import { Button } from "@/components/ui/button"

export default function GestionNotasFinalesPage() {

  // Función para el botón Volver
  const handleVolver = () => {
    // Redirige al portal principal del docente
    window.location.href = "/profesor"
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 relative">
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[60vh] flex flex-col items-center justify-center">
        
        {/* --- Título --- */}
        <h1 className="text-3xl font-semibold mb-10 text-gray-800">
          Gestión Notas Parciales
        </h1>

        {/* --- Contenedor de Botones Centrales --- */}
        <div className="flex flex-col gap-5 w-72">

          <a href="/profesor/notas/finales/cargar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Cargar nueva nota
            </Button>
          </a>      

          <a href="/profesor/notas/finales/confirmar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Confirmar notas
            </Button>
          </a>
        </div>
      </div>

      <Button 
        type="button" 
        onClick={handleVolver}
        className="bg-gray-900 hover:bg-black text-white absolute bottom-6 right-6"
      >
        Volver
      </Button>
    </main>
  )
}