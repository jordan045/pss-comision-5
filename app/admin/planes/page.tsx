import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionPlanes() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-semibold mb-6">Gestión de Planes</h2>

      {/* Contenedor centrado con sombra y separación */}
      <div className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <Link href="/admin/planes/crear" className="w-full">
          <Button className="w-full py-2 text-base">Crear</Button>
        </Link>
        <Link href="/admin/planes/modificar" className="w-full">
          <Button className="w-full py-2 text-base">Modificar</Button>
        </Link>
        <Link href="/admin/planes/consultar" className="w-full">
          <Button className="w-full py-2 text-base">Consultar</Button>
        </Link>
      </div>

      {/* Botón de volver centrado debajo */}
      <Link href="/admin" className="mt-6">
        <Button variant="secondary" className="px-6 py-2 text-base">
          Volver
        </Button>
      </Link>
    </main>
  )
}
