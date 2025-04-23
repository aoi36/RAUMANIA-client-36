"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/admin/dashboard-shell"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/stores/useAuthStore"
import axios from "@/lib/axios-custom"
import toast from "react-hot-toast"

interface ProfileFormData {
  fullName: string
  phoneNumber: string
  imageUrl: string
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { authUser, fetchAuthUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    phoneNumber: "",
    imageUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        phoneNumber: authUser.phoneNumber || "",
        imageUrl: authUser.imageUrl || "",
      })
    } else {
      fetchAuthUser()
    }
  }, [authUser, fetchAuthUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.length < 2 || formData.fullName.length > 50) {
      newErrors.fullName = "Full name must be between 2 and 50 characters"
    }

    if (formData.phoneNumber && !/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await axios.put("/api/user/update-my-info", formData)

      // Refresh user data
      await fetchAuthUser()

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader title="My Profile" description="View and update your profile information" />

      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and profile picture</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={formData.imageUrl || "/placeholder.svg?height=128&width=128"}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128"
                    }}
                  />
                </div>
              </div>

              {/* Username and Email (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={authUser?.username || ""} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={authUser?.email || ""} disabled className="bg-gray-50" />
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Profile Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
                <p className="text-xs text-gray-500">Enter a URL for your profile picture</p>
              </div>

              {/* Role Information (Read-only) */}
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{authUser?.role?.name?.charAt(0) || "U"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Role: {authUser?.role?.name || "User"}</p>
                    <p className="text-sm text-gray-500">
                      Account Status: {authUser?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 border-t p-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
