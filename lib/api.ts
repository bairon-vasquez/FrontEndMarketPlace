// API Configuration and Helpers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }))
    throw new ApiError(response.status, error.message || `Error ${response.status}`)
  }

  return response.json()
}

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    category_id?: number
    min_price?: number
    max_price?: number
    available_only?: boolean
    search?: string
  }) => fetchApi<{ products: any[]; total: number; page: number; pages: number }>("/products", { params }),

  getById: (id: number) => fetchApi<any>(`/products/${id}`),

  create: (data: FormData) =>
    fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      body: data,
    }).then((res) => res.json()),

  update: (id: number, data: any) =>
    fetchApi(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi(`/products/${id}`, {
      method: "DELETE",
    }),
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<any[]>("/categories"),
  getTree: () => fetchApi<any[]>("/categories/tree"),
  create: (data: { name: string; parent_id?: number }) =>
    fetchApi("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; parent_id?: number }) =>
    fetchApi(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi(`/categories/${id}`, {
      method: "DELETE",
    }),
}

// Orders API
export const ordersApi = {
  getAll: (params?: { user_id?: number; status?: string }) => fetchApi<any[]>("/orders", { params }),

  getById: (id: number) => fetchApi<any>(`/orders/${id}`),

  getSummary: () => fetchApi<any>("/orders/summary"),

  create: (data: { user_id: number; items: { product_id: number; quantity: number }[] }) =>
    fetchApi("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) =>
    fetchApi(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}

// Images API
export const imagesApi = {
  getUrl: (id: number) => `${API_BASE_URL}/images/${id}`,

  upload: (productId: number, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("product_id", String(productId))
    return fetch(`${API_BASE_URL}/images`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  },

  delete: (id: number) =>
    fetchApi(`/images/${id}`, {
      method: "DELETE",
    }),
}

// RAG API
export const ragApi = {
  query: (data: { query: string; top_k?: number }) =>
    fetchApi<{ answer: string; sources: any[] }>("/api/rag/query", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  hybridQuery: (data: {
    query: string
    filters?: { language?: string; year_min?: number; year_max?: number }
    top_k?: number
  }) =>
    fetchApi<{ answer: string; sources: any[] }>("/api/rag/hybrid-query", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  searchMultimodal: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${API_BASE_URL}/api/rag/search/multimodal`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  },

  ingestDocument: (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData()
    formData.append("file", file)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    return fetch(`${API_BASE_URL}/api/rag/ingest/document`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  },

  ingestImage: (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData()
    formData.append("file", file)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    return fetch(`${API_BASE_URL}/api/rag/ingest/image`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  },
}

// Auth API (simulated for demo)
export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; password: string; name: string }) =>
    fetchApi<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<any>("/auth/me"),
}

export { API_BASE_URL, fetchApi, ApiError }
