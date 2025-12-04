"use client"

import type React from "react"

import { useState, useMemo } from "react"
//import { useState, useMemo } from "react"
import { Search, Loader2, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ragApi, imagesApi } from "@/lib/api"
import { toast } from "sonner"

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
  const [imageResults, setImageResults] = useState<{ url: string; title?: string; score?: number }[] | null>(null)
  const [mode, setMode] = useState<"text" | "images">("text")
  const [showSources, setShowSources] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)
    setImageResults(null)

    try {
      if (mode === "text") {
        const data = await ragApi.query({ query, top_k: 5 })
        setResult(data)
      } else {
        // images mode
        // backend expects { index, question, k }
        const data = await ragApi.imagesText({ index: "default", question: query, k: 6 })
        // Debug: log raw response so we can adapt to the exact schema
        console.debug("rag.imagesText raw response:", data)

        // Try to extract image URLs from common response shapes
        // 1) data.images -> [{ url, title, score }]
        // 2) data.results -> similar
        // 3) data.sources -> metadata.image_url
        let imgs: { url: string; title?: string; score?: number }[] = []
        const normalize = (candidate: any) => {
          if (!candidate) return null
          const c = String(candidate)
          // numeric id -> build images URL
          if (/^\d+$/.test(c)) return imagesApi.getUrl(Number(c))
          // /api/images/123 or /images/123 -> extract id
          const m = c.match(/(?:\/api)?\/images\/(\d+)/)
          if (m) return imagesApi.getUrl(Number(m[1]))
          // absolute URL
          if (/^https?:\/\//i.test(c)) return c
          // otherwise return as-is (may be relative path)
          return c
        }

        if (Array.isArray(data?.images)) {
          imgs = data.images
            .map((it: any) => {
              const candidate = it.url || it.path || it.image_url || it.originalUrl || it.id
              const url = normalize(candidate)
              return url ? { url, title: it.title || it.name, score: it.score } : null
            })
            .filter(Boolean)
        } else if (Array.isArray(data?.results)) {
          imgs = data.results
            .map((it: any) => {
              // Backend serializes DB rows; attempt many common field names
              const candidate =
                it.url ||
                it.path ||
                it.image_url ||
                it.originalUrl ||
                it.ruta ||
                it.file_path ||
                it.filePath ||
                it.nombreArchivo ||
                it.image ||
                it.imagen ||
                it.urlImagen ||
                it.imageUrl ||
                it.original_url ||
                it.id ||
                it.idImagen ||
                it.image_id ||
                it.idMedia ||
                it._id ||
                (it.metadata && (it.metadata.originalUrl || it.metadata.url || it.metadata.path)) ||
                (it.imagen && (it.imagen.url || it.imagen.path || it.imagen.idImagen)) ||
                null

              const url = normalize(candidate)
              const title = it.title || it.nombre || it.name || it.nombreArchivo || it.titulo || it.id || it._id
              return url ? { url, title, score: it.score ?? it.similarity ?? it.rank } : null
            })
            .filter(Boolean)
        } else if (Array.isArray(data?.sources)) {
          imgs = data.sources
            .map((s: any) => {
              const candidate = s?.metadata?.image_url || s?.metadata?.url || s?.image || s?.url || s?.id
              const url = normalize(candidate)
              return url ? { url, title: s.title || s.id, score: s.score } : null
            })
            .filter(Boolean)
        }

        // Fallback: if response is an array directly
        if (!imgs.length && Array.isArray(data)) {
          imgs = data.map((it: any) => ({ url: it.url || it.path || it.image_url || it.originalUrl, title: it.title || it.id, score: it.score }))
        }

        // Demo fallback if nothing found
        if (!imgs.length) {
          imgs = [
            { url: "/placeholder.svg", title: "Demo imagen 1", score: 0.8 },
            { url: "/placeholder.svg", title: "Demo imagen 2", score: 0.75 },
          ]
        }

        console.debug("normalized image candidates:", imgs)
        setImageResults(imgs)
      }
    } catch (error) {
      console.error("RAG query error:", error)
      // If network-level error (backend down / connection refused) show helpful toast
      if (error instanceof TypeError || String(error).includes("Failed to fetch") || String(error).includes("NetworkError")) {
        toast.error("No se pudo conectar al servidor RAG. Verifica que el backend esté corriendo en http://localhost:5000" )
      }
      if (mode === "text") {
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
          ],
        })
      } else {
        setImageResults([
          { url: "/placeholder.svg", title: "Demo imagen 1", score: 0.8 },
          { url: "/placeholder.svg", title: "Demo imagen 2", score: 0.75 },
        ])
      }
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
            <div className="flex gap-2 items-center">
              <div className="space-x-2">
                <Button type="button" variant={mode === "text" ? "default" : "ghost"} onClick={() => setMode("text")}>Texto</Button>
                <Button type="button" variant={mode === "images" ? "default" : "ghost"} onClick={() => setMode("images")}>Imágenes</Button>
              </div>
            </div>

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
                  {mode === "text" ? "Buscar con IA" : "Buscar Imágenes"}
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

      {/* Image results */}
      {imageResults && imageResults.length > 0 && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados de Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageResults.map((img, i) => (
                <div key={i} className="rounded-lg border overflow-hidden">
                  <img src={img.url} alt={img.title || `img-${i}`} className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <div className="text-sm font-medium">{img.title}</div>
                    {typeof img.score === "number" && (
                      <div className="text-xs text-muted-foreground">Relevancia: {(img.score * 100).toFixed(0)}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
