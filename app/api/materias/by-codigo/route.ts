import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MateriaCodigoSchema } from "@/lib/schemas/materias";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo") || "";

    // Validar el código con Zod
    const { codigo: codigoValido } = MateriaCodigoSchema.parse({ codigo });

    // Buscar materia por código
    const materia = await prisma.materia.findUnique({
      where: { codigo: codigoValido },
    });

    if (!materia) {
      return NextResponse.json({ message: "No se encontró una materia con ese código." }, { status: 404 });
    }

    return NextResponse.json(materia);
  } catch (error) {
    return NextResponse.json({ message: "Código inválido o error interno." }, { status: 400 });
  }
}
