import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ModificarAlumno() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Modificar Usuario (Alumno)</h2>
      <form className="flex flex-col gap-3 w-80">
        <div><Label>Nombre</Label><Input /></div>
        <div><Label>Apellido</Label><Input /></div>
        <div><Label>Email</Label><Input /></div>
        <div><Label>Actualizar Contraseña</Label><Input type="password" /></div>

        <div className="flex gap-3 mt-4">
          <Link href="/admin/usuarios/modificar">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Link href="/admin/usuarios/modificar/exito">
            <Button>Modificar</Button>
          </Link>
        </div>
      </form>
    </main>
  )
}
