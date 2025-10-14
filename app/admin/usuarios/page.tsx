import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionUsuarios() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Gestión de Usuarios Universitarios</h2>

      <div className="flex flex-col gap-2 w-64">
        <Link href="/admin/usuarios/crear"><Button>Crear</Button></Link>
        <Link href="/admin/usuarios/modificar"><Button>Modificar</Button></Link>
        <Link href="/admin/usuarios/baja"><Button>Dar de baja</Button></Link>
      </div>

      <Link href="/admin">
        <Button variant="secondary" className="mt-4">Volver</Button>
      </Link>
    </main>
  )
}
