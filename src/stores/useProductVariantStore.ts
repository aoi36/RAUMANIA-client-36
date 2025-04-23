import { create } from "zustand"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type { ProductVariant, CreateProductVariantRequest, UpdateProductVariantRequest } from "@/types/product-variant"

interface ProductVariantStoreState {
  isLoading: boolean
  error: string | null
  selectedVariant: ProductVariant | null

  // Create product variant
  createProductVariant: (data: CreateProductVariantRequest) => Promise<ProductVariant | null>

  // Update product variant
  updateProductVariant: (id: string, data: UpdateProductVariantRequest) => Promise<ProductVariant | null>

  // Get product variant by ID
  getProductVariantById: (id: string) => Promise<ProductVariant | null>

  // Delete product variant
  deleteProductVariant: (id: string) => Promise<boolean>

  // Set selected variant
  setSelectedVariant: (variant: ProductVariant | null) => void
}

const useProductVariantStore = create<ProductVariantStoreState>((set) => ({
  isLoading: false,
  error: null,
  selectedVariant: null,

  createProductVariant: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<{ result: ProductVariant }>("/api/product-variant", data)
      toast.success("Product variant created successfully")
      set({ isLoading: false })
      return response.data.result
    } catch (error: any) {
      console.error("Error creating product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to create product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  updateProductVariant: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put<{ result: ProductVariant }>(`/api/product-variant/${id}`, data)
      toast.success("Product variant updated successfully")
      set({ isLoading: false })
      return response.data.result
    } catch (error: any) {
      console.error("Error updating product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to update product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  getProductVariantById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{ result: ProductVariant }>(`/api/product-variant/${id}`)
      set({ selectedVariant: response.data.result, isLoading: false })
      return response.data.result
    } catch (error: any) {
      console.error("Error fetching product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return null
    }
  },

  deleteProductVariant: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`/api/product-variant/${id}`)
      toast.success("Product variant deleted successfully")
      set({ isLoading: false })
      return true
    } catch (error: any) {
      console.error("Error deleting product variant:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete product variant"
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      return false
    }
  },

  setSelectedVariant: (variant) => {
    set({ selectedVariant: variant })
  },
}))

export default useProductVariantStore
