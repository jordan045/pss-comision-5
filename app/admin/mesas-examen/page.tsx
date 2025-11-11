"use client"

// No se usa 'Link' para mantener la compatibilidad
import { Button } from "@/components/ui/button"

export default function GestionMesasExamenPage() {

  // Función para el botón Volver
  const handleVolver = () => {
    // Redirige al portal principal del admin
    window.location.href = "/admin"
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 relative">
      
      {/* Contenedor blanco principal */}
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[70vh] flex flex-col items-center justify-center">
        
        {/* --- Título --- */}
        <h1 className="text-3xl font-semibold mb-10 text-gray-800">
          Gestión de Mesas de Examen
        </h1>

        {/* --- Contenedor de Botones Centrales --- */}
        {/* Se usa un ancho mayor para los botones */}
        <div className="flex flex-col gap-5 w-80">
          
          {/* Asumimos rutas lógicas para cada acción */}
          <a href="/admin/mesas-examen/crear">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Crear
            </Button>
          </a>

          <a href="/admin/mesas-examen/consultar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Consultar
            </Button>
          </a>
          
          <a href="/admin/mesas-examen/modificar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Modificar
            </Button>
          </a>
          
          <a href="/admin/mesas-examen/cerrar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Cerrar
            </Button>
          </a>

          <a href="/admin/mesas-examen/cancelar">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Cancelar
            </Button>
          </a>

          <a href="/admin/mesas-examen/gestionar-alumnos">
            <Button className="w-full h-16 text-base bg-gray-800 hover:bg-gray-900">
              Gestionar alumnos
            </Button>
          </a>

        </div>
      
      </div>

      {/* --- Botón Volver (Posicionado en la esquina de la página) --- */}
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