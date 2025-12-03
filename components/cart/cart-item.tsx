"use client"

import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, type CartItem as CartItemType } from "@/providers/store-provider"
import { toast } from "sonner"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useStore()

  const handleIncrement = () => {
    if (item.quantity < item.product.stock) {
      updateQuantity(item.product.id, item.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.product.id)
    toast.info("Producto eliminado del carrito", {
      description: item.product.name,
    })
  }

  const imageUrl =
    item.product.images?.[0]?.url ||
    `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(item.product.name)}`

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {/* Product Image */}
      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={item.product.name}
          className="h-24 w-24 rounded-md object-cover"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${item.product.id}`} className="font-medium hover:text-primary transition-colors">
            {item.product.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{item.product.description}</p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={handleIncrement}
              disabled={item.quantity >= item.product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold">
              ${(item.product.price * item.quantity).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              ${item.product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })} c/u
            </p>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={handleRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
