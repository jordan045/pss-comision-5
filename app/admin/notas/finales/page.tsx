"use client"

// Se añade 'useState' para manejar el estado del formulario
import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function CargarNotasFinalesPage() {
  // Estado para controlar si el formulario fue enviado
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Función placeholder para el botón Volver
  const handleVolver = () => {
    // Redirige al portal de administración
    window.location.href = "/admin"
  }

  // Nueva función para manejar el envío del formulario
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault() // Evita que la página se recargue
    // Aquí iría la lógica de envío de datos (fetch, API call, etc.)
    // Por ahora, solo actualizamos el estado para mostrar la confirmación
    setIsSubmitted(true)
  }

  // --- VISTA DE CONFIRMACIÓN (SI EL FORMULARIO FUE ENVIADO) ---
  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        {/* Contenedor blanco con posicionamiento relativo */}
        <div className="w-full max-w-5xl bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[60vh] relative flex items-center justify-center">
          
          {/* Texto de confirmación centrado */}
          <h2 className="text-2xl text-gray-700">
            Nota enviada a docente para confirmacion
          </h2>
          
          {/* Botón "Volver" posicionado abajo a la derecha */}
          <Button 
            type="button" 
            onClick={handleVolver} // Reutiliza la función 'handleVolver'
            className="bg-gray-900 hover:bg-black text-white absolute bottom-6 right-6"
          >
            Volver
          </Button>
        
        </div>
      </main>
    )
  }

  // --- VISTA DEL FORMULARIO (ESTADO INICIAL) ---
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      
      <div className="w-full max-w-5xl bg-white p-6 md:p-8 rounded-lg shadow-md">
        
        {/* --- Encabezado --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Cargar Notas Finales</h1>
          <p className="text-gray-600">Cargar nota y alumno</p>
        </div>

        {/* --- Formulario Principal --- */}
        {/* Se añade el manejador 'onSubmit' al formulario */}
        <form onSubmit={handleSubmit}>
          {/* Grid de 3 columnas para el formulario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* --- Columna 1 --- */}
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="mesaExamen">Mesa de Examen (Código)<span className="text-red-500">*</span></Label>
                <Input id="mesaExamen" placeholder="Campo de texto vacío" />
              </div>
              <div>
                <Label htmlFor="alumno">Alumno (Legajo)<span className="text-red-500">*</span></Label>
                <Input id="alumno" placeholder="Campo de texto vacío" />
              </div>
              <div>
                <Label htmlFor="cursada">Cursada<span className="text-red-500">*</span></Label>
                <Input id="cursada" value="Recuperada desde la mesa de examen" readOnly disabled />
              </div>
            </div>

            {/* --- Columna 2 --- */}
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="docente">Docente Responsable (Legajo)<span className="text-red-500">*</span></Label>
                <Input id="docente" value="Recuperado de la cursada" readOnly disabled />
              </div>
              <div>
                <Label htmlFor="notaFinal">Nota Final<span className="text-red-500">*</span></Label>
                <Input id="notaFinal" type="number" placeholder="Campo de texto vacío" />
              </div>
              <div>
                <Label htmlFor="estado">Estado<span className="text-red-500">*</span></Label>
                <Select defaultValue="aprobado">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="desaprobado">Desaprobado</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Columna 3 --- */}
            <div className="flex flex-col gap-4 md:col-span-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea 
                id="observaciones" 
                placeholder="Campo de texto vacío" 
                className="h-full min-h-[200px] md:min-h-full" // Ajusta la altura
              />
            </div>
          </div>

          {/* --- Pie de página del formulario y botones --- */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <p className="text-sm text-gray-500">
              Los campos etiquetados con <span className="text-red-500">*</span> son obligatorios
            </p>
            
            <div className="flex gap-4">
              {/* El botón 'Cargar nota' ahora es de tipo 'submit' */}
              <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white">
                Cargar nota
              </Button>
              <Button 
                type="button" 
                onClick={handleVolver}
                className="bg-gray-900 hover:bg-black text-white"
              >
                Volver
              </Button>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}