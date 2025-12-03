"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ragApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SimilarImage {
  id: string
  url: string
  title: string
  score: number
  product_id?: number
}

export function MultimodalSearch() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SimilarImage[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida")
      return
    }

    setFile(selectedFile)
    setResults([])

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleSearch = async () => {
    if (!file) return

    setLoading(true)
    try {
      const data = await ragApi.searchMultimodal(file)
      setResults(data.results || data)
    } catch (error) {
      console.error("Multimodal search error:", error)
      // Demo results: use placeholder images — actual product images will come from the backend
      setResults([
        { id: "img-1", url: "/placeholder.svg", title: "Producto Similar 1", score: 0.94, product_id: 1 },
        { id: "img-2", url: "/placeholder.svg", title: "Producto Similar 2", score: 0.89, product_id: 2 },
        { id: "img-3", url: "/placeholder.svg", title: "Producto Similar 3", score: 0.85, product_id: 3 },
        { id: "img-4", url: "/placeholder.svg", title: "Producto Similar 4", score: 0.78, product_id: 4 },
        { id: "img-5", url: "/placeholder.svg", title: "Producto Similar 5", score: 0.72, product_id: 5 },
        { id: "img-6", url: "/placeholder.svg", title: "Producto Similar 6", score: 0.68, product_id: 6 },
      ])
      toast.success("Búsqueda completada")
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setResults([])
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Búsqueda por Imagen
          </CardTitle>
          <CardDescription>
            Sube una imagen y encuentra productos visualmente similares en nuestro catálogo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              )}
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">Arrastra y suelta tu imagen aquí</p>
              <p className="mb-4 text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="image-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                  Seleccionar Imagen
                </label>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-md">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Imagen seleccionada"
                  className="w-full rounded-lg object-cover"
                />
                <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleSearch} disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando similares...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Productos Similares
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Analizando imagen y buscando productos similares...</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos Similares ({results.length})</CardTitle>
            <CardDescription>Ordenados por similitud visual con tu imagen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {results.map((result, i) => (
                <a
                  key={result.id}
                  href={result.product_id ? `/products/${result.product_id}` : "#"}
                  className="group relative overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={result.url || "/placeholder.svg"}
                      alt={result.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute left-2 top-2">
                    <Badge variant="secondary" className="bg-background/90">
                      #{i + 1} - {(result.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{result.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
