import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionCarreras() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Gestión de Carreras</h2>

      <div className="flex flex-col gap-2 w-64">
        <Link href="/admin/carreras/crear"><Button>Crear</Button></Link>
        <Link href="/admin/carreras/modificar"><Button>Modificar</Button></Link>
        <Link href="/admin/carreras/baja"><Button>Dar de baja</Button></Link>
      </div>

      <Link href="/admin"><Button variant="secondary" className="mt-3">Volver</Button></Link>
    </main>
  )
}
