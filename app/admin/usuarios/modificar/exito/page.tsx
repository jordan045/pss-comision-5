import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExitoUsuarioModificado() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-lg font-semibold text-center">
        ¡Usuario modificado con éxito!
      </h2>
      <Link href="/admin/usuarios">
        <Button>Volver</Button>
      </Link>
    </main>
  )
}
