"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function SeleccionarRolCrear() {
  const [rol, setRol] = useState<string | null>(null)

  const hrefPorRol: Record<string, string> = {
    alumno: "/admin/usuarios/crear/alumno",
    docente: "/admin/usuarios/crear/docente",
    administrativo: "/admin/usuarios/crear/administrativo",
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl font-semibold">Crear Usuario Universitario</h2>

      {/* mismo ancho que los botones: */}
      <div className="flex flex-col gap-3 w-64">
        <Label>Seleccione rol</Label>
        <Select onValueChange={setRol}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Listado de roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alumno">Alumno</SelectItem>
            <SelectItem value="docente">Docente</SelectItem>
            <SelectItem value="administrativo">Administrativo</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón “Continuar” negro, solo si hay rol seleccionado */}
        {rol && (
          <Link href={hrefPorRol[rol]} className="w-full">
            <Button className="w-full bg-black text-white hover:bg-black/90">
              Continuar
            </Button>
          </Link>
        )}
      </div>

      {/* Botón Volver con el mismo ancho (opcional) */}
      <div className="w-64">
        <Link href="/admin/usuarios">
          <Button variant="secondary" className="w-full">Volver</Button>
        </Link>
      </div>
    </main>
  )
}
