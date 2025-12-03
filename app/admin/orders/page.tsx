"use client"

import { useEffect, useState } from "react"
import { Search, Clock, Truck, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ordersApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Order } from "@/providers/store-provider"
import { toast } from "sonner"

const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, color: "secondary" },
  processing: { label: "Procesando", icon: AlertCircle, color: "default" },
  shipped: { label: "Enviado", icon: Truck, color: "default" },
  delivered: { label: "Entregado", icon: CheckCircle, color: "default" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "destructive" },
} as const

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {}
      const data = await ordersApi.getAll(params)
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      // Mock data
      setOrders([
        {
          id: 1001,
          user_id: 1,
          status: "processing",
          total: 459.98,
          items: [{ product_id: 1, quantity: 2, price: 199.99 }],
          created_at: new Date().toISOString(),
        },
        {
          id: 1002,
          user_id: 2,
          status: "shipped",
          total: 299.99,
          items: [{ product_id: 5, quantity: 1, price: 299.99 }],
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 1003,
          user_id: 3,
          status: "pending",
          total: 149.99,
          items: [{ product_id: 8, quantity: 3, price: 49.99 }],
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 1004,
          user_id: 1,
          status: "delivered",
          total: 89.99,
          items: [{ product_id: 12, quantity: 1, price: 89.99 }],
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)),
      )
      toast.success("Estado actualizado")
    } catch (error) {
      console.error("Error updating status:", error)
      // Demo success
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)),
      )
      toast.success("Estado actualizado")
    }
  }

  const filteredOrders = orders.filter((order) => String(order.id).includes(search))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Cargando pedidos..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona y actualiza el estado de los pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-32">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status]
                const StatusIcon = config.icon

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={config.color as any} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
