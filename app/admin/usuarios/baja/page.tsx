import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BajaUsuario() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Dar de Baja Usuario Universitario</h2>
      <form className="flex flex-col gap-3 w-80">
        <div>
          <Label>Legajo / CUIL / Libreta</Label>
          <Input placeholder="Ingrese identificación" />
        </div>

        <div className="flex gap-3 mt-4">
          <Link href="/admin/usuarios">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Link href="/admin/usuarios/baja/seleccionar-rol">
            <Button>Continuar</Button>
          </Link>
        </div>
      </form>
    </main>
  )
}
