"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ExitoCarrera() {
  const params = useSearchParams()
  const router = useRouter()
  const accion = params.get("accion")

  const mensaje =
    accion === "crear"
      ? "¡Carrera creada con éxito!"
      : accion === "modificar"
      ? "¡Carrera modificada con éxito!"
      : "¡Carrera dada de baja con éxito!"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">{mensaje}</h2>
      <Button onClick={() => router.push("/admin/carreras")}>Volver</Button>
    </main>
  )
}
