import { auth } from "@/auth" // 👈 tu helper de NextAuth (app/api/auth/[...nextauth]/route.ts)
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  // Si no hay sesión, redirige al login
  if (!session?.user) {
    redirect("/login")
  }

  const { nombre, rol } = session.user as { nombre?: string; rol?: string }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="bg-white/80 shadow-xl rounded-xl p-10 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4 text-gray-800">
          {rol === "SUPERADMIN"
            ? `👑 Hola Superadmin${nombre ? `, ${nombre}` : ""}!`
            : `🛠️ Hola Admin${nombre ? `, ${nombre}` : ""}!`}
        </h1>

        <p className="text-gray-600 text-lg">
          Bienvenido al panel de control.  
          {rol === "SUPERADMIN"
            ? " Tenés acceso completo a la administración global del sistema."
            : " Podés gestionar tus recursos y usuarios asignados."}
        </p>

        <div className="mt-8">
          <a
            href="/api/auth/signout"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-all duration-200"
          >
            Cerrar sesión
          </a>
        </div>
      </div>
    </main>
  )
}
