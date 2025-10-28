"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function DocentePortal() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }) // 👈 redirige al login al cerrar sesión
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Portal Docente</h2>

      <div className="flex flex-col gap-3 w-64">
        <Link href="/profesor/cursadas">
          <Button className="w-full">Gestión de Cursadas</Button>
        </Link>
        <Link href="/profesor/mesas">
          <Button className="w-full">Gestión de Mesas de Examen</Button>
        </Link>

        {/* 🔒 Botón para cerrar sesión */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 mt-4"
        >
          Cerrar sesión
        </Button>
      </div>
    </main>
  )
}
