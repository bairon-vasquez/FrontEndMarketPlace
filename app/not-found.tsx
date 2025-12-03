import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-2 text-9xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Página no encontrada</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Lo sentimos, la página que buscas no existe o ha sido movida. Puedes volver al inicio o buscar lo que
          necesitas.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Ver Productos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
