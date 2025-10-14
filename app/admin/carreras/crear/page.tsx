"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function CrearCarrera() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [codigo, setCodigo] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/admin/carreras/exito?accion=crear")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Crear Carrera</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <div>
          <Label>Código</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: LCC01" required />
        </div>
        <div>
          <Label>Nombre</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Lic. en Computación" required />
        </div>
        <div>
          <Label>Título otorgado</Label>
          <Input placeholder="Licenciado en..." required />
        </div>
        <div>
          <Label>Nivel académico</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Seleccione nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="grado">Grado</SelectItem>
              <SelectItem value="tecnicatura">Tecnicatura</SelectItem>
              <SelectItem value="posgrado">Posgrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duración (años)</Label>
          <Input type="number" placeholder="Ej: 4" required />
        </div>
        <div>
          <Label>Facultad asociada</Label>
          <Input placeholder="Facultad de Ingeniería" required />
        </div>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Volver</Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </main>
  )
}
