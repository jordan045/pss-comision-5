"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function DarDeBajaCarrera() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/admin/carreras/exito?accion=baja")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Dar de Baja Carrera</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código de carrera</Label>
          <Input placeholder="Ej: LCC01" required />
        </div>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Volver</Button>
          <Button type="submit" variant="destructive">Dar de Baja</Button>
        </div>
      </form>
    </main>
  )
}
