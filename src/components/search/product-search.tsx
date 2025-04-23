"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"
import type { ProductSearchParams, ProductSummary } from "@/types/index"
import useProductStore from "@/stores/useProductStore"

export default function ProductSearch() {
  const {
    searchProductsName,
    searchElasticsearch,
    isLoading,
    products,
    totalProducts,
    totalPages,
    currentPage,
    pageSize,
    nameSuggestions,
  } = useProductStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        try {
          await searchProductsName(debouncedSearchQuery)
          if (nameSuggestions && nameSuggestions.length > 0) {
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchQuery, searchProductsName])

  useEffect(() => {
    setSelectedIndex(null)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setHasSearched(true)
    setShowSuggestions(false)

    const searchParams: ProductSearchParams = {
      name: searchQuery,
      pageNumber: 1,
      pageSize: 12,
      sortBy: "id",
      sortDirection: "asc",
    }

    await searchElasticsearch(searchParams)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(null)

    const searchParams: ProductSearchParams = {
      name: suggestion,
      pageNumber: 1,
      pageSize: 12,
      sortBy: "id",
      sortDirection: "asc",
    }

    setHasSearched(true)
    searchElasticsearch(searchParams)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (nameSuggestions && nameSuggestions.length > 0) {
        setShowSuggestions(true)
        setSelectedIndex((prev) =>
          prev === null || prev === nameSuggestions.length - 1 ? 0 : prev + 1
        )
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (nameSuggestions && nameSuggestions.length > 0) {
        setShowSuggestions(true)
        setSelectedIndex((prev) =>
          prev === null || prev === 0 ? nameSuggestions.length - 1 : prev - 1
        )
      }
    } else if (e.key === "Enter") {
      if (selectedIndex !== null && nameSuggestions[selectedIndex]) {
        handleSuggestionClick(nameSuggestions[selectedIndex])
      } else {
        handleSearch()
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    const searchParams: ProductSearchParams = {
      name: searchQuery,
      pageNumber: newPage,
      pageSize: pageSize,
      sortBy: "id",
      sortDirection: "asc",
    }

    searchElasticsearch(searchParams)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
    setHasSearched(false)
    setSelectedIndex(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative" ref={suggestionsRef}>
        <div className="flex items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setSelectedIndex(null)
                if (searchQuery.trim().length > 1 && nameSuggestions && nameSuggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              className="pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()} className="ml-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {showSuggestions && nameSuggestions && nameSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            <ul className="py-1">
              {nameSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 text-sm cursor-pointer ${
                    selectedIndex === index ? "bg-gray-100 font-medium" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hasSearched && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? "Searching..." : `Search Results (${totalProducts})`}
            </h2>
            {searchQuery && <p className="text-sm text-gray-500">Showing results for "{searchQuery}"</p>}
          </div>

          {products.length === 0 && !isLoading ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No products found matching your search criteria.</p>
              <Button variant="link" onClick={clearSearch}>
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as ProductSummary} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 3 + i
                        }
                        if (currentPage > totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        }
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

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
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: ProductSummary
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.thumbnailImage || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {product.minPrice === product.maxPrice
            ? `$${product.minPrice.toFixed(2)}`
            : `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`}
        </p>
      </div>
    </div>
  )
}
