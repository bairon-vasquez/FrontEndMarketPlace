"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useStore, type Product } from "@/providers/store-provider"
import { ProductGallery } from "@/components/products/product-gallery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params)
  const { addToCart } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(Number(id))
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
        // Mock data for demo
        setProduct({
          id: Number(id),
          name: "Producto de Ejemplo Premium",
          description:
            "Este es un producto de alta calidad con características excepcionales. Fabricado con los mejores materiales y diseñado para durar. Incluye garantía de 2 años y envío gratuito a todo el país. Ideal para uso diario y perfecto como regalo.",
          price: 299.99,
          category_id: 1,
          stock: 15,
          images: [
            { id: 1, url: "/product-premium-view-1.jpg" },
            { id: 2, url: "/product-premium-view-2.jpg" },
            { id: 3, url: "/product-premium-view-3.jpg" },
          ],
          created_at: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product)
      }
      toast.success(`${quantity} ${quantity > 1 ? "unidades añadidas" : "unidad añadida"} al carrito`, {
        description: product.name,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Cargando producto..." />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Producto no encontrado</h1>
        <p className="mb-8 text-muted-foreground">El producto que buscas no existe o ha sido eliminado.</p>
        <Link href="/products">
          <Button>Volver al Catálogo</Button>
        </Link>
      </div>
    )
  }

  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Price */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isOutOfStock && <Badge variant="destructive">Agotado</Badge>}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  Solo {product.stock} disponibles
                </Badge>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <p className="text-4xl font-bold text-primary">
              ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div>
            <h2 className="mb-3 font-semibold">Cantidad</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isOutOfStock}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isOutOfStock ? "Sin Stock" : "Añadir al Carrito"}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="mr-2 h-5 w-5" />
              Favoritos
            </Button>
            <Button size="lg" variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Envío Gratis</p>
                <p className="text-xs text-muted-foreground">En pedidos +$100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Garantía</p>
                <p className="text-xs text-muted-foreground">2 años incluidos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Devoluciones</p>
                <p className="text-xs text-muted-foreground">30 días gratis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
