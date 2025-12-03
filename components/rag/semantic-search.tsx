"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ragApi } from "@/lib/api"

interface SearchResult {
  answer: string
  sources: {
    id: string
    title: string
    content: string
    score: number
    metadata?: Record<string, any>
  }[]
}

export function SemanticSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [showSources, setShowSources] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const data = await ragApi.query({ query, top_k: 5 })
      setResult(data)
    } catch (error) {
      console.error("RAG query error:", error)
      // Demo response
      setResult({
        answer: `Basándome en la información disponible sobre "${query}", puedo proporcionarte los siguientes insights:\n\nLos productos en esta categoría destacan por su alta calidad y durabilidad. Nuestros clientes más satisfechos recomiendan considerar factores como el precio, las reseñas y la garantía antes de tomar una decisión.\n\nEn términos de tendencias actuales, hemos observado un crecimiento significativo en la demanda de productos sostenibles y eco-friendly. Las marcas líderes están adaptando sus ofertas para satisfacer esta demanda creciente.`,
        sources: [
          {
            id: "doc-1",
            title: "Guía de Productos Premium",
            content:
              "Los productos premium se caracterizan por utilizar materiales de alta calidad y procesos de fabricación certificados...",
            score: 0.95,
            metadata: { category: "guías", year: 2024 },
          },
          {
            id: "doc-2",
            title: "Tendencias de Mercado 2024",
            content:
              "El mercado está experimentando un cambio hacia productos más sostenibles y con menor impacto ambiental...",
            score: 0.87,
            metadata: { category: "análisis", year: 2024 },
          },
          {
            id: "doc-3",
            title: "Reseñas de Clientes",
            content: "Los clientes valoran principalmente la relación calidad-precio y el servicio post-venta...",
            score: 0.82,
            metadata: { category: "feedback", year: 2024 },
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Búsqueda Semántica
          </CardTitle>
          <CardDescription>
            Realiza preguntas en lenguaje natural y obtén respuestas inteligentes basadas en nuestra base de
            conocimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Tu Pregunta</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="query"
                  placeholder="Ej: ¿Cuáles son los mejores productos para deportes al aire libre?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Buscar con IA
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Analizando tu consulta y generando respuesta...</p>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Respuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generated Answer */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result.answer.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <Collapsible open={showSources} onOpenChange={setShowSources}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    {showSources ? "Ocultar" : "Ver"} Fuentes ({result.sources.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-3">
                  {result.sources.map((source, i) => (
                    <div key={source.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {i + 1}
                          </span>
                          <h4 className="font-medium">{source.title}</h4>
                        </div>
                        <Badge variant="secondary">{(source.score * 100).toFixed(0)}% relevancia</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{source.content}</p>
                      {source.metadata && (
                        <div className="flex gap-2">
                          {Object.entries(source.metadata).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
