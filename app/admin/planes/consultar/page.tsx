import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function ConsultarPlan() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Consultar Plan de Estudio</h2>

      <form className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código o nombre de carrera</Label>
          <Input placeholder="Ej: LCC" />
        </div>

        <div className="flex gap-3 mt-3">
          <Link href="/admin/planes">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Link href="/admin/planes/consultar/lista">
            <Button>Consultar</Button>
          </Link>
        </div>
      </form>
    </main>
  )
}
