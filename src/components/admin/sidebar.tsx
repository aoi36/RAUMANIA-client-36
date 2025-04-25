"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Box, ChevronDown, MessageSquare, Package, ShoppingCart, Star, Tag, User, Users } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="w-60 min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Logo */}
    

      {/* Navigation */}
      <div className="flex-1 py-4">
        {/* GENERAL Section */}
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-500 mb-2">GENERAL</p>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/dashboard") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <BarChart3 size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/product-list"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/products") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Box size={18} />
              <span>Products</span>
             
            </Link>

            <Link
              href="/admin/brands"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/brands") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Tag size={18} />
              <span>Brands</span>
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/orders") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <ShoppingCart size={18} />
              <span>Orders</span>
             
            </Link>

            <Link
              href="/admin/reviews"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/reviews") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Star size={18} />
              <span>Reviews</span>
            </Link>
          </nav>
        </div>

        {/* USERS Section */}
        <div className="px-4 mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-500 mb-2">USERS</p>
          <nav className="space-y-1">
            <Link
              href="/admin/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/profile") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                isActive("/users") ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Users size={18} />
              <span>Users</span>
             
            </Link>

      
          </nav>
        </div>
      </div>
    </div>
  )
}
