import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = {
  tienda: [
    { name: "Catálogo", href: "/products" },
    { name: "Ofertas", href: "/products?sale=true" },
    { name: "Novedades", href: "/products?sort=newest" },
  ],
  cuenta: [
    { name: "Mi Cuenta", href: "/profile" },
    { name: "Mis Pedidos", href: "/orders" },
    { name: "Lista de Deseos", href: "/wishlist" },
  ],
  soporte: [
    { name: "Contacto", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Envíos", href: "/shipping" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">NexusShop</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu tienda inteligente con búsqueda avanzada potenciada por IA.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Tienda</h4>
            <ul className="space-y-2">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Mi Cuenta</h4>
            <ul className="space-y-2">
              {footerLinks.cuenta.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Soporte</h4>
            <ul className="space-y-2">
              {footerLinks.soporte.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NexusShop. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
