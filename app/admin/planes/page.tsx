import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionPlanes() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Gestión de Planes</h2>

      <div className="flex flex-col gap-2 w-64">
        <Link href="/admin/planes/crear"><Button>Crear</Button></Link>
        <Link href="/admin/planes/modificar"><Button>Modificar</Button></Link>
        <Link href="/admin/planes/consultar"><Button>Consultar</Button></Link>
      </div>

      <Link href="/admin">
        <Button variant="secondary" className="mt-4">Volver</Button>
      </Link>
    </main>
  )
}
