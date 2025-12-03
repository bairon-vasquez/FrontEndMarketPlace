"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

// Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  stock: number
  images: { id: number; url: string }[]
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: number
  email: string
  name: string
  role: "user" | "admin"
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

export interface Order {
  id: number
  user_id: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: { product_id: number; quantity: number; price: number }[]
  created_at: string
}

interface StoreState {
  cart: CartItem[]
  user: User | null
  isAuthenticated: boolean
  categories: Category[]
}

type StoreAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "HYDRATE"; payload: Partial<StoreState> }

const initialState: StoreState = {
  cart: [],
  user: null,
  isAuthenticated: false,
  categories: [],
}

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.cart.find((item) => item.product.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
      }
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.product.id !== action.payload.productId),
        }
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      }
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false, cart: [] }
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload }
    case "HYDRATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface StoreContextType {
  state: StoreState
  dispatch: React.Dispatch<StoreAction>
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  login: (user: User) => void
  logout: () => void
  cartTotal: number
  cartCount: number
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState)

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nexusshop-store")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: "HYDRATE", payload: parsed })
      } catch {
        // Invalid data, ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "nexusshop-store",
      JSON.stringify({ cart: state.cart, user: state.user, isAuthenticated: state.isAuthenticated }),
    )
  }, [state.cart, state.user, state.isAuthenticated])

  const addToCart = (product: Product) => {
    dispatch({ type: "ADD_TO_CART", payload: product })
  }

  const removeFromCart = (productId: number) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const login = (user: User) => {
    dispatch({ type: "SET_USER", payload: user })
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const cartTotal = state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const cartCount = state.cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        login,
        logout,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
