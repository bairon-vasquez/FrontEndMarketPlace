"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api"

type CatItem = { id: number; name: string; imageUrl: string; href: string }

function normalizeBase(url: string) {
  return url.replace(/\/$/, "")
}

export function CategoryExplorer() {
  const [items, setItems] = useState<CatItem[] | null>(null)

  useEffect(() => {
    let mounted = true
    const base = normalizeBase(API_BASE_URL)

    async function load() {
      try {
        const r = await fetch(`${base}/categories/tree`)
        const json = await r.json()
        const tree = json?.category_tree ?? []

        const cats = Array.isArray(tree) ? tree : []

        // Deduplicate categories by normalized name (case-insensitive) because the backend
        // may contain multiple entries with the same display name (e.g. "Tecnología").
        const seen = new Set<string>()
        const uniqueCats = [] as any[]
        for (const node of cats) {
          const name = (node.nombre ?? node.name ?? "").toString().trim()
          const key = name.toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            uniqueCats.push(node)
          }
        }

        const results = await Promise.all(
          uniqueCats.map(async (node: any) => {
            const id = Number(node.idCategoria ?? node.id ?? 0)
            const name = node.nombre ?? node.name ?? `Categoria ${id}`
            let imageUrl = "/placeholder.svg"

            // Try to get one product from this category and use its first image
            try {
              const pRes = await fetch(`${base}/products?category_id=${id}&limit=1`)
              if (pRes.ok) {
                const pJson = await pRes.json()
                const prod = (pJson?.products && pJson.products[0]) ?? pJson?.product ?? null
                if (prod) {
                  const imgs = prod.imagenesProductos ?? prod.images ?? []
                  if (Array.isArray(imgs) && imgs.length > 0) {
                    const first = imgs[0]
                    // handle numeric id or object
                    let imgId: number | null = null
                    if (typeof first === "number") imgId = first
                    else if (typeof first === "string" && /^\d+$/.test(first)) imgId = Number(first)
                    else if (typeof first === "object") imgId = Number(first.idImagen ?? first.id ?? first.idImage ?? null)

                    if (imgId) imageUrl = `${base}/images/${imgId}`
                    else if (typeof first === "object" && typeof first.url === "string") imageUrl = first.url
                  }
                }
              }
            } catch (e) {
              // ignore per-category failures
              console.warn("Failed to fetch representative product for category", id, e)
            }

            return { id, name, imageUrl, href: `/products?category_id=${id}` }
          }),
        )

        if (mounted) setItems(results)
      } catch (err) {
        console.error("Failed to load categories", err)
        if (mounted) setItems([])
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (!items) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((category) => (
        <Link key={category.id} href={category.href}>
          <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={category.imageUrl || "/placeholder.svg"}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
