"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup"
import { useAuthStore } from "@/stores/useAuthStore"
import useCartStore from "@/stores/useCartStore"
import { toast } from "react-hot-toast"
import useOrderStore from "@/stores/useOrderStore"

// Delivery and Payment method enums
enum DeliveryMethod {
  VIETTEL_POST = "VIETTEL_POST",
  GRAB_EXPRESS = "GRAB_EXPRESS",
  SHOPEE_EXPRESS = "SHOPEE_EXPRESS",
  RAUMANIA_EXPRESS = "RAUMANIA_EXPRESS",
}

enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
  GOOGLE_PAY = "GOOGLE_PAY",
  APPLE_PAY = "APPLE_PAY",
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
  OTHER = "OTHER",
}

// Delivery method display names
const deliveryMethodNames: Record<DeliveryMethod, string> = {
  [DeliveryMethod.VIETTEL_POST]: "Viettel Post",
  [DeliveryMethod.GRAB_EXPRESS]: "Grab Express",
  [DeliveryMethod.SHOPEE_EXPRESS]: "Shopee Express",
  [DeliveryMethod.RAUMANIA_EXPRESS]: "Raumania Express",
}

// Delivery method fees (based on the Java service implementation)
const deliveryMethodFees: Record<DeliveryMethod, number> = {
  [DeliveryMethod.VIETTEL_POST]: 25.0,
  [DeliveryMethod.GRAB_EXPRESS]: 35.0,
  [DeliveryMethod.SHOPEE_EXPRESS]: 20.0,
  [DeliveryMethod.RAUMANIA_EXPRESS]: 36.0,
}

// Payment method display names
const paymentMethodNames: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Cash on Delivery",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.CREDIT_CARD]: "Credit Card",
  [PaymentMethod.DEBIT_CARD]: "Debit Card",
  [PaymentMethod.PAYPAL]: "PayPal",
  [PaymentMethod.STRIPE]: "Stripe",
  [PaymentMethod.GOOGLE_PAY]: "Google Pay",
  [PaymentMethod.APPLE_PAY]: "Apple Pay",
  [PaymentMethod.CRYPTOCURRENCY]: "Cryptocurrency",
  [PaymentMethod.OTHER]: "Other",
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authUser, fetchAuthUser } = useAuthStore()
  const { cart, getMyCart } = useCartStore()
  const { createOrder, createStripePayment, isLoading, stripeSessionUrl } = useOrderStore()

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    houseNumber: "",
    streetName: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    deliveryMethod: DeliveryMethod.RAUMANIA_EXPRESS,
    paymentMethod: PaymentMethod.CASH,
  })

  // Initialize checkout page
  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Check authentication
        await fetchAuthUser()
        if (!useAuthStore.getState().authUser) {
          router.push("/login?redirectTo=/cart")
          return
        }

        // Get cart data
        await getMyCart()

        // Get selected items from URL
        const itemsParam = searchParams.get("items")
        if (!itemsParam) {
          toast.error("No items selected for checkout")
          router.push("/cart")
          return
        }

        const itemIds = itemsParam.split(",")
        setSelectedItems(itemIds)

        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing checkout:", error)
        toast.error("Something went wrong. Please try again.")
        router.push("/cart")
      }
    }

    initCheckout()
  }, [fetchAuthUser, getMyCart, router, searchParams])

  // Redirect to Stripe if session URL is available
  useEffect(() => {
    if (stripeSessionUrl) {
      window.location.href = stripeSessionUrl
    }
  }, [stripeSessionUrl])

  // Filter cart items based on selected IDs
  useEffect(() => {
    if (cart && cart.cartItems && selectedItems.length > 0) {
      const filteredItems = cart.cartItems.filter((item) => selectedItems.includes(item.id))
      setSelectedCartItems(filteredItems)
    }
  }, [cart, selectedItems])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeliveryMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: value as DeliveryMethod,
    }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value as PaymentMethod,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const requiredFields = ["houseNumber", "streetName", "city", "state", "country", "postalCode"]

    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (selectedItems.length === 0) {
      toast.error("No items selected for checkout")
      return
    }

    try {
      // Create checkout request
      const checkoutRequest = {
        cartItemIds: selectedItems,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        houseNumber: formData.houseNumber,
        streetName: formData.streetName,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      }

      // Create order
      const orderResponse = await createOrder(checkoutRequest)

      // If payment method is not CASH, redirect to Stripe
      if (formData.paymentMethod !== PaymentMethod.CASH) {
        // Create Stripe payment
        await createStripePayment(orderResponse.id)
        // Redirect will happen in the useEffect when stripeSessionUrl is set
      } else {
        // For cash payments, redirect to order confirmation
        toast.success("Order placed successfully!")
        router.push(`/orders/${orderResponse.id}`)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    }
  }

  const calculateSubtotal = () => {
    if (!selectedCartItems.length) return 0
    return selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateDeliveryFee = () => {
    return deliveryMethodFees[formData.deliveryMethod as DeliveryMethod] || 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Loading state
  if (!isInitialized || !cart) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      </Bounded>
    )
  }

  return (
    <Bounded className="min-h-screen bg-brand-cream py-16">
      <Heading className="text-center mb-8" as="h1">
        Checkout
      </Heading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">Shipping Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="houseNumber">House/Apartment Number *</Label>
                  <Input
                    id="houseNumber"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetName">Street Name *</Label>
                  <Input
                    id="streetName"
                    name="streetName"
                    value={formData.streetName}
                    onChange={handleInputChange}
                    placeholder="Main Street"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">Delivery Method</h2>

              <RadioGroup
                value={formData.deliveryMethod}
                onValueChange={handleDeliveryMethodChange}
                className="space-y-4"
              >
                {Object.values(DeliveryMethod).map((method) => (
                  <div key={method} className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value={method} id={`delivery-${method}`} />
                    <Label htmlFor={`delivery-${method}`} className="flex-grow flex justify-between">
                      <span>{deliveryMethodNames[method]}</span>
                      <span className="font-medium">{formatCurrency(deliveryMethodFees[method])}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-6">Payment Method</h2>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="space-y-4"
              >
                {Object.values(PaymentMethod).map((method) => (
                  <div key={method} className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value={method} id={`payment-${method}`} />
                    <Label htmlFor={`payment-${method}`} className="flex-grow">
                      {paymentMethodNames[method]}
                      {method !== PaymentMethod.CASH && (
                        <span className="text-xs text-gray-500 block mt-1">
                          You'll be redirected to our secure payment provider
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-medium">Order Summary</h2>

            {/* Selected Items */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Items ({selectedCartItems.length})</h3>

              <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                {selectedCartItems.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(calculateDeliveryFee())}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              className="w-full bg-black text-white hover:bg-gray-900 py-6"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : formData.paymentMethod === PaymentMethod.CASH
                  ? "Place Order"
                  : "Proceed to Payment"}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="w-full text-center text-gray-600 hover:text-gray-900"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    </Bounded>
  )
}
