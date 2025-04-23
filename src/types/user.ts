export type User = {
    id: string
    fullName: string | null
    email: string
    username: string
    phoneNumber: string | null
    imageUrl: string | null
    emailVerified: boolean | null
    isActive: boolean
    roleName: string
  }
  
  export type UserPaginationParams = {
    pageNumber: number
    pageSize: number
    sortBy?: string
    sortDirection?: string
  }
  
  export type UserPage = {
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    content: User[]
  }
  
  export type ApiResponse<T> = {
    status: number
    message: string
    result: T
  }
  