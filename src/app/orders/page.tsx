"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import type { OrderPaginationParams } from "@/types/pagination"
import useOrderStore from "@/stores/useOrderStore"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Header } from "@/components/Header"
import { NormalFooter } from "@/components/NormalFooter"
import clsx from "clsx"

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
    <>
    <Header/>
    <div className="h-24 md:h-32 bg-brand-gray" /> 
    <div className="min-h-screen bg-brand-gray p-8 font-cormorant text-foreground">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl shadow">
          {error}
        </div>
      )}
       <h1
          className={clsx(
            'text-[3rem] md:text-[4rem] font-dancing tracking-tight text-brand-purple drop-shadow-md transition-all duration-700 text-center mb-10'
          )}
        >
          Order List
        </h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden border ">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-orange/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-dancing font-medium text-brand-purple cursor-pointer">
                  Order Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-dancing font-medium text-brand-purple cursor-pointer">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-dancing font-medium text-brand-purple cursor-pointer">
                  Order Quantity
                </th>
                <th className="px-6 py-4 text-center text-sm font-dancing font-medium text-brand-purple">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-brand-purple">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue "></div>
                      <p className="mt-2">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : myOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-brand-purple">
                    No orders found
                  </td>
                </tr>
              ) : (
                myOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b  hover:bg-brand-orange/10 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-brand-purple text-xl">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-brand-purple text-xl">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-brand-purple text-xl">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                        className="p-2 rounded-full bg-brand-blue/10 text-brand-purple hover:bg-brand-blue/20 transition-colors duration-200"
                        title="View Order"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t  bg-white">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {myOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md transition-colors duration-200 ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed text-brand-purple"
                  : "text-brand-purple hover:bg-brand-blue/10"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-200 ${
                    currentPage === pageNum
                      ? "bg-brand-orange text-white"
                      : "text-brand-purple hover:bg-brand-blue/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md transition-colors duration-200 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed text-brand-purple"
                  : "text-brand-purple hover:bg-brand-blue/10"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <NormalFooter/>
    </>
  );
}