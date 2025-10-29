"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConsultarCursadaPage() {
  const [filters, setFilters] = useState({
    materia: "",
    cuatrimestre: "",
    carrera: "",
    estado: "",
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchCursadas = async () => {
      // Si no hay filtros cargados, no consultar
      if (
        !filters.materia &&
        !filters.cuatrimestre &&
        !filters.carrera &&
        !filters.estado
      ) {
        setResults([])
        return
      }

      setLoading(true)
      const query = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v)
      ).toString()

      try {
        const res = await fetch(`/api/cursadas/consultar?${query}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error("Error al consultar:", err)
      } finally {
        setLoading(false)
      }
    }

    // Consultar cuando cambian los filtros
    fetchCursadas()
  }, [filters])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.id]: e.target.value })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-6xl px-4">
        <header className="text-center mb-8">
          <h2 className="text-2xl font-semibold">Gestión de Cursadas</h2>
          <p className="text-sm text-muted-foreground">Consultar cursadas</p>
        </header>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div>
            <Label htmlFor="materia">Materia (ID)</Label>
            <Input
              id="materia"
              placeholder="Ej: 12"
              value={filters.materia}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="cuatrimestre">Cuatrimestre</Label>
            <Input
              id="cuatrimestre"
              placeholder="Ej: 2"
              value={filters.cuatrimestre}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="carrera">Carrera (ID)</Label>
            <Input
              id="carrera"
              placeholder="Ej: 5"
              value={filters.carrera}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              placeholder="Ej: activa"
              value={filters.estado}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Resultados */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Resultados</h3>

          {loading ? (
            <p className="text-gray-600">Buscando cursadas...</p>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left border">ID</th>
                    <th className="px-4 py-2 text-left border">Materia</th>
                    <th className="px-4 py-2 text-left border">Carrera</th>
                    <th className="px-4 py-2 text-left border">Docente</th>
                    <th className="px-4 py-2 text-left border">Cuatrimestre</th>
                    <th className="px-4 py-2 text-left border">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((cursada) => (
                    <tr key={cursada.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{cursada.id}</td>
                      <td className="px-4 py-2 border">
                        {cursada.materia?.nombre ?? "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {cursada.carrera?.nombre ?? "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {cursada.docente?.nombre ?? "-"}
                      </td>
                      <td className="px-4 py-2 border">{cursada.cuatrimestre}</td>
                      <td className="px-4 py-2 border">{cursada.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No se encontraron cursadas con esos filtros.
            </p>
          )}
        </section>

        {/* Botón volver */}
        <div className="flex justify-end mt-8">
          <Link href="/profesor/cursadas">
            <Button className="w-40 bg-black hover:bg-gray-800 text-white">
              Volver
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
