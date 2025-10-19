import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExitoBajaMateria() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-lg font-semibold text-center">¡Materia dada de baja correctamente!</h2>
      <Link href="/admin/materias">
        <Button>Volver</Button>
      </Link>
    </main>
  )
}
