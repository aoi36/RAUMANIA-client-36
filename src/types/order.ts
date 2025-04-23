

export type OrderItem = {
  id: string
  productId: string
  productName: string
  productVariantId: string
  productVariantName?: string // Make optional
  productVariantSize?: string // Make optional
  productVariantScent?: string // Make optional
  productThumbnail?: string // Make optional
  quantity: number
  unitPrice: number
  totalPrice: number
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum DeliveryStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  PREPARING = "PREPARING", // Added this to match backend
}

export type Order = {
  id: string
  orderNumber?: string
  userId: string
  userName: string
  subtotal?: number
  totalAmount: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  deliveryMethod: string
  deliveryStatus: DeliveryStatus
  deliveryFee: number
  orderItems: OrderItem[]

  // Direct address fields instead of nested object
  houseNumber?: string
  streetName?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string

  createdAt: string | Date
  updatedAt?: string | Date
}

// New type for order summary response
export type OrderSummary = {
  orderId: string
  productVariantName: string
  productVariantSize?: string
  productVariantScent?: string
  quantity: number
  deliveryStatus: DeliveryStatus
  totalAmount: number
  createdAt: string | Date
}

export type OrdersPage = {
  content: Order[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type OrderStatusCounts = {
  pending: number
  processing: number
  completed: number
  cancelled: number
}

export type UpdateOrderStatusRequest = {
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
  deliveryStatus?: DeliveryStatus
}
