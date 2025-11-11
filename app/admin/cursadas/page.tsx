import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionCursadasAdmin() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-semibold mb-2">Gestión de Cursadas</h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/admin/cursadas/crear">
          <Button className="w-full h-16 text-base">Crear Cursada</Button>
        </Link>

        <Link href="/admin/cursadas/consultar">
          <Button className="w-full h-16 text-base">Consultar Cursadas</Button>
        </Link>

        <Link href="/admin/cursadas/modificar">
          <Button className="w-full h-16 text-base">Modificar Cursada</Button>
        </Link>

        <Link href="/admin/cursadas/lista-inscriptos">
          <Button className="w-full h-16 text-base">Generar Lista de Inscriptos a Cursadas</Button>
        </Link>
      </div>

      <Link href="/admin">
        <Button variant="outline" className="mt-4 w-full max-w-md">
          Volver al Portal Administrativo
        </Button>
      </Link>
    </main>
  )
}
