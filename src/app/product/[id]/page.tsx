"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Bounded } from "@/components/Bounded"
import { ButtonLink } from "@/components/ButtonLink"
import { SVGFilters } from "@/components/SVGFilters"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductInfo } from "@/components/product/ProductInfo"
import { ProductDescription } from "@/components/product/ProductDescription"
import { ReviewSection } from "@/components/product/ReviewSection"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import axios from "@/lib/axios-custom"
import { useAuthStore } from "@/stores/useAuthStore"

export default function ProductDetailPage() {
  // Use useParams hook instead of accessing params directly
  const params = useParams()
  const productId = params.id as string

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { fetchAuthUser } = useAuthStore()

  // Fetch auth user on component mount
  useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  // Function to fetch product data
  const fetchProductData = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`/api/product/${productId}`)

      // Process the product data to ensure all image URLs are valid
      const product = res.data.result

      // Fix product images
      if (product.productImages) {
        product.productImages = product.productImages.map((img: any) => ({
          ...img,
          image: ensureValidImageUrl(img.image),
        }))
      }

      // Fix related product images
      if (product.relatedProducts) {
        product.relatedProducts = product.relatedProducts.map((related: any) => ({
          ...related,
          thumbnailImage: ensureValidImageUrl(related.thumbnailImage),
        }))
      }

      setCurrentProduct(product)
      setError(null)
    } catch (err) {
      console.error("Failed to load product", err)
      setError("Failed to load product details")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch product on component mount
  useEffect(() => {
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  // Helper function to ensure image URLs are valid
  function ensureValidImageUrl(url: string): string {
    if (!url) return "/placeholder.svg?height=300&width=300"

    // If URL already starts with / or http, it's valid
    if (url.startsWith("/") || url.startsWith("http")) {
      return url
    }

    // Otherwise, add a leading slash
    return `/placeholder.svg?height=300&width=300`
  }

  // Handle review submission
  const handleReviewSubmitted = () => {
    // Refresh product data to show the new review
    fetchProductData()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          <p className="mt-4 text-gray-600">Loading your fragrance experience...</p>
        </div>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-cream">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="mb-4 font-serif text-2xl font-light">Product Not Found</h2>
          <p className="mb-6 text-gray-600">We couldn't find the fragrance you're looking for.</p>
          <ButtonLink href="/" color="orange" size="md">
            Explore Our Collection
          </ButtonLink>
        </div>
      </div>
    )
  }

  // Get the first product variant ID for reviews
  const firstVariantId =
    currentProduct.productVariants && currentProduct.productVariants.length > 0
      ? currentProduct.productVariants[0].id
      : ""

  return (
    <div className="min-h-screen bg-brand-cream">
      <SVGFilters />

      {error && (
        <div className="bg-amber-50 p-4 text-center text-amber-800">
          <p className="text-sm">
            Note: There was an issue loading some product data. Some information might be incomplete.
          </p>
        </div>
      )}

      <Bounded className="pt-12">
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center hover:text-gray-900">
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <a href="/shop" className="hover:text-gray-900">
                    Fragrances
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-gray-700">{currentProduct.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <ProductGallery
            name={currentProduct.name}
            thumbnailImage={currentProduct.thumbnailImage}
            images={currentProduct.productImages || []}
          />
          <ProductInfo
            name={currentProduct.name}
            minPrice={currentProduct.minPrice}
            maxPrice={currentProduct.maxPrice}
            variants={currentProduct.productVariants || []}
            description={currentProduct.description}
          />
        </div>
      </Bounded>

      <ProductDescription
        name={currentProduct.name}
        description={currentProduct.description}
        productMaterial={currentProduct.productMaterial}
        inspiration={currentProduct.inspiration}
        usageInstructions={currentProduct.usageInstructions}
      />

      <ReviewSection
        reviews={currentProduct.threeLatestReviews || []}
        statistics={
          currentProduct.reviewStatistic || {
            averageRating: 0,
            totalReviews: 0,
            fiveStarReviews: 0,
            fourStarReviews: 0,
            threeStarReviews: 0,
            twoStarReviews: 0,
            oneStarReviews: 0,
          }
        }
        productId={currentProduct.id}
        productVariantId={firstVariantId}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Pass the related products from the current product */}
      <RelatedProducts relatedProducts={currentProduct.relatedProducts || []} />

      <footer className="bg-black py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-serif text-xl font-light">RAUMANIA</h3>
              <p className="text-sm text-gray-400">
                Discover the art of fragrance with our curated collection of premium scents.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wider">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    All Fragrances
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Gift Sets
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Track Order
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wider">Newsletter</h4>
              <p className="mb-4 text-sm text-gray-400">
                Subscribe to receive updates on new arrivals and special offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-l-full bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button className="rounded-r-full bg-white px-4 py-2 text-sm font-medium text-gray-900">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Raumania Fragrance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
