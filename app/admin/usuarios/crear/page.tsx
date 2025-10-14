import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function SeleccionarRolCrear() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Crear Usuario Universitario</h2>

      <div className="flex flex-col gap-3 w-80">
        <Label>Seleccione rol</Label>
        <Select>
          <SelectTrigger><SelectValue placeholder="Listado de roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alumno"><Link href="/admin/usuarios/crear/alumno">Alumno</Link></SelectItem>
            <SelectItem value="docente"><Link href="/admin/usuarios/crear/docente">Docente</Link></SelectItem>
            <SelectItem value="administrativo"><Link href="/admin/usuarios/crear/administrativo">Administrativo</Link></SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Link href="/admin/usuarios">
        <Button variant="secondary">Volver</Button>
      </Link>
    </main>
  )
}
