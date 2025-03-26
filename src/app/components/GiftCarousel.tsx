'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: string;
  url: string;
}

interface Category {
  title: string;
  searchQuery: string;
  products?: Product[];
}

export default function GiftCarousel({ description }: { description: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching recommendations for:', description);
        
        // Get gift recommendations from OpenAI
        const recommendationsResponse = await fetch('/api/gift-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        });
        
        if (!recommendationsResponse.ok) {
          const errorData = await recommendationsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch recommendations');
        }
        
        const { categories: initialCategories } = await recommendationsResponse.json();
        console.log('Received categories:', initialCategories);
        
        if (!initialCategories || initialCategories.length === 0) {
          throw new Error('No categories received from the API');
        }

        setCategories(initialCategories);

        // Fetch products for each category
        const categoriesWithProducts = await Promise.all(
          initialCategories.map(async (category: Category) => {
            try {
              console.log('Fetching products for:', category.searchQuery);
              const productsResponse = await fetch(`/api/amazon-products?query=${encodeURIComponent(category.searchQuery)}`);
              
              if (!productsResponse.ok) {
                const errorData = await productsResponse.json();
                throw new Error(errorData.error || 'Failed to fetch products');
              }
              
              const { products } = await productsResponse.json();
              console.log(`Received ${products?.length || 0} products for category:`, category.title);
              
              return { ...category, products: products || [] };
            } catch (err) {
              console.error(`Error fetching products for category ${category.title}:`, err);
              return { ...category, products: [] };
            }
          })
        );

        setCategories(categoriesWithProducts);
      } catch (err) {
        console.error('Error in fetchRecommendations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (description) {
      fetchRecommendations();
    }
  }, [description]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <p className="text-lg font-semibold mb-2">Error</p>
        <p className="text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        No recommendations found
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 space-y-12 pt-8">
      {categories.map((category, index) => (
        <div key={index} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.products?.map((product) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                      {product.title}
                    </h3>
                    <p className="text-lg font-bold mt-2">{product.price}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 