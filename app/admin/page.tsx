"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function AdminPortal() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }) // 👈 redirige al login al cerrar sesión
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Portal Administrativo</h2>

      <div className="flex flex-col gap-2 w-64">
        <Link href="/admin/carreras">
          <Button className="w-full">Gestión de Carreras</Button>
        </Link>
        <Link href="/admin/materias">
          <Button className="w-full">Gestión de Materias</Button>
        </Link>
        <Link href="/admin/planes">
          <Button className="w-full">Gestión de Planes</Button>
        </Link>
        <Link href="/admin/usuarios">
          <Button className="w-full">Gestión de Usuarios</Button>
        </Link>
        <Link href="/admin/inscripciones">
          <Button className="w-full">Gestión de Inscripciones</Button>
        </Link>

        {/* 🔒 Botón para cerrar sesión */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 mt-3"
        >
          Cerrar sesión
        </Button>
      </div>
    </main>
  )
}
