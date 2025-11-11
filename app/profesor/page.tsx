"use client"

// import Link from "next/link" // Eliminado: No se puede resolver en este entorno
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function DocentePortal() {
    // Esta función se modifica para no depender de 'next-auth'
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" }) // 👈 redirige al login al cerrar sesión
    }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Portal Docente</h2>

      {/* Se añaden los nuevos botones y se aumenta el ancho del contenedor */}
      <div className="flex flex-col gap-3 w-72">
        
        {/* Botón existente (se cambia Link por <a> y se añaden estilos) */}
        <a href="/profesor/cursadas">
          <Button className="w-full h-14 text-base">Gestión de Cursadas</Button>
        </a>
        
        {/* Botón existente (se cambia Link por <a> y se añaden estilos) */}
        <a href="/profesor/mesas">
          <Button className="w-full h-14 text-base">Gestión de Mesas de Examen</Button>
        </a>

        {/* --- Botones Nuevos --- */}
        <a href="/profesor/notas/finales">
          <Button className="w-full h-14 text-base">Gestión Notas Finales</Button>
        </a>
        <a href="/profesor/notas/parciales">
          <Button className="w-full h-14 text-base">Gestión Notas Parciales</Button>
        </a>
        {/* --- Fin Botones Nuevos --- */}


        {/* 🔒 Botón para cerrar sesión (lógica preservada, estilos ajustados) */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 mt-4 w-full h-14 text-base"
        >
          Cerrar sesión
        </Button>
      </div>
    </main>
  )
}