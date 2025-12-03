"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: { id: number; url: string }[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Use placeholder if no images
  const displayImages =
    images.length > 0
      ? images
      : [{ id: 0, url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(productName)}` }]

  const currentImage = displayImages[selectedIndex]

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Dialog>
          <DialogTrigger asChild>
            <button className="group relative h-full w-full">
              <img
                src={currentImage.url || "/placeholder.svg"}
                alt={`${productName} - Imagen ${selectedIndex + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-8 w-8" />
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0">
            <img
              src={currentImage.url || "/placeholder.svg"}
              alt={`${productName} - Vista ampliada`}
              className="h-full w-full object-contain"
            />
          </DialogContent>
        </Dialog>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                index === selectedIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
              )}
            >
              <img
                src={image.url || "/placeholder.svg"}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
