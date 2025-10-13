import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      rol: "ALUMNO" | "ADMINISTRATIVO"| "PROFESOR"   // 👈 agregamos el rol
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name: string
    rol: "ALUMNO" | "ADMINISTRATIVO"| "PROFESOR"   // 👈 agregamos el rol
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    rol: "ALUMNO" | "ADMINISTRATIVO"| "PROFESOR"    // 👈 agregamos el rol
  }
}
