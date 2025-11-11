"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function AdminPortal() {
  const handleLogout = async () => {
      await signOut({ callbackUrl: "/login" }) // 👈 redirige al login al cerrar sesión
  }

  return (
    // Se ha ajustado el layout principal para centrar mejor el contenido
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-semibold">Portal Administrativo</h2>

      {/* CORRECCIÓN: 
        Se cambia 'grid-cols-1 md:grid-cols-2' por dos 'div' explícitos
        para forzar el ordenamiento por columnas (vertical) tal como en la imagen.
        El 'div' principal ahora es un 'flex' que envuelve las dos columnas.
      */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
        
        {/* --- Columna 1 --- */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* Se reemplaza 'Link' por 'a' para evitar el error de importación */}
          <a href="/admin/carreras">
            {/* Hacemos los botones más grandes para que coincidan con la imagen */}
            <Button className="w-full h-16 text-base">Gestión de Carreras</Button>
          </a>
          <a href="/admin/materias">
            <Button className="w-full h-16 text-base">Gestión de Materias</Button>
          </a>
          <a href="/admin/planes">
            <Button className="w-full h-16 text-base">Gestión de Planes</Button>
          </a>
          <a href="/admin/usuarios">
            <Button className="w-full h-16 text-base">Gestión de Usuarios</Button>
          </a>
          {/* Botón nuevo de la imagen */}
          <a href="/admin/notas/finales">
            <Button className="w-full h-16 text-base">Cargar Notas Finales</Button>
          </a>
        </div>

        {/* --- Columna 2 --- */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* Botón existente, preservando su 'href' */}
          {/* Se reemplaza 'Link' por 'a' */}
          <a href="/admin/inscripciones">
            <Button className="w-full h-16 text-base">Gestión de Inscripciones</Button>
          </a>
          {/* Botones nuevos de la imagen */}
          <a href="/admin/cursadas">
            <Button className="w-full h-16 text-base">Gestión de Cursadas</Button>
          </a>
          <a href="/admin/alumnos-cursadas">
            <Button className="w-full h-16 text-base">Gestión de Alumnos y Cursadas</Button>
          </a>
          <a href="/admin/mesas-examen">
            <Button className="w-full h-16 text-base">Gestión de Mesas de Examen</Button>
          </a>
          <a href="/admin/notas/parciales">
            <Button className="w-full h-16 text-base">Cargar Notas Parciales</Button>
          </a>
        </div>
      </div>

      {/* 🔒 Botón para cerrar sesión, ahora fuera del grid */}
      <Button
        variant="destructive"
        onClick={handleLogout} // Lógica de logout preservada
        className="bg-red-500 hover:bg-red-600 mt-4 w-full max-w-lg text-base py-3"
      >
        Cerrar sesión
      </Button>
    </main>
  )
}