"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronDown, ChevronRight, FolderTree } from "lucide-react"
import { categoriesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Category } from "@/providers/store-provider"

export function CategorySidebar() {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category_id")
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getTree()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Mock data for demo
        setCategories([
          {
            id: 1,
            name: "Electrónica",
            parent_id: null,
            children: [
              { id: 5, name: "Smartphones", parent_id: 1 },
              { id: 6, name: "Laptops", parent_id: 1 },
              { id: 7, name: "Accesorios", parent_id: 1 },
            ],
          },
          {
            id: 2,
            name: "Ropa",
            parent_id: null,
            children: [
              { id: 8, name: "Hombre", parent_id: 2 },
              { id: 9, name: "Mujer", parent_id: 2 },
              { id: 10, name: "Niños", parent_id: 2 },
            ],
          },
          {
            id: 3,
            name: "Hogar",
            parent_id: null,
            children: [
              { id: 11, name: "Muebles", parent_id: 3 },
              { id: 12, name: "Decoración", parent_id: 3 },
            ],
          },
          { id: 4, name: "Deportes", parent_id: null },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expanded.includes(category.id)
    const isSelected = selectedCategory === String(category.id)

    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md transition-colors",
            depth === 0 ? "py-2" : "py-1.5",
            isSelected && "text-primary font-medium",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(category.id)} className="p-0.5 hover:bg-accent rounded">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <Link
            href={`/products?category_id=${category.id}`}
            className={cn("flex-1 text-sm hover:text-primary transition-colors", isSelected && "text-primary")}
          >
            {category.name}
          </Link>
        </div>
        {hasChildren && isExpanded && <div>{category.children!.map((child) => renderCategory(child, depth + 1))}</div>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2 py-2 font-semibold">
        <FolderTree className="h-4 w-4" />
        Categorías
      </div>
      <Link
        href="/products"
        className={cn(
          "block rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
          !selectedCategory && "bg-accent text-accent-foreground font-medium",
        )}
      >
        Todas las categorías
      </Link>
      {categories.map((category) => renderCategory(category))}
    </div>
  )
}
