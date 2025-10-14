"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ExitoPage() {
  const params = useSearchParams()
  const accion = params.get("accion")

  const mensaje =
    accion === "crear"
      ? "¡Carrera creada con éxito!"
      : accion === "modificar"
      ? "¡Carrera modificada con éxito!"
      : accion === "baja"
      ? "¡Carrera dada de baja con éxito!"
      : "Operación completada correctamente."

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">{mensaje}</h2>
      <Link href="/admin/carreras">
        <Button>Volver</Button>
      </Link>
    </main>
  )
}
