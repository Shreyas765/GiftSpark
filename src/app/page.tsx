"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

// Custom hook for authentication
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check auth status from localStorage
    const checkAuthStatus = () => {
      try {
        // In a real app, you'd verify the token with your backend
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  return { isLoggedIn, isLoading };
};

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  // Rotating text options for "Let us do the thinking for..."
  const [textIndex, setTextIndex] = useState(0);
  const textOptions = ["your best friend", "your coworker", "your partner", "your mom", "your brother", "your daughter"];
  
  // Scroll animation for text
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % textOptions.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation Bar - Keep the same */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm">
        {/* Logo in Nav */}
        <div className="flex items-center">
          <Link href="/">
            <div className="text-gray-800 font-bold text-2xl mr-8 flex items-center">
              <span className="text-cyan-600">Gift</span>Spark
              <span className="ml-2 text-yellow-400 text-3xl">✨</span>
            </div>
          </Link>
        </div>

        <div className='flex gap-4'>
          <Link href='/login'>
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full border border-cyan-500 transition-all duration-300 shadow-sm hover:shadow'>
              Log in
            </button>
          </Link>
          <Link href='/signup'>
            <button className='bg-gray-100 text-gray-800 hover:bg-gray-200 py-2 px-4 rounded-full transition-all duration-300 shadow-sm hover:shadow'>
              Sign up
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content - Pinterest Style */}
      <main className='flex flex-col flex-1'>
        {/* Hero Section with Pinterest-style layout */}
        <section className="flex flex-col items-center text-center py-4 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Find the perfect gift for{" "}
              <span className="text-cyan-600 inline-block min-w-40 text-left">
                {textOptions[textIndex]}
              </span>
            </h1>
          </div>
        </section>

         {/* CTA Button */}
        <div className="flex justify-center">
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg">
            Get Started
          </button>
        </div>

        {/* Pinterest-style masonry grid*/}
        <div className="w-full px-4 max-w-8xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {/* Grid of "pins" */}
            {Array(4).fill().map((_, i) => (
              <div 
                key={i} 
                className={`rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${
                  i % 4 === 0 || i % 4 === 3 ? 'row-span-2' : ''
                }`}
                style={{ 
                  marginTop: `${Math.floor(Math.random() * 10)}px`, // Reduced randomness
                  height: `${300 + Math.floor(Math.random() * 100)}px` // Capped height at 300-400px
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <span className="text-lg font-medium text-cyan-800">Gift Idea {i+1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>



      {/* Minimal Footer */}
      <footer className="py-6 bg-white text-gray-600 text-center border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-cyan-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Contact</a>
            <span>© 2025 GiftSpark</span>
          </div>
        </div>
      </footer>
    </div>
  );
}