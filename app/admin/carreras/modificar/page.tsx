"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function ModificarCarrera() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/admin/carreras/exito?accion=modificar")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Modificar Carrera</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código de carrera</Label>
          <Input placeholder="Buscar por código..." required />
        </div>
        <div>
          <Label>Nuevo nombre</Label>
          <Input placeholder="Nuevo nombre de carrera" />
        </div>
        <div>
          <Label>Nueva duración (años)</Label>
          <Input type="number" />
        </div>
        <div>
          <Label>Nuevo estado</Label>
          <Input placeholder="Activa / Inactiva" />
        </div>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Volver</Button>
          <Button type="submit">Modificar</Button>
        </div>
      </form>
    </main>
  )
}
