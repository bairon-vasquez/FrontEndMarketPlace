import useSWR from "swr"
import { productsApi, categoriesApi } from "@/lib/api"

interface ProductsParams {
  page?: number
  limit?: number
  category_id?: number
  min_price?: number
  max_price?: number
  available_only?: boolean
  search?: string
}

export function useProducts(params: ProductsParams = {}) {
  const key = ["products", JSON.stringify(params)]

  const { data, error, isLoading, mutate } = useSWR(key, () => productsApi.getAll(params), {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  return {
    products: data?.products || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pages: data?.pages || 1,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProduct(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR(id ? ["product", id] : null, () => productsApi.getById(id!), {
    revalidateOnFocus: false,
  })

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCategories() {
  const { data, error, isLoading } = useSWR("categories", () => categoriesApi.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  return {
    categories: data || [],
    isLoading,
    isError: error,
  }
}

export function useCategoryTree() {
  const { data, error, isLoading } = useSWR("categories-tree", () => categoriesApi.getTree(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    tree: data || [],
    isLoading,
    isError: error,
  }
}
