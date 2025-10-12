"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Verifica tu usuario y contraseña.")
      } else {
        router.push("/dashboard") // o /admin según tu flujo
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Ingresar</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Input
          placeholder="Legajo / CUIL / Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Ingresar"}
        </Button>
      </form>

      <div className="flex gap-3 mt-4">
        <Link href="/alumno">
          <Button variant="secondary">Ingresar como Alumno</Button>
        </Link>
        <Link href="/admin">
          <Button variant="secondary">Ingresar como Administrativo</Button>
        </Link>
      </div>
    </main>
  )
}
