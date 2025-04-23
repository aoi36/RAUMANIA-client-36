"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import type { OrderPaginationParams } from "@/types/pagination"
import useOrderStore from "@/stores/useOrderStore"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"

// Helper function to format dates
const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A"
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    myOrders,
    totalOrders,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    fetchMyOrders,
  } = useOrderStore()

  const [sortField, setSortField] = useState<string>("createdAt,desc")

  // Query params
  const pageNumber = Number(searchParams.get("page") || "1")
  const sort = searchParams.get("sort") || sortField

  // Fetch on mount & param change
  useEffect(() => {
    const params: Partial<OrderPaginationParams> = {
      pageNumber,
      pageSize,
      sort,
    }
    fetchMyOrders(params)
  }, [fetchMyOrders, pageNumber, pageSize, sort])

  // Pagination nav
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    params.set("sort", sort)
    router.push(`/orders?${params.toString()}`)
  }




  return (
    <DashboardShell>
      <DashboardHeader title="My Orders" />
      <div className="p-6">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                  
                  >
                    Order Date
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
              
                  >
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                        <p className="mt-2">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : myOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  myOrders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-700">
                          {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => router.push(`/orders/${order.orderId}`)}
                          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          title="View Order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing {myOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
