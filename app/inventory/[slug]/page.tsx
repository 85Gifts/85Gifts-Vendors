import { notFound } from "next/navigation"
import { config } from "../../../config"
import ProductShareClient from "./ProductShareClient"
import { PublicInventoryLink } from "@/app/types/inventory"

const API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || config.BACKEND_URL

const normalizeInventoryLink = (payload: any): PublicInventoryLink | null => {
  const link = payload?.data?.data ?? payload?.data ?? payload
  if (!link?.linkCode || !link?.items) return null
  return link
}

const getInventoryLinkBySlug = async (linkCode: string): Promise<PublicInventoryLink | null> => {
  if (!linkCode) return null
  const res = await fetch(`${API_URL}/api/inventory/${linkCode}`, {
    next: { revalidate: 60 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch inventory link")
  const payload = await res.json()
  return normalizeInventoryLink(payload)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params
    const link = await getInventoryLinkBySlug(slug)
    if (!link) return { title: "Product not found" }
    const productNames = link.items.map(p => p.name).join(", ")
    return {
      title: `${link.title || productNames} | 85Gifts`,
      description: `Purchase ${productNames}`,
    }
  } catch {
    return { title: "Product" }
  }
}

export default async function InventorySharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const link = await getInventoryLinkBySlug(slug)
  if (!link) notFound()

  return <ProductShareClient link={link} />
}
