import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Shield, Search, Brain, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryExplorer } from "@/components/categories/category-explorer"

const features = [
  {
    icon: Brain,
    title: "Búsqueda Semántica",
    description: "Encuentra productos usando lenguaje natural. Nuestra IA entiende lo que buscas.",
  },
  {
    icon: ImageIcon,
    title: "Búsqueda por Imagen",
    description: "Sube una foto y encuentra productos similares instantáneamente.",
  },
  {
    icon: Zap,
    title: "Respuestas Instantáneas",
    description: "Obtén recomendaciones personalizadas en segundos gracias a nuestro sistema RAG.",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "Todas tus transacciones están protegidas con la más alta seguridad.",
  },
]

// Categories images are fetched from backend via CategoryExplorer

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Potenciado por Inteligencia Artificial
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl text-balance">
              Descubre productos con el poder de la <span className="text-primary">IA</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
              Experimenta una nueva forma de comprar. Busca con lenguaje natural, encuentra por imágenes y obtén
              recomendaciones inteligentes.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/rag-search">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  <Search className="mr-2 h-4 w-4" />
                  Probar Búsqueda IA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Explora por Categoría</h2>
            <p className="text-muted-foreground">Encuentra exactamente lo que buscas navegando nuestras categorías</p>
          </div>
          <CategoryExplorer />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              ¿Listo para una experiencia de compra inteligente?
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Únete a miles de usuarios que ya disfrutan de nuestra plataforma con IA.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
