import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionMaterias() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-lg font-semibold mb-2">Gestión de Materias</h2>

      <div className="flex flex-col gap-3 w-60">
        <Link href="/admin/materias/crear">
          <Button
            className="w-full"
          >
            Crear
          </Button>
        </Link>

        <Link href="/admin/materias/modificar">
          <Button
            className="w-full"
          >
            Modificar
          </Button>
        </Link>

        <Link href="/admin/materias/baja">
          <Button
            className="w-full"
          >
            Dar de baja
          </Button>
        </Link>
      </div>

      <Link href="/admin">
        <Button
          className="mt-4 w-60"
        >
          Volver
        </Button>
      </Link>
    </main>
  )
}

