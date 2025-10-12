import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith("/api/")
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard")

  if (needsAuth) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
    })

    if (!token) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // 🔑 Si el usuario no marcó "Recordarme", reescribimos la cookie como de sesión
    if (token.remember === false) {
      const res = NextResponse.next()
      const cookieName =
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token"

      const cookieValue = request.cookies.get(cookieName)?.value || ""

      res.cookies.set(cookieName, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // ❌ no seteamos maxAge → se convierte en Session Cookie
      })

      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
}
