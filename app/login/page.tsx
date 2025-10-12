import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Ingresar</h2>
      <form className="flex flex-col gap-3 w-72">
        <Input placeholder="Legajo/CUIL/N° Libreta" />
        <Input type="password" placeholder="Contraseña" />
        <Button type="submit">Ingresar</Button>
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
