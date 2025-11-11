import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionMaterias() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-semibold mb-6">Gestión de Materias</h2>

      {/* Contenedor centrado con sombra y separación */}
      <div className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <Link href="/admin/materias/crear" className="w-full">
          <Button className="w-full py-2 text-base">Crear</Button>
        </Link>
        <Link href="/admin/materias/modificar" className="w-full">
          <Button className="w-full py-2 text-base">Modificar</Button>
        </Link>
        <Link href="/admin/materias/baja" className="w-full">
          <Button className="w-full py-2 text-base">Dar de baja</Button>
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

