"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Modal from "./components/Modal"
import AuthForms from './components/auth-forms';
import { usePathname } from "next/navigation";

import { 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Define the type for pin animation states
type PinState = {
  opacity: number;
  transform: string;
  active: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const pathname = usePathname();

  // State for modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isLoggedIn && pathname === "/") {
      router.push('/dashboard');
    }
  }, [isLoggedIn, pathname, router]);

  // Rotating text options for "Let us do the thinking for&hellip;"
  const [textIndex, setTextIndex] = useState(0);
  const textOptions = ["your mom", "your partner", "your coworker", "your grandma", "your roommate"] as const;
  type Relation = typeof textOptions[number];

  // Add image mapping for each relation
  const relationImages: Record<Relation, string[]> = {
    "your mom": Array.from({length: 5}, (_, i) => `/GS_images/mom/mom${i + 1}.png`),
    "your partner": Array.from({length: 5}, (_, i) => `/GS_images/partner/p${i + 1}.png`),
    "your coworker": Array.from({length: 5}, (_, i) => `/GS_images/coworker/c${i + 1}.png`),
    "your grandma": Array.from({length: 5}, (_, i) => `/GS_images/Grandma/g${i + 1}.png`),
    "your roommate": Array.from({length: 5}, (_, i) => `/GS_images/roommate/r${i + 1}.png`)
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    console.error('Image failed to load:', img.src);
    img.style.display = 'none';
    img.parentElement!.style.backgroundColor = '#f3f4f6';
  };


  // State for pin animations
  const [pinStates, setPinStates] = useState<PinState[]>([
    { opacity: 1, transform: 'translateY(0)', active: true },
    { opacity: 1, transform: 'translateY(0)', active: true },
    { opacity: 1, transform: 'translateY(0)', active: true },
    { opacity: 1, transform: 'translateY(0)', active: true },
    { opacity: 1, transform: 'translateY(0)', active: true }
  ]);
  
  // Effect for text rotation and pin animations
  useEffect(() => {
    const animatePins = () => {
      // Fade out current pins
      setPinStates(prevStates => 
        prevStates.map(pin => ({
          ...pin,
          opacity: 0,
          transform: 'translateY(20px)',
          active: false
        }))
      );
      
      // After pins fade out, update text and prepare new pins
      setTimeout(() => {
        setTextIndex(prevIndex => (prevIndex + 1) % textOptions.length);
  
        // Prepare new pins with off-screen position
        setPinStates(prevStates =>
          prevStates.map(() => ({
            opacity: 0,
            transform: 'translateY(-20px)',
            active: true
          }))
        );
  
        // After a short delay, animate new pins in
        setTimeout(() => {
          setPinStates(prevStates =>
            prevStates.map(() => ({
              opacity: 1,
              transform: 'translateY(0)',
              active: true
            }))
          );
        }, 50);
      }, 500);
    };

    // Set interval to update text and animate pins
    const interval = setInterval(animatePins, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [textOptions.length]);

  // Handle opening the auth modal
  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Handle auth success
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // The useSession hook will detect the auth state change and trigger the redirect
  };

  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Function to handle manual scrolling
  const handleScroll = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false);
    const container = document.querySelector('.scroll-container');
    if (container) {
      const currentPosition = scrollPosition;
      const newPosition = direction === 'left' 
        ? Math.max(0, currentPosition - 1) 
        : Math.min(5, currentPosition + 1);
      setScrollPosition(newPosition);
      
      // Reset auto-scrolling after manual interaction
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 5000);
    }
  };

  // If still loading or user is logged in, show nothing (or a loading spinner)
  if (isLoading || isLoggedIn) {
    return null; // Or return a loading spinner
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15] pointer-events-none" />
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm z-50">
      {/* Logo in Nav */}
        <div className="flex items-center">
          <Link href="/">
            <div className="text-gray-800 font-bold text-2xl mr-8 flex items-center">
            <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Gift</span>Spark
            <span className="ml-2 text-yellow-400 text-3xl">✨</span>
            </div>
          </Link>
        </div> 
        
        <div className='flex gap-4'>
          <button 
            onClick={() => openAuthModal('login')}
            className='bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-2 px-4 rounded-full border border-transparent transition-all duration-300 shadow-sm hover:shadow'
          >
            Log in
          </button>
          <button 
            onClick={() => openAuthModal('signup')}
            className='bg-gray-100 text-gray-800 hover:bg-gray-200 py-2 px-4 rounded-full transition-all duration-300 shadow-sm hover:shadow'
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Main Content - Pinterest Style */}
      <main className='flex flex-col flex-1 pt-20'>
        {/* Hero Section with Pinterest-style layout */}
        <section className="flex flex-col items-center text-center py-4 md:py-16 px-4 relative">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-1 leading-tight">
              Find the perfect gift for
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent inline-block min-w-40 text-left pb-[2px]">
                {textOptions[textIndex]}
              </span>
            </h1>
          </div>
        </section>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link href="/guest">
            <button
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-lg flex items-center"
            >
              Generate now
              <ArrowRight size={20} className="ml-2" />
            </button>
          </Link>
        </div>

        {/* Pinterest-style grid with consistent sizing and animations */}
        <div className="w-full px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {pinStates.map((pin, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-100"
                style={{
                  opacity: pin.opacity,
                  transform: pin.transform,
                  transition: 'all 1s ease-in-out',
                  height: '300px',
                  display: pin.active ? 'block' : 'block',
                }}
              >
                <div className="w-full h-full relative">
                  <Image 
                    src={relationImages[textOptions[textIndex]][i]}
                    alt={`Gift idea ${i + 1} for ${textOptions[textIndex]}`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Descriptive Section with Just Steps - Now with Consistent Pink/Orange Background */}
        <section id="how-it-works" className="bg-white py-20 px-4 overflow-hidden mt-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h4 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-6 pb-[2px]">
                It&apos;s the thought that counts!
              </h4>
              <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed">
                With{" "}
                <span className="text-pink-500 relative inline-block">
                  <span className="relative z-10">smart and personalized AI suggestions</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-orange-400" 
                        style={{
                          backgroundSize: '200% 100%',
                          animation: 'moveGradient 2s linear infinite'
                        }}></span>
                </span>{" "}
                for anyone in your life, we&apos;re here to help you do the thinking, so you can focus on what matters.
              </p>
            </div>
          </div>

          <style jsx global>{`
            @keyframes moveGradient {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-100% - 1rem)); }
            }
            .scroll-container {
              animation: scroll 30s linear infinite;
            }
          `}</style>
            
            {/* Example Prompts Carousel */}
            <div className="mb-12">
              <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden">
                  {/* Navigation Arrows */}
                  <button 
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                  
                  <div 
                    className="flex space-x-4 scroll-container"
                    style={{
                      animation: isAutoScrolling ? 'scroll 30s linear infinite' : 'none',
                      transform: `translateX(-${scrollPosition * 33.33}%)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  >
                    {[
                      {
                        prompt: "A minimalist who loves Japanese culture, tea ceremonies, and sustainable fashion",
                        relationship: "Sister"
                      },
                      {
                        prompt: "A fitness enthusiast who's into meditation, plant-based cooking, and indie music",
                        relationship: "Roommate"
                      },
                      {
                        prompt: "A history buff who collects antique maps, loves classical literature, and enjoys whiskey tasting",
                        relationship: "Dad"
                      },
                      {
                        prompt: "A tech entrepreneur who's passionate about space exploration, sci-fi movies, and craft cocktails",
                        relationship: "Friend"
                      },
                      {
                        prompt: "A creative soul who loves pottery, vintage cameras, and experimental cooking",
                        relationship: "Partner"
                      },
                      {
                        prompt: "A nature lover who's into bird watching, organic gardening, and acoustic guitar",
                        relationship: "Grandparent"
                      }
                    ].map((example, index) => (
                      <div 
                        key={index}
                        className="flex-shrink-0 w-1/3 bg-white rounded-lg shadow-md p-6 border-l-4 border-r-4 border-gradient-to-r from-pink-500 to-orange-400 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative">
                          <svg 
                            className="absolute top-0 left-0 w-8 h-8 text-pink-400 opacity-20"
                            fill="currentColor" 
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                          <p className="text-gray-700 text-base italic pl-8">
                            &ldquo;{example.prompt}&rdquo;
                          </p>
                          <div className="mt-4 text-right">
                            <span className="text-sm text-gray-500 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent font-medium">- {example.relationship}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate items for seamless scrolling */}
                    {[
                      {
                        prompt: "A minimalist who loves Japanese culture, tea ceremonies, and sustainable fashion",
                        relationship: "Sister"
                      },
                      {
                        prompt: "A fitness enthusiast who's into meditation, plant-based cooking, and indie music",
                        relationship: "Roommate"
                      },
                      {
                        prompt: "A history buff who collects antique maps, loves classical literature, and enjoys whiskey tasting",
                        relationship: "Dad"
                      }
                    ].map((example, index) => (
                      <div 
                        key={`duplicate-${index}`}
                        className="flex-shrink-0 w-1/3 bg-white rounded-lg shadow-md p-6 border-l-4 border-r-4 border-gradient-to-r from-pink-500 to-orange-400 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative">
                          <svg 
                            className="absolute top-0 left-0 w-8 h-8 text-pink-400 opacity-20"
                            fill="currentColor" 
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                          <p className="text-gray-700 text-base italic pl-8">
                            &ldquo;{example.prompt}&rdquo;
                          </p>
                          <div className="mt-4 text-right">
                            <span className="text-sm text-gray-500 bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent font-medium">- {example.relationship}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center mt-16">
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 text-lg"
              >
                <span className="relative z-10">Get Started</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 bg-white text-gray-600 text-center border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6 text-sm">
            {/* <a href="#" className="hover:text-pink-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-pink-600 transition-colors">Terms</a> */}
            <Link href='/Contacts' className='hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-400 hover:bg-clip-text hover:text-transparent transition-colors'>Contact</Link>
            {/* <a href="#" className="hover:text-pink-600 transition-colors">Contact</a> */}
            <span>&copy; 2025 GiftSpark Co.</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalMode === 'login' ? 'Log In to GiftSpark' : 'Create Your Account'}
      >
        <AuthForms 
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
        />
      </Modal>
    </div>
  );
}