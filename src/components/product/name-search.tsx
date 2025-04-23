"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useProductStore from "@/stores/useProductStore"

export default function ProductNameSearch() {
  const { searchProductsName, isLoading } = useProductStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<string[]>([])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    // This will update the store state
    await searchProductsName(searchTerm)

    // You might want to get the results from the store
    const { products } = useProductStore.getState()
    setResults(products.map((p) => p.name))
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Search Results</h3>
          <ul className="space-y-1">
            {results.map((name, index) => (
              <li key={index} className="text-sm">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
