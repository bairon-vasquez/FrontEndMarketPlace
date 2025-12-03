"use client"

import type React from "react"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/providers/store-provider"
import { ordersApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-warning text-warning-foreground" },
  processing: { label: "Procesando", icon: Package, color: "bg-primary text-primary-foreground" },
  shipped: { label: "Enviado", icon: Truck, color: "bg-accent text-accent-foreground" },
  delivered: { label: "Entregado", icon: CheckCircle, color: "bg-success text-success-foreground" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-destructive text-destructive-foreground" },
}

interface OrderDetail {
  id: number
  user_id: number
  status: string
  total: number
  items: { product_id: number; product_name: string; quantity: number; price: number; image?: string }[]
  shipping_address?: {
    name: string
    address: string
    city: string
    postal_code: string
    country: string
  }
  created_at: string
  updated_at?: string
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { state } = useStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getById(Number(resolvedParams.id))
        setOrder(data)
      } catch {
        // Demo data
        setOrder({
          id: Number(resolvedParams.id),
          user_id: state.user?.id || 1,
          status: "processing",
          total: 459.97,
          items: [
            { product_id: 1, product_name: "Auriculares Inalámbricos Pro", quantity: 1, price: 199.99 },
            { product_id: 2, product_name: "Smartwatch Deportivo", quantity: 2, price: 129.99 },
          ],
          shipping_address: {
            name: state.user?.name || "Usuario",
            address: "Calle Principal 123",
            city: "Madrid",
            postal_code: "28001",
            country: "España",
          },
          created_at: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [resolvedParams.id, state.isAuthenticated, state.user, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner size="lg" text="Cargando pedido..." />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
        <Link href="/orders">
          <Button className="mt-4">Volver a Mis Pedidos</Button>
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Mis Pedidos
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
          <p className="text-muted-foreground">
            Realizado el{" "}
            {new Date(order.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge className={`${statusInfo.color} gap-2 px-4 py-2 text-sm`}>
          <StatusIcon className="h-4 w-4" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>{order.items.length} artículo(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={
                            item.image ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.product_name)}`
                          }
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["pending", "processing", "shipped", "delivered"].map((step, index) => {
                  const stepConfig = statusConfig[step]
                  const StepIcon = stepConfig.icon
                  const isCompleted = ["pending", "processing", "shipped", "delivered"].indexOf(order.status) >= index
                  const isCurrent = order.status === step

                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </div>
                        {index < 3 && <div className={`h-8 w-0.5 ${isCompleted ? "bg-primary" : "bg-muted"}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>{stepConfig.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {isCompleted && !isCurrent && "Completado"}
                          {isCurrent && "Estado actual"}
                          {!isCompleted && "Pendiente"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.total * 0.79).toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (21%)</span>
                <span>${(order.total * 0.21).toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-success">Gratis</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p className="text-muted-foreground">{order.shipping_address.address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.city}, {order.shipping_address.postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href="/products">Seguir Comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
