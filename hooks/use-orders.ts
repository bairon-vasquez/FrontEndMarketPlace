import useSWR from "swr"
import { ordersApi } from "@/lib/api"

interface OrdersParams {
  user_id?: number
  status?: string
}

export function useOrders(params: OrdersParams = {}) {
  const key = params.user_id ? ["orders", JSON.stringify(params)] : null

  const { data, error, isLoading, mutate } = useSWR(key, () => ordersApi.getAll(params), {
    revalidateOnFocus: false,
  })

  return {
    orders: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useOrder(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(id ? ["order", id] : null, () => ordersApi.getById(id!), {
    revalidateOnFocus: false,
  })

  return {
    order: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useOrdersSummary() {
  const { data, error, isLoading } = useSWR("orders-summary", () => ordersApi.getSummary(), {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    summary: data,
    isLoading,
    isError: error,
  }
}
