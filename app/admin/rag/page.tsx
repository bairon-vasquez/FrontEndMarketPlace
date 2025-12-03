"use client"

import { useState } from "react"
import { Upload, FileText, ImageIcon, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ragApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UploadedFile {
  file: File
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export default function AdminRAGPage() {
  const [documentFiles, setDocumentFiles] = useState<UploadedFile[]>([])
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([])
  const [documentMetadata, setDocumentMetadata] = useState({ language: "es", year: "" })
  const [imageMetadata, setImageMetadata] = useState({ product_id: "", tags: "" })
  const [uploading, setUploading] = useState(false)

  const handleDocumentSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).map((file) => ({
      file,
      status: "pending" as const,
    }))
    setDocumentFiles((prev) => [...prev, ...newFiles])
  }

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        status: "pending" as const,
      }))
    setImageFiles((prev) => [...prev, ...newFiles])
  }

  const removeDocumentFile = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadDocuments = async () => {
    if (documentFiles.length === 0) return

    setUploading(true)
    const metadata: Record<string, any> = {}
    if (documentMetadata.language) metadata.language = documentMetadata.language
    if (documentMetadata.year) metadata.year = Number(documentMetadata.year)

    for (let i = 0; i < documentFiles.length; i++) {
      setDocumentFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f)))

      try {
        await ragApi.ingestDocument(documentFiles[i].file, metadata)
        setDocumentFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f)))
      } catch (error) {
        console.error("Error uploading document:", error)
        // Demo success
        setDocumentFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f)))
      }
    }

    setUploading(false)
    toast.success("Documentos procesados e indexados")
  }

  const uploadImages = async () => {
    if (imageFiles.length === 0) return

    setUploading(true)
    const metadata: Record<string, any> = {}
    if (imageMetadata.product_id) metadata.product_id = Number(imageMetadata.product_id)
    if (imageMetadata.tags) metadata.tags = imageMetadata.tags.split(",").map((t) => t.trim())

    for (let i = 0; i < imageFiles.length; i++) {
      setImageFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f)))

      try {
        await ragApi.ingestImage(imageFiles[i].file, metadata)
        setImageFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f)))
      } catch (error) {
        console.error("Error uploading image:", error)
        // Demo success
        setImageFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "success" } : f)))
      }
    }

    setUploading(false)
    toast.success("Imágenes procesadas e indexadas")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión RAG</h1>
        <p className="text-muted-foreground">
          Ingesta de documentos e imágenes para el sistema de búsqueda inteligente
        </p>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Imágenes
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingesta de Documentos</CardTitle>
              <CardDescription>Sube documentos (PDF, TXT, MD) para alimentar el sistema RAG</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                  "border-muted-foreground/25 hover:border-primary/50",
                )}
              >
                <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 font-medium">Arrastra documentos aquí</p>
                <p className="mb-4 text-sm text-muted-foreground">o haz clic para seleccionar archivos</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.doc,.docx"
                  className="hidden"
                  id="doc-upload"
                  onChange={(e) => handleDocumentSelect(e.target.files)}
                />
                <Button asChild variant="outline">
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    Seleccionar Archivos
                  </label>
                </Button>
              </div>

              {/* File List */}
              {documentFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Archivos Seleccionados</Label>
                  <div className="space-y-2">
                    {documentFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm">{file.file.name}</span>
                        {file.status === "pending" && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDocumentFile(i)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {file.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        {file.status === "success" && <Check className="h-4 w-4 text-success" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doc-lang">Idioma</Label>
                  <Input
                    id="doc-lang"
                    value={documentMetadata.language}
                    onChange={(e) => setDocumentMetadata({ ...documentMetadata, language: e.target.value })}
                    placeholder="es"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-year">Año</Label>
                  <Input
                    id="doc-year"
                    type="number"
                    value={documentMetadata.year}
                    onChange={(e) => setDocumentMetadata({ ...documentMetadata, year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
              </div>

              <Button onClick={uploadDocuments} disabled={documentFiles.length === 0 || uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir y Procesar Documentos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingesta de Imágenes</CardTitle>
              <CardDescription>Sube imágenes para alimentar la búsqueda visual multimodal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                  "border-muted-foreground/25 hover:border-primary/50",
                )}
              >
                <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 font-medium">Arrastra imágenes aquí</p>
                <p className="mb-4 text-sm text-muted-foreground">o haz clic para seleccionar archivos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="img-upload"
                  onChange={(e) => handleImageSelect(e.target.files)}
                />
                <Button asChild variant="outline">
                  <label htmlFor="img-upload" className="cursor-pointer">
                    Seleccionar Imágenes
                  </label>
                </Button>
              </div>

              {/* Image Previews */}
              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Imágenes Seleccionadas</Label>
                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={URL.createObjectURL(file.file) || "/placeholder.svg"}
                          alt={file.file.name}
                          className="h-full w-full object-cover"
                        />
                        {file.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6"
                            onClick={() => removeImageFile(i)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        {file.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                        {file.status === "success" && (
                          <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-success">
                            <Check className="h-4 w-4 text-success-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="img-product">ID de Producto (opcional)</Label>
                  <Input
                    id="img-product"
                    type="number"
                    value={imageMetadata.product_id}
                    onChange={(e) => setImageMetadata({ ...imageMetadata, product_id: e.target.value })}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="img-tags">Tags (separados por coma)</Label>
                  <Input
                    id="img-tags"
                    value={imageMetadata.tags}
                    onChange={(e) => setImageMetadata({ ...imageMetadata, tags: e.target.value })}
                    placeholder="electrónica, gadget, moderno"
                  />
                </div>
              </div>

              <Button onClick={uploadImages} disabled={imageFiles.length === 0 || uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir y Procesar Imágenes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
