"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/ProductGrid/ProductGrid";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/product/all", {
          params: {
            pageNumber: 1,
            pageSize: 4,
            sortBy: "id",
            sortDirection: "asc",
          },
        });

        setProducts(response.data.result.content); 
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <Hero
        heading="Elevate Your Senses with Timeless Scents"
        body="At Raumania Fragrance, we craft luxurious scents that capture emotions, memories, and moments. Each fragrance is designed to elevate your senses, blending the finest ingredients to create timeless aromas."
        buttonText="Custom Your Perfumes"
        buttonHref="/explore"
      />
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <ProductGrid
          heading="Our Perfumes"
          body="Browse our luxurious collection of signature scents."
          products={products.map((product: Product) => ({
            id: product.id,
            name: product.name,
            thumbnailImage: "https://res.cloudinary.com/dr4kiyshe/image/upload/v1731717759/mtp_zm7tdf.jpg",
            price: product.price,
            customizeUrl: "/customize/street-rocket",
            description: "",
            productMaterial: "",
            inspiration: "",
            usageInstructions: "",
            stock: 0,
            isActive: true,
            brandName: "N/A",
          
            productVariants: [],
            productImages: [],
            reviewStatistic: {
              averageRating: 0,
              totalReviews: 0,
              fiveStarReviews: 0,
              fourStarReviews: 0,
              threeStarReviews: 0,
              twoStarReviews: 0,
              oneStarReviews: 0,
            },
            threeLatestReviews: [],
            relatedProduct: [],
          }))}
          
          
        />
      )}
    </>
  );
}
