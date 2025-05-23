import ProductSearch from "@/components/search/product-search";

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Product Search</h1>
      <ProductSearch />
    </div>
  )
}
