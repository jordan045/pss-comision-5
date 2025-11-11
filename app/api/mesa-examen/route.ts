import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mesasExamen = await prisma.mesaExamen.findMany({
      include: {
        materia: true,
      },
      orderBy: {
        fecha: "asc",
      },
    });
    return NextResponse.json(mesasExamen);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
