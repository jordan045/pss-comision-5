"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Inscripto = {
  id: number
  alumno: {
    id: number
    nombre: string
    apellido: string
    dni: string
    legajo: string | null
  }
  carrera: {
    codigo: string
    nombre: string
  } | null
  plan: {
    codigo: string
    nombre: string
    version: string
  } | null
  estado: string
  resultadoFinal: string
  fechaInscripcion: string
  modalidad: string
}

type CursadaInfo = {
  id: number
  materia: {
    codigo: string
    nombre: string
  }
  cuatrimestre: string
  anio: number
  estado: string
  docenteResponsable: {
    nombre: string
    apellido: string
  }
  cupoMaximo: number
  totalInscriptos: number
  fechaGeneracion: string
}

type CursadaOption = {
  id: number
  materia: string
  cuatrimestre: string
  anio: number
  estado: string
  docente: string
}

export default function ListaInscriptosCursadaPage() {
  const [cursadasActivas, setCursadasActivas] = useState<CursadaOption[]>([])
  const [cursadaSeleccionada, setCursadaSeleccionada] = useState<number | null>(null)
  const [cursadaInfo, setCursadaInfo] = useState<CursadaInfo | null>(null)
  const [inscriptos, setInscriptos] = useState<Inscripto[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados de filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("")
  const [filtroCarrera, setFiltroCarrera] = useState<string>("")
  const [filtroCondicion, setFiltroCondicion] = useState<string>("")
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>("")
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>("")

  // Estado de ordenamiento
  const [ordenamiento, setOrdenamiento] = useState<"alfabetico" | "dni">("alfabetico")

  // Cargar cursadas activas y finalizadas al montar
  useEffect(() => {
    const cargarCursadas = async () => {
      try {
        const res = await fetch("/api/cursadas")
        if (!res.ok) throw new Error("Error al cargar cursadas")
        const data: CursadaOption[] = await res.json()
        
        // Filtrar solo cursadas activas (se puede ajustar según necesidad)
        setCursadasActivas(data)
      } catch (error) {
        console.error("Error cargando cursadas:", error)
        setError("No se pudieron cargar las cursadas")
      }
    }

    cargarCursadas()
  }, [])

  const cargarInscriptos = async () => {
    if (!cursadaSeleccionada) {
      setError("Debe seleccionar una cursada")
      return
    }

    setCargando(true)
    setError(null)

    try {
      const res = await fetch(`/api/cursadas/${cursadaSeleccionada}/inscriptos`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al cargar inscriptos")
      }

      const data = await res.json()
      setCursadaInfo(data.cursada)
      setInscriptos(data.inscriptos)

      if (data.inscriptos.length === 0) {
        setError("La cursada seleccionada no tiene inscriptos")
      }
    } catch (error: any) {
      console.error("Error cargando inscriptos:", error)
      setError(error.message || "No se pudieron cargar los inscriptos")
      setInscriptos([])
      setCursadaInfo(null)
    } finally {
      setCargando(false)
    }
  }

  // Obtener carreras únicas para el filtro
  const carrerasUnicas = useMemo(() => {
    const carreras = new Set<string>()
    inscriptos.forEach((i) => {
      if (i.carrera) carreras.add(i.carrera.nombre)
    })
    return Array.from(carreras).sort()
  }, [inscriptos])

  // Aplicar filtros y ordenamiento
  const inscriptosFiltrados = useMemo(() => {
    let resultado = [...inscriptos]

    // Filtro por estado
    if (filtroEstado) {
      resultado = resultado.filter((i) => i.estado === filtroEstado)
    }

    // Filtro por carrera
    if (filtroCarrera) {
      resultado = resultado.filter((i) => i.carrera?.nombre === filtroCarrera)
    }

    // Filtro por condición (resultado final)
    if (filtroCondicion) {
      resultado = resultado.filter((i) => i.resultadoFinal === filtroCondicion)
    }

    // Filtro por fecha desde
    if (filtroFechaDesde) {
      resultado = resultado.filter(
        (i) => new Date(i.fechaInscripcion) >= new Date(filtroFechaDesde)
      )
    }

    // Filtro por fecha hasta
    if (filtroFechaHasta) {
      resultado = resultado.filter(
        (i) => new Date(i.fechaInscripcion) <= new Date(filtroFechaHasta)
      )
    }

    // Ordenamiento
    if (ordenamiento === "alfabetico") {
      resultado.sort((a, b) => {
        const nombreA = `${a.alumno.apellido} ${a.alumno.nombre}`.toLowerCase()
        const nombreB = `${b.alumno.apellido} ${b.alumno.nombre}`.toLowerCase()
        return nombreA.localeCompare(nombreB)
      })
    } else if (ordenamiento === "dni") {
      resultado.sort((a, b) => a.alumno.dni.localeCompare(b.alumno.dni))
    }

    return resultado
  }, [inscriptos, filtroEstado, filtroCarrera, filtroCondicion, filtroFechaDesde, filtroFechaHasta, ordenamiento])

  const limpiarFiltros = () => {
    setFiltroEstado("")
    setFiltroCarrera("")
    setFiltroCondicion("")
    setFiltroFechaDesde("")
    setFiltroFechaHasta("")
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="min-h-screen py-10 px-6 md:px-8 lg:px-12">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">Gestión de Cursadas</h2>
          <p className="text-lg text-muted-foreground">Generar Lista de Inscriptos a Cursadas</p>
        </header>

        {/* Sección de selección de cursada */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seleccionar Cursada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="cursada">Cursada*</Label>
                <select
                  id="cursada"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={cursadaSeleccionada || ""}
                  onChange={(e) => setCursadaSeleccionada(Number(e.target.value) || null)}
                >
                  <option value="">Seleccione una cursada</option>
                  {cursadasActivas.map((cursada) => (
                    <option key={cursada.id} value={cursada.id}>
                      {cursada.materia} - {cursada.cuatrimestre} {cursada.anio} - {cursada.docente} ({cursada.estado})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={cargarInscriptos}
                disabled={!cursadaSeleccionada || cargando}
                className="w-full md:w-auto"
              >
                {cargando ? "Generando..." : "Generar Lista"}
              </Button>
            </div>

            {error && !cursadaInfo && (
              <p className="text-sm text-red-600 mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Cabecera de la lista (si hay datos) */}
        {cursadaInfo && (
          <>
            <Card className="mb-6 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-xl">Información de la Cursada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Materia:</p>
                    <p className="text-sm">{cursadaInfo.materia.nombre} ({cursadaInfo.materia.codigo})</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">ID Cursada:</p>
                    <p className="text-sm">{cursadaInfo.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Año y Cuatrimestre:</p>
                    <p className="text-sm">{cursadaInfo.anio} - {cursadaInfo.cuatrimestre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Docente Responsable:</p>
                    <p className="text-sm">
                      {cursadaInfo.docenteResponsable.nombre} {cursadaInfo.docenteResponsable.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Total Inscriptos:</p>
                    <p className="text-sm">{cursadaInfo.totalInscriptos}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Cupo Máximo:</p>
                    <p className="text-sm">{cursadaInfo.cupoMaximo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Estado:</p>
                    <p className="text-sm">{cursadaInfo.estado}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold">Fecha y Hora de Generación:</p>
                    <p className="text-sm">{formatearFecha(cursadaInfo.fechaGeneracion)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Filtros</CardTitle>
                  <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                    Limpiar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filtroEstado">Estado de Inscripción</Label>
                    <select
                      id="filtroEstado"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="ACTIVA">ACTIVA</option>
                      <option value="BAJA">BAJA</option>
                      <option value="FINALIZADA">FINALIZADA</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="filtroCarrera">Carrera</Label>
                    <select
                      id="filtroCarrera"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filtroCarrera}
                      onChange={(e) => setFiltroCarrera(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {carrerasUnicas.map((carrera) => (
                        <option key={carrera} value={carrera}>
                          {carrera}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="filtroCondicion">Condición (Resultado Final)</Label>
                    <select
                      id="filtroCondicion"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filtroCondicion}
                      onChange={(e) => setFiltroCondicion(e.target.value)}
                    >
                      <option value="">Todas</option>
                      <option value="APROBADO">APROBADO</option>
                      <option value="DESAPROBADO">DESAPROBADO</option>
                      <option value="PENDIENTE">PENDIENTE</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="filtroFechaDesde">Fecha Inscripción Desde</Label>
                    <Input
                      id="filtroFechaDesde"
                      type="date"
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="filtroFechaHasta">Fecha Inscripción Hasta</Label>
                    <Input
                      id="filtroFechaHasta"
                      type="date"
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ordenamiento y Lista */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>
                    Lista de Inscriptos ({inscriptosFiltrados.length} de {inscriptos.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={ordenamiento === "alfabetico" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrdenamiento("alfabetico")}
                    >
                      Ordenar Alfabéticamente
                    </Button>
                    <Button
                      variant={ordenamiento === "dni" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrdenamiento("dni")}
                    >
                      Ordenar por DNI
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {inscriptosFiltrados.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    {error || "No hay inscriptos que coincidan con los filtros seleccionados"}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {inscriptosFiltrados.map((inscripto, index) => (
                      <div
                        key={inscripto.id}
                        className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500">#{index + 1} - Alumno</p>
                            <p className="text-sm font-semibold">
                              {inscripto.alumno.apellido}, {inscripto.alumno.nombre}
                            </p>
                            {inscripto.alumno.legajo && (
                              <p className="text-xs text-gray-600">Legajo: {inscripto.alumno.legajo}</p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-500">DNI</p>
                            <p className="text-sm">{inscripto.alumno.dni}</p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-500">Carrera</p>
                            <p className="text-sm">
                              {inscripto.carrera
                                ? `${inscripto.carrera.nombre} (${inscripto.carrera.codigo})`
                                : "No especificada"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-500">Plan de Estudio</p>
                            <p className="text-sm">
                              {inscripto.plan
                                ? `${inscripto.plan.nombre} - v${inscripto.plan.version}`
                                : "No especificado"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-500">Estado Inscripción</p>
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded ${
                                inscripto.estado === "ACTIVA"
                                  ? "bg-green-100 text-green-700"
                                  : inscripto.estado === "BAJA"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {inscripto.estado}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-500">Condición Actual</p>
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded ${
                                inscripto.resultadoFinal === "APROBADO"
                                  ? "bg-green-100 text-green-700"
                                  : inscripto.resultadoFinal === "DESAPROBADO"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {inscripto.resultadoFinal}
                            </span>
                          </div>

                          <div className="md:col-span-2 lg:col-span-1">
                            <p className="text-xs font-semibold text-gray-500">Fecha de Inscripción</p>
                            <p className="text-sm">{formatearFecha(inscripto.fechaInscripcion)}</p>
                          </div>

                          <div className="md:col-span-2 lg:col-span-2">
                            <p className="text-xs font-semibold text-gray-500">Modalidad</p>
                            <p className="text-sm">
                              {inscripto.modalidad === "INSCRIPCION_POR_ALUMNO"
                                ? "Inscripción por Alumno"
                                : "Inscripción por Administrativo"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Botón volver */}
        <div className="mt-6 text-center">
          <Link href="/admin/cursadas">
            <Button variant="outline" className="w-full max-w-md">
              Volver a Gestión de Cursadas
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
