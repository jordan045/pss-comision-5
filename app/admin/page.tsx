import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminPortal() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h2 className="text-xl font-semibold">Portal Administrativo</h2>

      <div className="flex flex-col gap-2 w-64">
        <Link href="/admin/carreras"><Button>Gestión de Carreras</Button></Link>
        <Link href="/admin/materias"><Button>Gestión de Materias</Button></Link>
        <Link href="/admin/planes"><Button>Gestión de Planes</Button></Link>
        <Link href="/admin/usuarios"><Button>Gestión de Usuarios</Button></Link>
        <Link href="/admin/inscripciones"><Button>Gestión de Inscripciones</Button></Link>
      </div>
    </main>
  )
}
