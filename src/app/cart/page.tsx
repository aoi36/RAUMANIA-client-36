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
    <Bounded className="min-h-screen bg-brand-cream py-16 text-foreground font-cormorant">
    <Heading className="text-center mb-10 text-brand-purple font-dancing tracking-wide" as="h1">
      Your Cart
    </Heading>
  
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-brand-orange">
          <div className="p-6 border-b border-muted flex justify-between items-center">
            <h2 className="text-xl font-medium text-brand-purple">
              Cart Items ({cart.totalItems})
            </h2>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={
                  cart.cartItems.length > 0 &&
                  selectedItemCount === cart.cartItems.length
                }
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
              <label htmlFor="select-all" className="text-sm text-muted-foreground">
                Select All
              </label>
            </div>
          </div>
  
          <div className="divide-y divide-muted">
            {cart.cartItems.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start gap-6">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id={`select-${item.id}`}
                    checked={selectedItems[item.id] || false}
                    onCheckedChange={(checked) =>
                      handleItemSelection(item.id, checked === true)
                    }
                  />
                </div>
  
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-brand-purple">{item.productName}</h3>
                  <p className="text-muted-foreground text-sm mb-1">{item.variantName}</p>
                  <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                </div>
  
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center border border-muted rounded-xl overflow-hidden transition-colors duration-150">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      className="p-2 hover:bg-brand-orange transition-colors duration-150"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      className="p-2 hover:bg-brand-orange transition-colors duration-150"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-destructive hover:text-brand-orange flex items-center gap-1 text-sm transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  
      {/* Order Summary Section */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-brand-orange sticky top-24">
          <h2 className="text-xl font-semibold mb-6 text-brand-purple font-dancing tracking-wide">
            Order Summary
          </h2>
  
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Selected Items</span>
              <span>
                {selectedItemCount} of {cart.totalItems}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(selectedTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-muted pt-4 flex justify-between font-medium text-base text-foreground">
              <span>Total</span>
              <span>{formatCurrency(selectedTotal)}</span>
            </div>
          </div>
  
          <div className="space-y-4">
            <Button
              className="w-full bg-brand-purple text-white hover:bg-brand-orange py-5 rounded-xl transition-colors duration-150"
              onClick={handleProceedToCheckout}
              disabled={selectedItemCount === 0}
            >
              Proceed to Checkout
            </Button>
            <Link
              href="/shop"
              className="block text-center text-muted-foreground hover:text-brand-purple transition-colors duration-150"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  </Bounded>
  
  )
}
