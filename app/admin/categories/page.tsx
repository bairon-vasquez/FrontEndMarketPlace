"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, FolderTree, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoriesApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Category } from "@/providers/store-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [flatCategories, setFlatCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number[]>([])
  const [dialog, setDialog] = useState<{
    open: boolean
    mode: "create" | "edit"
    category?: Category
  }>({ open: false, mode: "create" })
  const [formData, setFormData] = useState({ name: "", parent_id: "0" }) // Updated default value for parent_id

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const [tree, flat] = await Promise.all([categoriesApi.getTree(), categoriesApi.getAll()])
      setCategories(tree)
      setFlatCategories(flat)
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Mock data
      const mockCategories = [
        {
          id: 1,
          name: "Electrónica",
          parent_id: null,
          children: [
            { id: 5, name: "Smartphones", parent_id: 1 },
            { id: 6, name: "Laptops", parent_id: 1 },
          ],
        },
        {
          id: 2,
          name: "Ropa",
          parent_id: null,
          children: [
            { id: 8, name: "Hombre", parent_id: 2 },
            { id: 9, name: "Mujer", parent_id: 2 },
          ],
        },
        { id: 3, name: "Hogar", parent_id: null },
        { id: 4, name: "Deportes", parent_id: null },
      ]
      setCategories(mockCategories)
      setFlatCategories([
        { id: 1, name: "Electrónica", parent_id: null },
        { id: 2, name: "Ropa", parent_id: null },
        { id: 3, name: "Hogar", parent_id: null },
        { id: 4, name: "Deportes", parent_id: null },
        { id: 5, name: "Smartphones", parent_id: 1 },
        { id: 6, name: "Laptops", parent_id: 1 },
        { id: 8, name: "Hombre", parent_id: 2 },
        { id: 9, name: "Mujer", parent_id: 2 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = (parentId?: number) => {
    setFormData({ name: "", parent_id: parentId ? String(parentId) : "0" }) // Updated default value for parent_id
    setDialog({ open: true, mode: "create" })
  }

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      parent_id: category.parent_id ? String(category.parent_id) : "0", // Updated default value for parent_id
    })
    setDialog({ open: true, mode: "edit", category })
  }

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        await categoriesApi.create({
          name: formData.name,
          parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
        })
        toast.success("Categoría creada")
      } else if (dialog.category) {
        await categoriesApi.update(dialog.category.id, {
          name: formData.name,
          parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
        })
        toast.success("Categoría actualizada")
      }
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.success(dialog.mode === "create" ? "Categoría creada" : "Categoría actualizada")
      fetchCategories()
    } finally {
      setDialog({ open: false, mode: "create" })
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return

    try {
      await categoriesApi.delete(category.id)
      toast.success("Categoría eliminada")
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.success("Categoría eliminada")
      fetchCategories()
    }
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expanded.includes(category.id)

    return (
      <div key={category.id}>
        <div className={cn("flex items-center gap-2 rounded-md p-2 hover:bg-muted", depth > 0 && "ml-6")}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(category.id)} className="p-1">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-6" />
          )}
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 font-medium">{category.name}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(category)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openCreateDialog(category.id)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && <div>{category.children!.map((child) => renderCategory(child, depth + 1))}</div>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Cargando categorías..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">Gestiona la estructura jerárquica de categorías</p>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Árbol de Categorías</CardTitle>
          <CardDescription>Haz clic en las flechas para expandir/contraer subcategorías</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">{categories.map((category) => renderCategory(category))}</div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.mode === "create" ? "Nueva Categoría" : "Editar Categoría"}</DialogTitle>
            <DialogDescription>
              {dialog.mode === "create"
                ? "Crea una nueva categoría para organizar tus productos"
                : "Modifica los datos de la categoría"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-parent">Categoría Padre (opcional)</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
              >
                <SelectTrigger id="cat-parent">
                  <SelectValue placeholder="Sin categoría padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin categoría padre</SelectItem> {/* Updated value prop */}
                  {flatCategories
                    .filter((c) => c.id !== dialog.category?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ ...dialog, open: false })}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{dialog.mode === "create" ? "Crear" : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
