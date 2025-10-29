"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Cursada {
  id: number
  materia: string
  docente: string
  cuatrimestre: string
  anio: number
}

export default function SeleccionarCursadaPage() {
  const [cursadas, setCursadas] = useState<Cursada[]>([])

  useEffect(() => {
    const fetchCursadas = async () => {
      const res = await fetch("/api/cursadas")
      const data = await res.json()
      setCursadas(data)
    }
    fetchCursadas()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Seleccione una cursada a modificar</p>
        </header>

        <div className="grid gap-4">
          {cursadas.map((c) => (
            <div key={c.id} className="flex justify-between items-center border p-3 rounded-md">
              <div>
                <p><strong>Materia:</strong> {c.materia}</p>
                <p><strong>Docente:</strong> {c.docente}</p>
                <p><strong>Cuatrimestre:</strong> {c.cuatrimestre}</p>
                <p><strong>Año:</strong> {c.anio}</p>
              </div>
              <Link href={`/profesor/cursadas/seleccionar/modificar/${c.id}`}>
                <Button>Seleccionar</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
