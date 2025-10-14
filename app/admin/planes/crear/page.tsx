import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function CrearPlan() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Crear Plan de Estudio</h2>
      <form className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código del plan</Label>
          <Input placeholder="Ej: PLAN2025" />
        </div>
        <div>
          <Label>Nombre del plan</Label>
          <Input placeholder="Plan de Computación 2025" />
        </div>
        <div>
          <Label>Carrera asociada</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Seleccione una carrera" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="comp">Lic. en Computación</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Versión</Label>
          <Input placeholder="Ej: 2025" />
        </div>
        <div>
          <Label>Estado</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vigente">Vigente</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 mt-4">
          <Link href="/admin/planes">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Link href="/admin/planes/exito?accion=crear">
            <Button>Crear</Button>
          </Link>
        </div>
      </form>
    </main>
  )
}
