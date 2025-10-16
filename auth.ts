import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"
import { authConfig } from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validamos solo email y password
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        const remember = (credentials as any)?.remember === "true"


        // Buscar usuario en la base, solo si está activo
        const user = await prisma.usuario.findFirst({
          where: { email, activo: true },
        })
        if (!user) return null

        // Validar contraseña
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nombre,
          rol:user.rol,
          remember, // 👈 pasamos flag al token
        }
      },
    }),
  ],
})
