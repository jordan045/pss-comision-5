"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CursadaCreadaExitoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-black mb-8">
          ¡Cursada cerrada con éxito!
        </h1>

        <div className="flex justify-end">
          <Link href="/profesor/cursadas">
            <Button className="w-40">Volver</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
