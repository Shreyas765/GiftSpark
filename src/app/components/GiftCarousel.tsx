'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';


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

export default function GiftCarousel({ description, shouldGenerate = false }: { description: string, shouldGenerate?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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

        // Fetch products for each category sequentially
        const categoriesWithProducts = [];
        for (const category of initialCategories) {
          try {
            console.log('Fetching products for:', category.searchQuery);
            const productsResponse = await fetch(`/api/amazon-products?query=${encodeURIComponent(category.searchQuery)}`);
            
            if (!productsResponse.ok) {
              const errorData = await productsResponse.json();
              throw new Error(errorData.error || 'Failed to fetch products');
            }
            
            const { products } = await productsResponse.json();
            console.log(`Received ${products?.length || 0} products for category:`, category.title);
            
            categoriesWithProducts.push({ ...category, products: products || [] });
          } catch (err) {
            console.error(`Error fetching products for category ${category.title}:`, err);
            categoriesWithProducts.push({ ...category, products: [] });
          }
        }

        setCategories(categoriesWithProducts);
      } catch (err) {
        console.error('Error in fetchRecommendations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (shouldGenerate && description) {
      fetchRecommendations();
    }
  }, [description, shouldGenerate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="animate-ping absolute inset-0 bg-pink-300 opacity-75 rounded-full"></div>
          <div className="animate-spin absolute inset-0 border-4 border-dashed border-pink-500 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-center">
            <Sparkles 
              className="text-orange-500 animate-pulse" 
              size={48} 
              strokeWidth={2} 
            />
            <div className="absolute w-full h-full border-4 border-pink-200 rounded-full animate-bounce-slow opacity-50"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-red-500">
        <p className="text-lg font-semibold mb-2">Error</p>
        <p className="text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:from-pink-600 hover:to-orange-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="flex items-center justify-center h-48">
        No recommendations found
      </div>
    );
  }

  return (
    <div className="space-y-16 px-6">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x snap-mandatory scrollbar-hide">
              {category.products?.map((product) => (
                <a
                  key={product.id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-none w-[280px] snap-start"
                >
                  <div className="border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white h-full">
                    <div className="relative h-[280px] w-full bg-gray-50">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          No image available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-lg font-bold mt-3 text-gray-900">{product.price}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}