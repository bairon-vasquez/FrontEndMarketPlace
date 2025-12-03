// API Configuration and Helpers
const API_BASE_URL = ((globalThis as any).process?.env?.NEXT_PUBLIC_API_URL as string) || "http://localhost:5000/api"

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

// Helpers to persist and read auth token from localStorage
export function setAuthToken(token?: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem("auth_token", token)
  else localStorage.removeItem("auth_token")
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Build full URL robustly to avoid duplicate segments like /api/api
function buildUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, "")
  let p = path.startsWith("/") ? path : `/${path}`
  // If base already ends with /api and the path also starts with /api, remove the duplicate
  if (base.endsWith("/api") && p.startsWith("/api")) {
    p = p.replace(/^\/api/, "")
  }
  return `${base}${p}`
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = buildUrl(endpoint)
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

  const tokenHeaders = getAuthHeaders()

  // Normalize headers to a plain object to satisfy HeadersInit typing
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...tokenHeaders as Record<string, string>,
    ...(fetchOptions.headers as Record<string, string> | undefined || {}),
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: mergedHeaders as HeadersInit,
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

  // Backend expects JSON payload for product creation
  create: (data: any) =>
    fetchApi(`/products`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

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
  getUrl: (id: number) => buildUrl(`/images/${id}`),

  upload: (productId: number, file: File, opts?: { idImagen?: number; originalUrl?: string }) => {
    const formData = new FormData()
    formData.append("file", file)
    // Backend expects idProducto and optionally idImagen and originalUrl
    formData.append("idProducto", String(productId))
    if (opts?.idImagen) formData.append("idImagen", String(opts.idImagen))
    if (opts?.originalUrl) formData.append("originalUrl", opts.originalUrl)
    return fetch(buildUrl(`/images`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }).then((res) => res.json())
  },

  getByProduct: (productId: number) => fetchApi(`/images/product/${productId}`),

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
    return fetch(buildUrl(`/api/rag/search/multimodal`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }).then((res) => res.json())
  },

  ingestDocument: (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData()
    formData.append("file", file)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    return fetch(buildUrl(`/api/rag/ingest/document`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }).then((res) => res.json())
  },

  ingestImage: (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData()
    formData.append("file", file)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    return fetch(buildUrl(`/api/rag/ingest/image`), {
      method: "POST",
      headers: getAuthHeaders(),
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
