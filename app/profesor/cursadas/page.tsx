import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionCursadas() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-lg font-semibold mb-2">Gestión de Cursadas</h2>

      <div className="flex flex-col gap-3 w-60">
        <Link href="/profesor/cursadas/crear">
          <Button className="w-full">Crear</Button>
        </Link>

        <Link href="/profesor/cursadas/modificar">
          <Button className="w-full">Modificar</Button>
        </Link>

        <Link href="/profesor/cursadas/baja">
          <Button className="w-full">Dar de baja</Button>
        </Link>

        <Link href="/profesor/cursadas/consultar">
          <Button className="w-full">Consultar</Button>
        </Link>

        <Link href="/profesor/cursadas/lista-inscriptos">
          <Button className="w-full">Generar lista de inscriptos</Button>
        </Link>
      </div>

      <Link href="/profesor">
        <Button className="mt-4 w-60">Volver</Button>
      </Link>
    </main>
  )
}
