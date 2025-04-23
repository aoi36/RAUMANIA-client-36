import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type { User, UserPaginationParams, UserPage, ApiResponse } from "@/types/user"

interface UserStoreState {
  isLoading: boolean
  error: string | null
  users: User[]
  totalUsers: number
  totalPages: number
  currentPage: number
  pageSize: number
  selectedUser: User | null

  // Fetch users
  fetchUsers: (params?: Partial<UserPaginationParams>) => Promise<void>

  // Set selected user
  setSelectedUser: (user: User | null) => void

  // Update user
  updateUser: (
    userId: string,
    userData: {
      fullName?: string
      phoneNumber?: string
      imageUrl?: string
      isActive?: boolean
    },
  ) => Promise<void>

  // Update user status
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>

  // Delete user
  deleteUser: (userId: string) => Promise<void>

  // Create user
  createUser: (userData: {
    fullName: string
    email: string
    username: string
    password: string
    phoneNumber: string
    roleName: string
  }) => Promise<void>

  // Fetch user by ID
  fetchUserById: (userId: string) => Promise<void>
}

const useUserStore = create<UserStoreState>((set, get) => ({
  isLoading: false,
  error: null,
  users: [],
  totalUsers: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  selectedUser: null,

  fetchUsers: async (params?: Partial<UserPaginationParams>) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()

      const pageNumber = params?.pageNumber ?? state.currentPage
      const pageSize = params?.pageSize ?? state.pageSize
      const sortBy = params?.sortBy ?? "id"
      const sortDirection = params?.sortDirection ?? "asc"

      const response = await axios.get<ApiResponse<UserPage>>("/api/user/all", {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortDirection,
        },
      })

      set({
        users: response.data.result.content,
        totalUsers: response.data.result.totalElements,
        totalPages: response.data.result.totalPages,
        currentPage: pageNumber,
        pageSize,
        isLoading: false,
      })
    } catch (error: any) {
      console.error("Error fetching users:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch users. Please try again.",
      })
    }
  },

  fetchUserById: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<ApiResponse<User>>(`/api/user/${userId}`)
      set({ selectedUser: response.data.result, isLoading: false })
    } catch (error: any) {
      console.error("Error fetching user:", error)
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch user. Please try again.",
      })
      throw error
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user })
  },

  updateUser: async (userId, userData) => {
    set({ isLoading: true, error: null })
    try {
      await axios.put<ApiResponse<User>>(`/api/user/${userId}`, userData)

      // Update the user in the users array
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, ...userData } : user)),
        selectedUser: null,
        isLoading: false,
      }))

      toast.success("User updated successfully!")
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast.error(error.response?.data?.message || "Failed to update user")
      set({ isLoading: false, error: "Failed to update user." })
      throw error
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    set({ isLoading: true, error: null })
    try {
      await axios.put(`/api/user/${userId}`, { isActive })

      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, isActive } : user)),
        isLoading: false,
      }))

      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully!`)
    } catch (error: any) {
      console.error("Error updating user status:", error)
      toast.error(error.response?.data?.message || "Failed to update user status")
      set({ isLoading: false, error: "Failed to update user status." })
    }
  },

  deleteUser: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/user/${userId}`)

      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        totalUsers: state.totalUsers - 1,
        isLoading: false,
      }))

      toast.success("User deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error(error.response?.data?.message || "Failed to delete user")
      set({ isLoading: false, error: "Failed to delete user." })
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post<ApiResponse<User>>("/api/user", userData)

      // Refresh the user list after creating a new user
      await get().fetchUsers()

      toast.success("User created successfully!")
    } catch (error: any) {
      console.error("Error creating user:", error)
      const errorMessage = error.response?.data?.message || "Failed to create user"
      toast.error(errorMessage)
      set({ isLoading: false, error: errorMessage })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useUserStore
