export type CategoryType = 'event' | 'product'

export interface Category {
  _id: string
  name: string
  type: CategoryType
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CategorySuccessResponse<T> {
  success: true
  data: {
    message: string
    data: T
  }
}

export interface CategoryErrorResponse {
  success: false
  message: string
  code?: string
  errors?: Array<{ field: string; message: string }>
  error?: string
}

export interface CreateCategoryBody {
  name: string
  type: CategoryType
}

export interface UpdateCategoryBody {
  name?: string
  type?: CategoryType
}

export interface ListCategoriesQuery {
  type?: CategoryType
}
