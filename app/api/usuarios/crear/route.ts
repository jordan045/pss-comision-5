import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"


export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Normalizamos el rol para seguridad
    const rol = data.rol?.toUpperCase()

    // Validar rol permitido
    if (!["ALUMNO", "PROFESOR", "ADMINISTRATIVO"].includes(rol)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Validar duplicados básicos
    const existente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: data.email },
          { dni: data.dni },
          { cuil: data.cuil ?? undefined }
        ]
      },
    })

    if (existente) {
      return NextResponse.json(
        { error: "DNI, CUIL o Email existente" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash("123456789", 10)

    // Crear el usuario según su rol
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        cuil: data.cuil ?? null,
        email: data.email,
        rol,
        obraSocial: rol === "ADMINISTRATIVO" ? data.obra_social ?? null : null,
        tituloProfesional: rol === "PROFESOR" ? data.tituloProfesional ?? null : null,
        antiguedad: rol === "PROFESOR" ? data.antiguedad ?? null : null,
        legajo: rol === "ALUMNO" ? data.legajo ?? null : null,
        fechaIngreso: rol === "ALUMNO" ? new Date() : null,
        password: hashedPassword, 
      },
    })

    return NextResponse.json({ ok: true, usuario: nuevoUsuario }, { status: 201 })
  } catch (error) {
    console.error("Error creando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
