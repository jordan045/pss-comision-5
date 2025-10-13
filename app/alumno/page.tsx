"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { signOut } from "next-auth/react"

export default function PortalAlumno() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }) // 👈 redirige al login después de cerrar sesión
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Portal Alumno</h2>

      <div className="flex flex-col gap-3 w-72">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Listado de carreras" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cscomp">Ciencias de la Computación</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Listado de planes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">Plan 2025</SelectItem>
          </SelectContent>
        </Select>

        <Link href="/alumno/solicitud">
          <Button>Solicitar Inscripción a Administración</Button>
        </Link>

        {/* 🔒 Botón para cerrar sesión */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600"
        >
          Cerrar sesión
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Los campos marcados con * son obligatorios
      </p>
    </main>
  )
}
