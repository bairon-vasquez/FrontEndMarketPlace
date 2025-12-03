"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronRight, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Category } from "@/providers/store-provider"

interface ProductFiltersProps {
  categories: Category[]
  className?: string
}

export function ProductFilters({ categories, className }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 10000])
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available_only") === "true")

  const selectedCategory = searchParams.get("category_id")

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`/products?${params.toString()}`)
  }

  const handlePriceApply = () => {
    updateFilters({
      min_price: String(priceRange[0]),
      max_price: String(priceRange[1]),
    })
  }

  const handleCategorySelect = (categoryId: number) => {
    updateFilters({
      category_id: selectedCategory === String(categoryId) ? null : String(categoryId),
    })
  }

  const handleAvailableOnly = (checked: boolean) => {
    setAvailableOnly(checked)
    updateFilters({
      available_only: checked ? "true" : null,
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 10000])
    setAvailableOnly(false)
    router.push("/products")
  }

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const hasActiveFilters =
    selectedCategory ||
    searchParams.get("min_price") ||
    searchParams.get("max_price") ||
    searchParams.get("available_only")

  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.includes(category.id)
    const isSelected = selectedCategory === String(category.id)

    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-pointer",
            isSelected && "bg-primary/10 text-primary font-medium",
            depth > 0 && "ml-4",
          )}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleCategory(category.id)
              }}
              className="p-0.5"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          <span onClick={() => handleCategorySelect(category.id)} className="flex-1">
            {category.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">{category.children!.map((child) => renderCategory(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-semibold">
          Categorías
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1">
          {categories.map((category) => renderCategory(category))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-semibold">
          Precio
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="w-full" />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="h-9"
              placeholder="Min"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="h-9"
              placeholder="Max"
            />
          </div>
          <Button onClick={handlePriceApply} size="sm" className="w-full">
            Aplicar Precio
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox id="available" checked={availableOnly} onCheckedChange={handleAvailableOnly} />
        <Label htmlFor="available" className="text-sm cursor-pointer">
          Solo disponibles
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
          <X className="mr-2 h-4 w-4" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <aside className={cn("hidden lg:block", className)}>
        <div className="sticky top-20">
          <h2 className="mb-4 text-lg font-semibold">Filtros</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
