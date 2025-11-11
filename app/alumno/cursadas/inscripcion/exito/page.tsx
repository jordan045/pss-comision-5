// app/alumno/cursadas/inscripcion/exito/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExitoInscripcionCursadaPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md text-center space-y-6">
        <h2 className="text-2xl font-semibold">Inscripción exitosa</h2>
        <p className="text-sm text-gray-600">
          Te inscribiste correctamente a la cursada seleccionada. Podrás ver el
          estado y avances desde tu portal de alumno.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/alumno">
            <Button className="w-full">Volver al portal</Button>
          </Link>
          <Link href="/alumno/cursadas/inscripcion/crear">
            <Button variant="secondary" className="w-full">Inscribir otra cursada</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
