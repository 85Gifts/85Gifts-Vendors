import { useEffect, useState } from 'react'
import type { Category, CategoryType } from '@/app/types/category'
import { categoryApi } from '@/lib/categoryApi'

export function useCategories(type?: CategoryType) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const items = await categoryApi.list(type)
        if (!cancelled) setCategories(items)
      } catch (err) {
        if (!cancelled) {
          setCategories([])
          setError(err instanceof Error ? err.message : 'Failed to load categories')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [type])

  return { categories, loading, error }
}
