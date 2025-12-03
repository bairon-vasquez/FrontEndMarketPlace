"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash2, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productsApi, categoriesApi, imagesApi } from "@/lib/api"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  })

  const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [product, cats] = await Promise.all([
          productsApi.getById(Number(resolvedParams.id)),
          categoriesApi.getAll(),
        ])

        setFormData({
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          category_id: String(product.category_id),
        })

        setExistingImages(product.images || [])
        setCategories(cats)
      } catch {
        toast.error("Error al cargar el producto")
        router.push("/admin/products")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages((prev) => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageId: number) => {
    try {
      await imagesApi.delete(imageId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success("Imagen eliminada")
    } catch {
      toast.error("Error al eliminar la imagen")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await productsApi.update(Number(resolvedParams.id), {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        category_id: Number.parseInt(formData.category_id),
      })

      // Subir nuevas imágenes
      for (const file of newImages) {
        await imagesApi.upload(Number(resolvedParams.id), file)
      }

      toast.success("Producto actualizado correctamente")
      router.push("/admin/products")
    } catch {
      toast.error("Error al actualizar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      await productsApi.delete(Number(resolvedParams.id))
      toast.success("Producto eliminado")
      router.push("/admin/products")
    } catch {
      toast.error("Error al eliminar el producto")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
          <h1 className="text-3xl font-bold">Editar Producto</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
              <CardDescription>Datos básicos del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>Gestiona las imágenes del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Imágenes actuales</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="group relative aspect-square">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt="Producto"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeExistingImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevas imágenes */}
              <div className="space-y-2">
                <Label>Añadir nuevas imágenes</Label>
                <div className="grid grid-cols-3 gap-2">
                  {newImages.map((file, index) => (
                    <div key={index} className="group relative aspect-square">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Nueva ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Subir</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
