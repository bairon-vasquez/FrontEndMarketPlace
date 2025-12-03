"use client"

import type React from "react"

import Link from "next/link"
import { ShoppingCart, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore, type Product } from "@/providers/store-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    toast.success("Producto añadido al carrito", {
      description: product.name,
    })
  }

  const mainImage =
    product.images?.[0]?.url || `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`
  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <Link href={`/products/${product.id}`}>
      <Card className={cn("group h-full overflow-hidden transition-all hover:shadow-lg", className)}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {isOutOfStock && <Badge variant="destructive">Agotado</Badge>}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  Pocas unidades
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toast.info("Añadido a favoritos")
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Button (overlay) */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-background/90 to-transparent p-4 transition-transform group-hover:translate-y-0">
              <Button className="w-full" size="sm" onClick={handleAddToCart} disabled={isOutOfStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Sin Stock" : "Añadir al Carrito"}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="mb-1 line-clamp-2 font-medium text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </span>
              {product.stock > 0 && <span className="text-xs text-muted-foreground">{product.stock} disponibles</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
