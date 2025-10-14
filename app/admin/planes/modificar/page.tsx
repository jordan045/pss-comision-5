import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ModificarPlan() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Modificar Plan de Estudio</h2>
      <form className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código del plan</Label>
          <Input placeholder="Ej: PLAN2025" />
        </div>
        <div>
          <Label>Nuevo nombre</Label>
          <Input placeholder="Plan actualizado" />
        </div>
        <div>
          <Label>Nueva versión</Label>
          <Input placeholder="Ej: v2" />
        </div>

        <div className="flex gap-3 mt-4">
          <Link href="/admin/planes">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Link href="/admin/planes/exito?accion=modificar">
            <Button>Modificar</Button>
          </Link>
        </div>
      </form>
    </main>
  )
}
