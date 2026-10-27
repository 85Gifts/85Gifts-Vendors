const STOREFRONT_ACCENTS = [
  'bg-blue-700',
  'bg-indigo-700',
  'bg-cyan-700',
  'bg-sky-700',
  'bg-violet-700',
] as const

export function storefrontAccent(seed: string): string {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return STOREFRONT_ACCENTS[hash % STOREFRONT_ACCENTS.length]
}

export function storefrontInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '85'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function storefrontMonogram(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0]
  return (first ?? '85').slice(0, 1).toUpperCase()
}

const DOT_PATTERN = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,0.07)"/></svg>`

export const STOREFRONT_PATTERN_STYLE = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(DOT_PATTERN)}")`,
  backgroundSize: '24px 24px',
} as const
