"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ProductSearchParams } from "@/types/index"
import useProductStore from "@/stores/useProductStore"

export default function ElasticsearchSearch() {
  const { searchElasticsearch, isLoading, products, totalProducts, currentPage, pageSize, totalPages } =
    useProductStore()

  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: "id",
    sortDirection: "asc",
    name: "",
    minPrice: undefined,
    maxPrice: undefined,
    brandName: "",
    isActive: undefined,
    size: "",
    scent: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setSearchParams((prev) => ({ ...prev, [name]: checked }))
  }

  const handlePriceChange = (values: number[]) => {
    setSearchParams((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }))
  }

  const handleSearch = async () => {
    await searchElasticsearch(searchParams)
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, pageNumber: newPage }))
    searchElasticsearch({ ...searchParams, pageNumber: newPage })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Advanced Product Search</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Search by name..."
              value={searchParams.name || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="pt-6 px-2">
              <Slider defaultValue={[0, 1000]} max={1000} step={10} onValueChange={handlePriceChange} />
              <div className="flex justify-between mt-2 text-sm">
                <span>${searchParams.minPrice || 0}</span>
                <span>${searchParams.maxPrice || 1000}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandName">Brand</Label>
            <Input
              id="brandName"
              name="brandName"
              placeholder="Filter by brand..."
              value={searchParams.brandName || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              name="size"
              placeholder="Filter by size..."
              value={searchParams.size || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scent">Scent</Label>
            <Input
              id="scent"
              name="scent"
              placeholder="Filter by scent..."
              value={searchParams.scent || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select value={searchParams.sortBy} onValueChange={(value) => handleSelectChange("sortBy", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="minPrice">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortDirection">Sort Direction</Label>
            <Select
              value={searchParams.sortDirection}
              onValueChange={(value) => handleSelectChange("sortDirection", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort direction..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={searchParams.isActive || false}
              onCheckedChange={(checked) => handleCheckboxChange("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive">Active Products Only</Label>
          </div>
        </div>

        <Button onClick={handleSearch} disabled={isLoading} className="w-full">
          {isLoading ? "Searching..." : "Search Products"}
        </Button>
      </div>

      {/* Results section */}
      {products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Search Results ({totalProducts})</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <img
                  src={product.thumbnailImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  {product.minPrice === product.maxPrice
                    ? `$${product.minPrice}`
                    : `$${product.minPrice} - $${product.maxPrice}`}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
