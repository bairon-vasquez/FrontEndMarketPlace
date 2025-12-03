"use client"
import { Brain, Filter, ImageIcon, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SemanticSearch } from "@/components/rag/semantic-search"
import { HybridSearch } from "@/components/rag/hybrid-search"
import { MultimodalSearch } from "@/components/rag/multimodal-search"

export default function RAGSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          Potenciado por IA
        </div>
        <h1 className="mb-4 text-4xl font-bold text-balance">Búsqueda Avanzada con IA</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
          Experimenta nuestra tecnología de búsqueda RAG (Retrieval-Augmented Generation). Realiza consultas en lenguaje
          natural, aplica filtros inteligentes o busca por imagen.
        </p>
      </div>

      {/* Search Tabs */}
      <div className="mx-auto max-w-4xl">
        <Tabs defaultValue="semantic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semantic" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Semántica</span>
            </TabsTrigger>
            <TabsTrigger value="hybrid" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Híbrida</span>
            </TabsTrigger>
            <TabsTrigger value="multimodal" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Por Imagen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="semantic">
            <SemanticSearch />
          </TabsContent>

          <TabsContent value="hybrid">
            <HybridSearch />
          </TabsContent>

          <TabsContent value="multimodal">
            <MultimodalSearch />
          </TabsContent>
        </Tabs>
      </div>

      {/* Info Section */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <Brain className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Búsqueda Semántica</h3>
            <p className="text-sm text-muted-foreground">
              Realiza preguntas complejas y obtén respuestas generadas por IA con contexto relevante
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <Filter className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Filtros Híbridos</h3>
            <p className="text-sm text-muted-foreground">
              Combina búsqueda semántica con filtros de metadatos como idioma y año
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <ImageIcon className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Búsqueda Visual</h3>
            <p className="text-sm text-muted-foreground">
              Sube una imagen y encuentra productos visualmente similares en nuestro catálogo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
