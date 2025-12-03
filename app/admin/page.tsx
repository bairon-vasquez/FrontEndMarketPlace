"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ordersApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const summary = await ordersApi.getSummary()
        setStats(summary)
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Mock data
        setStats({
          totalOrders: 156,
          totalRevenue: 24589.99,
          totalProducts: 48,
          pendingOrders: 12,
          recentOrders: [
            { id: 1001, status: "processing", total: 299.99, created_at: new Date().toISOString() },
            { id: 1002, status: "shipped", total: 149.5, created_at: new Date().toISOString() },
            { id: 1003, status: "pending", total: 89.99, created_at: new Date().toISOString() },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Cargando estadísticas..." />
      </div>
    )
  }

  const statCards = [
    {
      title: "Ingresos Totales",
      value: `$${stats?.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Pedidos Totales",
      value: stats?.totalOrders,
      icon: ShoppingCart,
      change: "+8.2%",
      trend: "up",
    },
    {
      title: "Productos",
      value: stats?.totalProducts,
      icon: Package,
      change: "+3",
      trend: "up",
    },
    {
      title: "Pedidos Pendientes",
      value: stats?.pendingOrders,
      icon: TrendingUp,
      change: "-2",
      trend: "down",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu tienda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div
                className={cn("flex items-center text-xs", stat.trend === "up" ? "text-success" : "text-destructive")}
              >
                {stat.trend === "up" ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {stat.change} vs mes anterior
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Últimos pedidos realizados en tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Pedido #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
