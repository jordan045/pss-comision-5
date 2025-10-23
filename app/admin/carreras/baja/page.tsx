"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation" // No se usa para mantenerlo simple
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
// Eliminamos la importación del alert-dialog ya que usaremos componentes básicos
import { Loader2, AlertTriangle } from "lucide-react"

interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
}

export default function DarDeBajaCarreraPage() {
  const [codigo, setCodigo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado para el popup de confirmación
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  // Estado para el popup de error
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  
  const [carreraEncontrada, setCarreraEncontrada] = useState<string | null>(null)
  const [errorMensaje, setErrorMensaje] = useState("")

  // 1. Manejador del formulario: Busca la carrera
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMensaje("")
    
    try {
      const response = await fetch(`/api/carreras/by-codigo?codigo=${encodeURIComponent(codigo.trim())}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setErrorMensaje("La carrera no existe o el código es incorrecto.")
          setShowErrorPopup(true)
        } else {
          setErrorMensaje("Error al buscar la carrera. Por favor, intente nuevamente.")
          setShowErrorPopup(true)
        }
        return
      }

      const carrera: Carrera = await response.json()
      setCarreraEncontrada(carrera.nombre)
      setShowConfirmPopup(true)
    } catch (error) {
      setErrorMensaje("Error de conexión. Por favor, intente nuevamente.")
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Acción final: Dar de baja la carrera
  const handleBajaDefinitiva = async () => {
    setShowConfirmPopup(false)
    setIsLoading(true)
    setErrorMensaje("") // Limpiamos errores anteriores
    
    try {
      // --- Esta es la llamada DELETE real ---
      // La URL debe coincidir con tu API: /api/carreras/[codigo]/baja
      const res = await fetch(`/api/carreras/${encodeURIComponent(codigo.trim())}/baja`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Si el backend devuelve un error (ej: 404, 500)
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al dar de baja la carrera");
      }

      // Si todo salió bien, redirigir a la pantalla de éxito
      alert("Baja exitosa. Redirigiendo...");
      window.location.href = "/admin/carreras/exito?accion=baja";

    } catch (error: any) {
      // Si el fetch falla (error de red o del backend)
      setErrorMensaje(error.message);
      setShowErrorPopup(true);
    } finally {
      // Detener la animación de carga en cualquier caso
      setIsLoading(false);
    }
  }

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Gestión de Carreras</CardTitle>
            <CardDescription>Dar de baja una carrera</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código Único de Carrera*</Label>
                <Input 
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Campo de texto vacío" 
                  required 
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Los campos etiquetados con * son obligatorios
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  disabled={isLoading}
                  className="mt-2 sm:mt-0"
                >
                  Volver
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Dar de Baja"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Popup de Confirmación */}
      {showConfirmPopup && (
        <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-sm max-w-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-900">¿Está seguro?</p>
            </div>
            <p className="text-sm text-yellow-800">
              Está a punto de dar de baja la carrera: <strong>{carreraEncontrada}</strong>
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowConfirmPopup(false)}>
                Cancelar
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBajaDefinitiva}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {showErrorPopup && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 shadow-sm max-w-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{errorMensaje}</p>
          </div>
        </div>
      )}
    </>
  )
}

