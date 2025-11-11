import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/carreras?estado=ACTIVA
export async function GET(req: NextRequest) {
  const estado = req.nextUrl.searchParams.get("estado") ?? undefined

  const carreras = await prisma.carrera.findMany({
    where: estado ? { estado } : undefined,
    orderBy: [{ nombre: "asc" }],
    select: { 
      id: true, 
      codigo: true, 
      nombre: true,
      planDeEstudioId: true,
    },
  })

  return NextResponse.json(carreras)
}
