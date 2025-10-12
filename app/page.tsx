import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Pantalla Principal</h1>
      <Link href="/login">
        <Button>Log in</Button>
      </Link>
    </main>
  )
}
