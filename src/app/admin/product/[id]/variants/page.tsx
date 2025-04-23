"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react"
import useProductStore from "@/stores/useProductStore"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"
import type { ProductVariant } from "@/types/product-variant"

// Custom confirmation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductVariantsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { fetchProductById } = useProductStore()

  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null)

  useEffect(() => {
    if (productId) {
      const fetchProductAndVariants = async () => {
        setIsLoading(true)
        try {
          const productData = await fetchProductById(productId)
          setProduct(productData)

          // Fetch variants for this product
          const response = await axios.get(`/api/product/${productId}/variants`)
          setVariants(response.data.result || [])
        } catch (error) {
          console.error("Failed to fetch product or variants:", error)
          toast.error("Failed to load product variants")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProductAndVariants()
    } else {
      router.push("/admin/product-list")
    }
  }, [productId, fetchProductById, router])

  const handleAddVariant = () => {
    router.push(`/admin/product-variants/add?productId=${productId}`)
  }

  const handleEditVariant = (variantId: string) => {
    router.push(`/admin/product-variants/edit/${variantId}`)
  }

  const handleDeleteVariant = (variant: ProductVariant) => {
    setVariantToDelete(variant)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!variantToDelete) return

    setIsLoading(true)
    try {
      await axios.delete(`/api/product-variant/${variantToDelete.id}`)

      // Remove the deleted variant from the list
      setVariants(variants.filter((v) => v.id !== variantToDelete.id))
      toast.success("Product variant deleted successfully")
    } catch (error) {
      console.error("Failed to delete variant:", error)
      toast.error("Failed to delete product variant")
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setVariantToDelete(null)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        title="Product Variants"
        description={product ? `Manage variants for ${product.name}` : "Manage product variants"}
      >
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/product-list")}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
          <button
            onClick={handleAddVariant}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>
      </DashboardHeader>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Product Variants</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                <p className="ml-2 text-gray-500">Loading variants...</p>
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No variants found for this product</p>
                <button
                  onClick={handleAddVariant}
                  className="flex items-center gap-1 mx-auto rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Add First Variant
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Scent</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{variant.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{variant.size}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{variant.scent}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">{variant.stock}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-700">${variant.price.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditVariant(variant.id)}
                              className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                              title="Edit Variant"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(variant)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              title="Delete Variant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this product variant? This action cannot be undone.</p>
        {variantToDelete && (
          <div className="mt-2 rounded-md bg-gray-50 p-3">
            <p>
              <strong>Variant:</strong> {variantToDelete.name}
            </p>
            <p>
              <strong>Size:</strong> {variantToDelete.size}
            </p>
            <p>
              <strong>Price:</strong> ${variantToDelete.price.toFixed(2)}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </DashboardShell>
  )
}
