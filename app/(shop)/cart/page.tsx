"use client"

import Link from "next/link"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { useStore } from "@/providers/store-provider"

export default function CartPage() {
  const { state, clearCart, cartCount } = useStore()

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-4 text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mb-8 text-muted-foreground">Parece que aún no has añadido productos a tu carrito.</p>
        <Link href="/products">
          <Button size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Explorar Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Carrito de Compras</h1>
          <p className="text-muted-foreground">
            {cartCount} {cartCount === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>
        <Button variant="outline" onClick={clearCart}>
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.cart.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </Link>
        </div>

        {/* Summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
