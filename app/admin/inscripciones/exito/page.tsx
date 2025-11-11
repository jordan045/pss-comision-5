// app/admin/inscripciones/exito/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InscripcionExitoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-md text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">¡Inscripción creada con éxito!</h2>
          
          <p className="text-gray-600 mb-6">
            El alumno ha sido inscrito correctamente a la carrera.
          </p>

          <Link href="/admin/inscripciones">
            <Button className="w-full bg-black hover:bg-black/90">
              Volver a Gestión de Inscripciones
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
