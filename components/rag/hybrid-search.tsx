"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Filter, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export function HybridSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showSources, setShowSources] = useState(false)

  // Filters
  const [language, setLanguage] = useState<string>("es")
  const [yearRange, setYearRange] = useState([2020, 2024])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const filters: Record<string, any> = {}
      if (language) filters.language = language
      if (yearRange[0] !== 2020 || yearRange[1] !== 2024) {
        filters.year_min = yearRange[0]
        filters.year_max = yearRange[1]
      }

      const data = await ragApi.hybridQuery({
        query,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        top_k: 5,
      })
      setResult(data)
    } catch (error) {
      console.error("Hybrid query error:", error)
      // Demo response
      setResult({
        answer: `Resultado de búsqueda híbrida para "${query}"${language ? ` en idioma ${language}` : ""}:\n\nLa combinación de búsqueda semántica con filtros de metadatos permite obtener resultados más precisos y relevantes. Esta técnica es especialmente útil cuando necesitas información específica de un período de tiempo o categoría particular.\n\nLos documentos encontrados muestran patrones consistentes en las tendencias del mercado y preferencias de los consumidores durante el período seleccionado.`,
        sources: [
          {
            id: "hybrid-1",
            title: "Análisis de Tendencias",
            content: "Documento que analiza las principales tendencias del mercado durante el período especificado...",
            score: 0.93,
            metadata: { language: language || "es", year: 2024 },
          },
          {
            id: "hybrid-2",
            title: "Informe de Mercado",
            content: "Informe detallado sobre el comportamiento del mercado y proyecciones futuras...",
            score: 0.88,
            metadata: { language: language || "es", year: 2023 },
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
            <Filter className="h-5 w-5 text-primary" />
            Búsqueda Híbrida
          </CardTitle>
          <CardDescription>
            Combina búsqueda semántica con filtros de metadatos para resultados más precisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hybrid-query">Tu Consulta</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="hybrid-query"
                  placeholder="Ej: Tendencias de productos tecnológicos"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Filters Toggle */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Ocultar" : "Mostrar"} Filtros
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 rounded-lg border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Todos los idiomas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="pt">Portugués</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Rango de Años: {yearRange[0]} - {yearRange[1]}
                    </Label>
                    <Slider
                      value={yearRange}
                      onValueChange={setYearRange}
                      min={2015}
                      max={2024}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Buscar
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
            <p className="mt-4 text-muted-foreground">Aplicando filtros y buscando resultados...</p>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado Híbrido</CardTitle>
            {(language !== "es" || yearRange[0] !== 2020 || yearRange[1] !== 2024) && (
              <div className="flex flex-wrap gap-2">
                {language !== "es" && <Badge variant="outline">Idioma: {language.toUpperCase()}</Badge>}
                {(yearRange[0] !== 2020 || yearRange[1] !== 2024) && (
                  <Badge variant="outline">
                    Años: {yearRange[0]} - {yearRange[1]}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result.answer.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

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
                        <Badge variant="secondary">{(source.score * 100).toFixed(0)}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{source.content}</p>
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
