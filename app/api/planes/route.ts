import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/planes?estado=VIGENTE
export async function GET(req: NextRequest) {
  const estado = req.nextUrl.searchParams.get("estado") ?? undefined

  const planes = await prisma.planDeEstudio.findMany({
    where: estado ? { estado } : undefined,   // ej: "VIGENTE"
    orderBy: [{ fechaVigencia: "desc" }, { id: "desc" }],
    select: { id: true, codigo: true, nombre: true, version: true },
  })

  // armamos una etiqueta amigable
  const items = planes.map(p => ({
    id: p.id,
    label: `${p.codigo} - ${p.nombre} (v${p.version})`,
  }))

  return NextResponse.json(items)
}
