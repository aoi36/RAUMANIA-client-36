"use client"

import { useEffect, useState } from "react"
import { Bounded } from "@/components/Bounded"
import { Heading } from "@/components/Heading"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus } from "lucide-react"
import useCartStore from "@/stores/useCartStore"
import { useAuthStore } from "@/stores/useAuthStore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Checkbox } from "@/components/ui/checkbox"

export default function CartPage() {
  const { cart, isLoading, getMyCart, updateCartItem, removeFromCart } = useCartStore()
  const { authUser, fetchAuthUser } = useAuthStore()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [selectedTotal, setSelectedTotal] = useState(0)

  // Check authentication and fetch cart data
  useEffect(() => {
    const initCart = async () => {
      try {
        // First check if user is authenticated
        await fetchAuthUser()

        // If not authenticated, redirect to login
        if (!useAuthStore.getState().authUser) {
          const currentPath = window.location.pathname
          router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
          return
        }

        // If authenticated, fetch cart
        await getMyCart()
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing cart:", error)
        // If there's an error, redirect to login
        const currentPath = window.location.pathname
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      }
    }

    initCart()
  }, [getMyCart, fetchAuthUser, router])

  // Initialize selected items when cart loads
  useEffect(() => {
    if (cart && cart.cartItems) {
      // Initialize all items as selected
      const initialSelectedState: Record<string, boolean> = {}
      cart.cartItems.forEach((item) => {
        initialSelectedState[item.id] = true
      })
      setSelectedItems(initialSelectedState)
    }
  }, [cart])

  // Calculate selected total whenever selections or cart changes
  useEffect(() => {
    if (cart && cart.cartItems) {
      const total = cart.cartItems.reduce((sum, item) => {
        return sum + (selectedItems[item.id] ? item.price * item.quantity : 0)
      }, 0)
      setSelectedTotal(total)
    }
  }, [selectedItems, cart])

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change)
    if (newQuantity === currentQuantity) return

    // Check if user is still authenticated
    if (!authUser) {
      toast.error("Please login to update your cart")
      const currentPath = window.location.pathname
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    await updateCartItem({
      cartItemId,
      quantity: newQuantity,
    })
  }

  const handleRemoveItem = async (cartItemId: string) => {
    // Check if user is still authenticated
    if (!authUser) {
      toast.error("Please login to remove items from your cart")
      const currentPath = window.location.pathname
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    await removeFromCart(cartItemId)
  }

  const handleItemSelection = (itemId: string, isChecked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: isChecked,
    }))
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (cart && cart.cartItems) {
      const newSelectedState: Record<string, boolean> = {}
      cart.cartItems.forEach((item) => {
        newSelectedState[item.id] = isChecked
      })
      setSelectedItems(newSelectedState)
    }
  }

  const getSelectedItemIds = () => {
    return Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)
  }

  const handleProceedToCheckout = () => {
    const selectedIds = getSelectedItemIds()
    if (selectedIds.length === 0) {
      toast.error("Please select at least one item to checkout")
      return
    }

    // Navigate to checkout page with selected item IDs
    router.push(`/checkout?items=${selectedIds.join(",")}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // If still checking authentication or loading cart, show loading state
  if (!isInitialized || isLoading) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        </div>
      </Bounded>
    )
  }

  if (!authUser) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Please login to view your cart</p>
            <Link
              href="/login"
              className="button-cutout group inline-flex items-center bg-gradient-to-b from-brand-orange to-brand-lime from-25% to-75% bg-[length:100%_400%] font-bold text-black transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black py-3 px-6"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </Bounded>
    )
  }

  // If authenticated but cart is empty
  if (!cart || cart.cartItems.length === 0) {
    return (
      <Bounded className="min-h-screen bg-brand-cream py-16">
        <Heading className="text-center mb-8" as="h1">
          Your Cart
        </Heading>
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-8">Your cart is empty</p>
          <Link
            href="/shop"
            className="button-cutout group inline-flex items-center bg-gradient-to-b from-brand-orange to-brand-lime from-25% to-75% bg-[length:100%_400%] font-bold text-black transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black py-3 px-6"
          >
            Continue Shopping
          </Link>
        </div>
      </Bounded>
    )
  }

  const selectedItemCount = Object.values(selectedItems).filter(Boolean).length

  return (
    <Bounded className="min-h-screen bg-brand-cream py-16">
      <Heading className="text-center mb-8" as="h1">
        Your Cart
      </Heading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-medium">Cart Items ({cart.totalItems})</h2>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={cart.cartItems.length > 0 && selectedItemCount === cart.cartItems.length}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
                <label htmlFor="select-all" className="text-sm">
                  Select All
                </label>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {cart.cartItems.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`select-${item.id}`}
                      checked={selectedItems[item.id] || false}
                      onCheckedChange={(checked) => handleItemSelection(item.id, checked === true)}
                    />

                    {/* <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=96&width=96"}
                        alt={item.productName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div> */}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-medium text-lg">{item.productName}</h3>
                    <p className="text-gray-500 text-sm mb-2">{item.variantName}</p>
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Items</span>
                <span>
                  {selectedItemCount} of {cart.totalItems}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-black text-white hover:bg-gray-900 py-6"
                onClick={handleProceedToCheckout}
                disabled={selectedItemCount === 0}
              >
                Proceed to Checkout
              </Button>
              <Link href="/shop" className="block text-center text-gray-600 hover:text-gray-900">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Bounded>
  )
}
