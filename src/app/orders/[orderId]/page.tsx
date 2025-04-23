"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react"
import useOrderStore from "@/stores/useOrderStore"
import { useAuthStore } from "@/stores/useAuthStore"

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

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Status badge components
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor()} px-3 py-1 rounded-full text-xs font-medium`}>{status}</Badge>
}

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor()} px-3 py-1 rounded-full text-xs font-medium`}>{status}</Badge>
}

const DeliveryStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusColor()} px-3 py-1 rounded-full text-xs font-medium`}>{status}</Badge>
}

// Order tracking component
const OrderTracking = ({
  orderStatus,
  paymentStatus,
  deliveryStatus,
}: {
  orderStatus: string
  paymentStatus: string
  deliveryStatus: string
}) => {
  const steps = [
    {
      label: "Order Placed",
      icon: <Clock className="h-6 w-6" />,
      completed: true, // Always completed if we're viewing the order
      current: orderStatus === "PENDING",
    },
    {
      label: "Payment",
      icon: <CreditCard className="h-6 w-6" />,
      completed: paymentStatus === "COMPLETED",
      current: paymentStatus === "PENDING",
      error: paymentStatus === "FAILED",
    },
    {
      label: "Processing",
      icon: <Package className="h-6 w-6" />,
      completed: ["SHIPPED", "DELIVERED"].includes(deliveryStatus),
      current: deliveryStatus === "PROCESSING",
      disabled: paymentStatus !== "COMPLETED",
    },
    {
      label: "Shipped",
      icon: <Truck className="h-6 w-6" />,
      completed: deliveryStatus === "DELIVERED",
      current: deliveryStatus === "SHIPPED",
      disabled: !["SHIPPED", "DELIVERED"].includes(deliveryStatus),
    },
    {
      label: "Delivered",
      icon: <CheckCircle className="h-6 w-6" />,
      completed: deliveryStatus === "DELIVERED",
      current: false,
      disabled: deliveryStatus !== "DELIVERED",
    },
  ]

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">Order Tracking</h3>
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`
              flex items-center justify-center w-12 h-12 rounded-full 
              ${
                step.error
                  ? "bg-red-100 text-red-600"
                  : step.completed
                    ? "bg-green-100 text-green-600"
                    : step.current
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
              }
              ${step.disabled ? "opacity-50" : "opacity-100"}
            `}
            >
              {step.error ? <XCircle className="h-6 w-6" /> : step.icon}
            </div>
            <span
              className={`
              text-xs mt-2 text-center
              ${
                step.error
                  ? "text-red-600"
                  : step.completed
                    ? "text-green-600"
                    : step.current
                      ? "text-blue-600"
                      : "text-gray-500"
              }
              ${step.disabled ? "opacity-50" : "opacity-100"}
            `}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string
  const { getOrderById, selectedOrder, isLoading, error, clearSelectedOrder } = useOrderStore()
  const { authUser, fetchAuthUser } = useAuthStore()

  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState(false)

  // First, check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchAuthUser()
        setAuthChecked(true)
      } catch (error) {
        console.error("Error fetching auth user:", error)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [fetchAuthUser])

  // Then, fetch order data once authentication is checked
  useEffect(() => {
    if (!authChecked) return

    // If not authenticated, don't try to fetch the order
    if (!authUser) {
      return
    }

    const fetchOrder = async () => {
      try {
        await getOrderById(orderId)
        setAuthError(false)
      } catch (error: any) {
        console.error("Error fetching order:", error)
        if (error.response?.status === 403) {
          setAuthError(true)
        }
      }
    }

    fetchOrder()

    // Cleanup on unmount
    return () => {
      clearSelectedOrder()
    }
  }, [orderId, getOrderById, clearSelectedOrder, authUser, authChecked])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToOrders = () => {
    router.push("/orders")
  }

  // If still checking authentication, show loading
  if (!authChecked || (authUser && isLoading)) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      </Bounded>
    )
  }

  // If not authenticated, show login prompt
  if (!authUser) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Authentication Required
            </Heading>
            <p className="text-gray-600 mb-8 text-center">Please log in to view order details.</p>
            <Button
              className="bg-black text-white hover:bg-gray-900"
              onClick={() => router.push(`/login?redirectTo=${encodeURIComponent(`/orders/${orderId}`)}`)}
            >
              Log In
            </Button>
          </div>
        </div>
      </Bounded>
    )
  }

  // If authenticated but forbidden (not the order owner)
  if (authError) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Access Denied
            </Heading>
            <p className="text-gray-600 mb-8 text-center">
              You are not authorized to view this order. This order may belong to another user.
            </p>
            <Button className="bg-black text-white hover:bg-gray-900" onClick={handleGoToOrders}>
              View Your Orders
            </Button>
          </div>
        </div>
      </Bounded>
    )
  }

  // Error state (order not found)
  if (error === "forbidden") {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Access Denied
            </Heading>
            <p className="text-gray-600 mb-8 text-center">
              You are not authorized to view this order. This order may belong to another user.
            </p>
            <Button className="bg-black text-white hover:bg-gray-900" onClick={handleGoToOrders}>
              View Your Orders
            </Button>
          </div>
        </div>
      </Bounded>
    )
  }

  // General error state
  if ((error && error !== "forbidden") || !selectedOrder) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <Heading className="mb-2" as="h1">
              Order Not Found
            </Heading>
            <p className="text-gray-600 mb-8 text-center">
              We couldn't find the order you're looking for. It may have been deleted or the ID is incorrect.
            </p>
            <Button className="bg-black text-white hover:bg-gray-900" onClick={handleGoToOrders}>
              View Your Orders
            </Button>
          </div>
        </div>
      </Bounded>
    )
  }

  // Check if the order has address information
  const hasAddressInfo = !!(
    selectedOrder.houseNumber ||
    selectedOrder.streetName ||
    selectedOrder.city ||
    selectedOrder.state ||
    selectedOrder.country ||
    selectedOrder.postalCode
  )

  return (
    <Bounded className="min-h-screen bg-brand-cream py-16">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <Heading as="h1" className="mb-1">
                Order id: {selectedOrder.orderNumber ? `#${selectedOrder.orderNumber}` : selectedOrder.id}
              </Heading>
              <p className="text-gray-500">Placed on {formatDate(selectedOrder.createdAt)}</p>
            </div>
           
          </div>

          <OrderTracking
            orderStatus={selectedOrder.orderStatus}
            paymentStatus={selectedOrder.paymentStatus}
            deliveryStatus={selectedOrder.deliveryStatus}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">Order Items</h2>
              <div className="space-y-4">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.productName}</h3>
                      {item.productVariantName && (
                        <p className="text-sm text-gray-500">
                          {item.productVariantName} × {item.quantity}
                        </p>
                      )}
                      {!item.productVariantName && <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>}
                      {item.productVariantSize && (
                        <p className="text-xs text-gray-500">Size: {item.productVariantSize}</p>
                      )}
                      {item.productVariantScent && (
                        <p className="text-xs text-gray-500">Scent: {item.productVariantScent}</p>
                      )}
                    </div>
                    <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">Payment Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium">{selectedOrder.paymentMethod || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount - selectedOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500">Delivery Method</p>
                  <p className="font-medium">{selectedOrder.deliveryMethod}</p>
                </div>
                {hasAddressInfo ? (
                  <div>
                    <p className="text-gray-500">Shipping Address</p>
                    <p className="font-medium">
                      {selectedOrder.houseNumber} {selectedOrder.streetName}
                    </p>
                    <p>
                      {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}
                    </p>
                    <p>{selectedOrder.country}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">Shipping Address</p>
                    <p className="text-sm text-gray-500">Address information not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Bounded>
  )
}
