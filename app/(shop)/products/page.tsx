"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { productsApi } from "@/lib/api"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductPagination } from "@/components/products/product-pagination"
import { CategorySidebar } from "@/components/products/category-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, Category } from "@/providers/store-provider"

function ProductsPageContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  const page = Number(searchParams.get("page")) || 1
  const categoryId = searchParams.get("category_id")
  const minPrice = searchParams.get("min_price")
  const maxPrice = searchParams.get("max_price")
  const availableOnly = searchParams.get("available_only")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "newest"

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productsApi.getAll({
        page,
        limit: 12,
        category_id: categoryId ? Number(categoryId) : undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        available_only: availableOnly === "true",
        search: search || undefined,
      })
      setProducts(data.products)
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      })
    } catch (error) {
      console.error("Error fetching products:", error)
      // Mock data for demo
      const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Producto ${i + 1}`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        price: Math.floor(Math.random() * 500) + 50,
        category_id: Math.floor(Math.random() * 4) + 1,
        stock: Math.floor(Math.random() * 100),
        images: [],
        created_at: new Date().toISOString(),
      }))
      setProducts(mockProducts)
      setPagination({ page: 1, pages: 3, total: 36 })
    } finally {
      setLoading(false)
    }
  }, [page, categoryId, minPrice, maxPrice, availableOnly, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    // Mock categories for demo
    setCategories([
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
    ])
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Catálogo de Productos</h1>
        <p className="text-muted-foreground">{pagination.total} productos encontrados</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar with Categories */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <CategorySidebar />
          <div className="mt-8">
            <ProductFilters categories={categories} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <ProductFilters categories={categories} className="lg:hidden" />

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select defaultValue={sort}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" text="Cargando productos..." />
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              <ProductPagination currentPage={pagination.page} totalPages={pagination.pages} className="mt-8" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" text="Cargando..." />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}
