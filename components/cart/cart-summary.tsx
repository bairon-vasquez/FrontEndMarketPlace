"use client"

import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/providers/store-provider"

interface CartSummaryProps {
  showCheckoutButton?: boolean
}

export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cartTotal, cartCount, state } = useStore()

  const shipping = cartTotal >= 100 ? 0 : 9.99
  const tax = cartTotal * 0.21 // 21% IVA
  const total = cartTotal + shipping + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Resumen del Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({cartCount} {cartCount === 1 ? "producto" : "productos"})
          </span>
          <span>${cartTotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>
            {shipping === 0 ? (
              <span className="text-success">Gratis</span>
            ) : (
              `$${shipping.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IVA (21%)</span>
          <span>${tax.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
        </div>
        {cartTotal > 0 && cartTotal < 100 && (
          <div className="rounded-md bg-muted p-3 text-sm">
            Añade ${(100 - cartTotal).toLocaleString("es-ES", { minimumFractionDigits: 2 })} más para envío gratis
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">${total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
        </div>
      </CardContent>
      {showCheckoutButton && (
        <CardFooter>
          <Link href={state.isAuthenticated ? "/checkout" : "/login"} className="w-full">
            <Button className="w-full" size="lg" disabled={cartCount === 0}>
              {state.isAuthenticated ? "Proceder al Checkout" : "Inicia Sesión para Comprar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
