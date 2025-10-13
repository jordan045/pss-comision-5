import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith("/api/")
  const protectedPaths = ["/dashboard", "/alumno", "/profesor", "/admin"]

  // Solo proteger las rutas que lo necesitan
  const needsAuth = protectedPaths.some((path) => pathname.startsWith(path))

  // Si no requiere auth, dejamos pasar
  if (!needsAuth && pathname !== "/login") {
    return NextResponse.next()
  }

  // Obtenemos el token del usuario
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  })

  // 🔒 Si no tiene token y está intentando acceder a una ruta protegida → al login
  if (!token && needsAuth) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 🔑 Si tiene token y entra a /login → redirigir según rol
  if (pathname === "/login" && token) {
    let destination = "/"
    switch (token.rol) {
      case "ALUMNO":
        destination = "/alumno"
        break
      case "PROFESOR":
        destination = "/profesor"
        break
      case "ADMINISTRATIVO":
        destination = "/admin"
        break
    }

    // 👇 Solo redirige si NO está ya en la ruta correcta
    if (!pathname.startsWith(destination)) {
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  // ✅ Si ya está en su dashboard correcto → no hacer nada
  if (token && needsAuth) {
    const allowedPrefix =
      token.rol === "ALUMNO"
        ? "/alumno"
        : token.rol === "PROFESOR"
        ? "/profesor"
        : "/admin"

    // 🚫 Si intenta entrar al dashboard de otro rol
    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url))
    }
  }

  // 🔒 Manejo de cookie temporal si no marcó "Recordarme"
  if (token?.remember === false) {
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
    })
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/alumno/:path*",
    "/profesor/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
  ],
}
