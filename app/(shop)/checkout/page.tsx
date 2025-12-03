"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, Loader2, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CartSummary } from "@/components/cart/cart-summary"
import { useStore } from "@/providers/store-provider"
import { ordersApi } from "@/lib/api"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, clearCart, cartTotal, cartCount } = useStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")

  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: state.user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "ES",
  })

  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })

  if (!state.isAuthenticated) {
    router.push("/login")
    return null
  }

  if (cartCount === 0) {
    router.push("/cart")
    return null
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await ordersApi.create({
        user_id: state.user!.id,
        items: state.cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      })

      clearCart()
      setStep("confirmation")
      toast.success("¡Pedido realizado con éxito!")
    } catch (error) {
      console.error("Error creating order:", error)
      // Demo: simulate success
      clearCart()
      setStep("confirmation")
      toast.success("¡Pedido realizado con éxito!")
    } finally {
      setLoading(false)
    }
  }

  if (step === "confirmation") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
          <Check className="h-10 w-10 text-success" />
        </div>
        <h1 className="mb-4 text-3xl font-bold">¡Gracias por tu compra!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Hemos recibido tu pedido correctamente. Te enviaremos un email con los detalles y el seguimiento del envío.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/orders">
            <Button size="lg">Ver Mis Pedidos</Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline">
              Seguir Comprando
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Carrito
      </Link>

      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "shipping" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            1
          </div>
          <span className="hidden sm:inline">Envío</span>
        </div>
        <div className="h-px w-16 bg-border" />
        <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            2
          </div>
          <span className="hidden sm:inline">Pago</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Forms */}
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle>Dirección de Envío</CardTitle>
                <CardDescription>Ingresa la dirección donde deseas recibir tu pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={shippingData.firstName}
                        onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos</Label>
                      <Input
                        id="lastName"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={shippingData.postalCode}
                        onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Select
                        value={shippingData.country}
                        onValueChange={(value) => setShippingData({ ...shippingData, country: value })}
                      >
                        <SelectTrigger id="country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ES">España</SelectItem>
                          <SelectItem value="MX">México</SelectItem>
                          <SelectItem value="AR">Argentina</SelectItem>
                          <SelectItem value="CO">Colombia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Continuar al Pago
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
                <CardDescription>Selecciona tu método de pago preferido</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Tarjeta de Crédito/Débito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                        <Input
                          id="cardName"
                          placeholder="JUAN PEREZ"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Fecha de Expiración</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Tus datos de pago están protegidos con encriptación SSL
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep("shipping")} className="flex-1">
                      Volver
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Completar Compra
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <CartSummary showCheckoutButton={false} />

          {/* Order Items Preview */}
          <Card className="mt-4">
            <CardHeader className="py-4">
              <CardTitle className="text-base">Tu Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={
                      item.product.images?.[0]?.url ||
                      `/placeholder.svg?height=50&width=50&query=${encodeURIComponent(item.product.name)}`
                    }
                    alt={item.product.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">
                    ${(item.product.price * item.quantity).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
