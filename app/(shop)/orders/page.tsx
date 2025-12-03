"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { ordersApi } from "@/lib/api"
import { useStore, type Order } from "@/providers/store-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
  processing: {
    label: "Procesando",
    icon: AlertCircle,
    variant: "default" as const,
    color: "text-primary",
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    variant: "default" as const,
    color: "text-accent",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-success",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-destructive",
  },
}

export default function OrdersPage() {
  const { state } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!state.user) {
        setLoading(false)
        return
      }

      try {
        const data = await ordersApi.getAll({ user_id: state.user.id })
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        // Mock data for demo
        setOrders([
          {
            id: 1001,
            user_id: state.user.id,
            status: "delivered",
            total: 459.98,
            items: [
              { product_id: 1, quantity: 2, price: 199.99 },
              { product_id: 3, quantity: 1, price: 59.99 },
            ],
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 1002,
            user_id: state.user.id,
            status: "shipped",
            total: 299.99,
            items: [{ product_id: 5, quantity: 1, price: 299.99 }],
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 1003,
            user_id: state.user.id,
            status: "processing",
            total: 149.99,
            items: [{ product_id: 8, quantity: 3, price: 49.99 }],
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [state.user])

  if (!state.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-4 text-2xl font-bold">Inicia sesión para ver tus pedidos</h1>
        <p className="mb-8 text-muted-foreground">Necesitas una cuenta para ver tu historial de pedidos.</p>
        <Link href="/login">
          <Button size="lg">Iniciar Sesión</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Cargando pedidos..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Mis Pedidos</h1>
        <p className="text-muted-foreground">Historial de todos tus pedidos en NexusShop</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No tienes pedidos aún</h2>
            <p className="mb-6 text-muted-foreground">Explora nuestro catálogo y realiza tu primera compra.</p>
            <Link href="/products">
              <Button>Ver Catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status]
            const StatusIcon = config.icon

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={config.variant} className="gap-1.5">
                        <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                        {config.label}
                      </Badge>
                      <span className="font-semibold text-lg">
                        ${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
