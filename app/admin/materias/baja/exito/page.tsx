import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExitoBajaMateria() {
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

          <h2 className="text-2xl font-semibold mb-2">¡Materia dada de baja correctamente!</h2>
          
          <p className="text-gray-600 mb-6">
            La materia ha sido desactivada en el sistema.
          </p>

          <Link href="/admin/materias">
            <Button className="w-full bg-black hover:bg-black/90">
              Volver al listado
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
