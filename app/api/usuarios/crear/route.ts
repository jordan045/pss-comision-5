import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"


export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Normalizar y sanitizar inputs
    const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : ''
    const apellido = typeof data.apellido === 'string' ? data.apellido.trim() : ''
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
    const dni = typeof data.dni === 'string' ? data.dni.trim() : ''
    const cuil = typeof data.cuil === 'string' && data.cuil.trim() !== '' ? data.cuil.trim() : null

    // Normalizamos el rol para seguridad
    const rol = typeof data.rol === 'string' ? data.rol.trim().toUpperCase() : undefined

    // Validar rol permitido
    if (!["ALUMNO", "PROFESOR", "ADMINISTRATIVO"].includes(rol)) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Validar duplicados básicos: usamos select para obtener sólo campos identificatorios
    const existente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { dni },
          ...(cuil ? [{ cuil }] : [])
        ]
      },
      select: { id: true, email: true, dni: true, cuil: true }
    })

    if (existente) {
      console.log('Creación de usuario - datos recibidos:', { nombre, apellido, email, dni, cuil, rol })
      console.log('Creación de usuario - existente encontrado:', existente)
      return NextResponse.json(
        { error: "DNI, CUIL o Email existente" },
        { status: 409 }
      )
    }

  const hashedPassword = await bcrypt.hash("123456789", 10)

    // Crear el usuario según su rol
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        dni,
        cuil: cuil ?? null,
        email,
        rol,
        obraSocial: rol === "ADMINISTRATIVO" ? (data.obra_social ?? null) : null,
        tituloProfesional: rol === "PROFESOR" ? (data.tituloProfesional ?? null) : null,
        antiguedad: rol === "PROFESOR" ? (data.antiguedad ?? null) : null,
        legajo: rol === "ALUMNO" ? (data.legajo ?? null) : null,
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
