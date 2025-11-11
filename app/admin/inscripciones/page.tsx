import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GestionInscripciones() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-semibold mb-6">Gestión de Inscripciones</h2>

      {/* Contenedor centrado con sombra y separación */}
      <div className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <Link href="/admin/inscripciones/crear" className="w-full">
          <Button className="w-full py-2 text-base">Inscribir Alumno a Carrera</Button>
        </Link>
        <Link href="/admin/inscripciones-cursadas/crear" className="w-full">
          <Button className="w-full py-2 text-base">Inscribir Alumno a Cursada</Button>
        </Link>
        <Link href="/admin/inscripciones/consultar" className="w-full">
          <Button className="w-full py-2 text-base">Consultar Inscripciones a Carreras</Button>
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
