import { NextRequest, NextResponse } from 'next/server'
import { adminFetchHttp } from '@/lib/admin-server'

type RouteContext = {
  params: Promise<{ categoryId: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { categoryId } = await context.params
    const body = await request.json()
    const { status, data } = await adminFetchHttp({
      method: 'PUT',
      path: `/categories/${encodeURIComponent(categoryId)}`,
      body,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin update category API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { categoryId } = await context.params
    const { status, data } = await adminFetchHttp({
      method: 'DELETE',
      path: `/categories/${encodeURIComponent(categoryId)}`,
    })
    return NextResponse.json(data, { status })
  } catch (error: any) {
    console.error('Admin delete category API Error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete category' },
      { status: 500 }
    )
  }
}
