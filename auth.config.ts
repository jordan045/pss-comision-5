import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // por defecto 7 días (si recordarme = true)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any
        token.id = u.id ?? ""
        token.email = u.email ?? ""
        token.name = u.name ?? ""
        token.rol = u.rol ?? "ADMIN"
        token.remember = u.remember ?? true // 👈 guardamos flag
      }
      return token
    },

    async session({ session, token }) {
      const s = session as any
      s.user.id = token.id
      s.user.email = token.email
      s.user.name = token.name
      s.user.rol = token.rol  
      s.user.remember = token.remember
      return s as typeof session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      return !isOnDashboard || isLoggedIn
    },
  },
  providers: [],
}
