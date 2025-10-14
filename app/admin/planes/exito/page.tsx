"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ExitoPlan() {
  const params = useSearchParams()
  const accion = params.get("accion")

  const mensaje =
    accion === "crear"
      ? "¡Plan de estudio creado con éxito!"
      : accion === "modificar"
      ? "¡Plan de estudio modificado con éxito!"
      : "Operación completada correctamente."

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">{mensaje}</h2>
      <Link href="/admin/planes">
        <Button>Volver</Button>
      </Link>
    </main>
  )
}
