"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Sparkles
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
    "your partner": Array.from({length: 5}, (_, i) => `/GS_images/partner/partner${i + 1}.png`),
    "your coworker": Array.from({length: 5}, (_, i) => `/GS_images/coworker/coworker${i + 1}.png`),
    "your grandma": Array.from({length: 5}, (_, i) => `/GS_images/Grandma/Grandma${i + 1}.png`),
    "your roommate": Array.from({length: 5}, (_, i) => `/GS_images/roommate/roomate${i + 1}.png`)
  };

  // Add Amazon affiliate links mapping
  const amazonLinks: Record<Relation, string[]> = {
    "your mom": [
      "https://amzn.to/3GtsksE",
      "https://amzn.to/42ZIdzH",
      "https://amzn.to/3RCAnWs",
      "https://amzn.to/3YNWltk",
      "https://amzn.to/4cTZVYX"
    ],
    "your partner": [
      "https://amzn.to/4jWCjoN",
      "https://amzn.to/42Q477h",
      "https://amzn.to/4lQnnKC",
      "https://amzn.to/44ce5SJ",
      "https://amzn.to/3SdfaCo"
    ],
    "your coworker": [
      "https://amzn.to/3EtLwpA",
      "https://amzn.to/3RBGMBa",
      "https://amzn.to/3GnNacH",
      "https://amzn.to/42XVnfA",
      "https://amzn.to/3YSVpDZ"
    ],
    "your grandma": [
      "https://amzn.to/4iEjHZJ",
      "https://amzn.to/4lLX9Zw",
      "https://amzn.to/4jnXMHf",
      "https://amzn.to/42yQ7Qx",
      "https://amzn.to/44evJFC"
    ],
    "your roommate": [
      "https://amzn.to/44I9d7Z",
      "https://amzn.to/42vaZbi",
      "https://amzn.to/42MudrJ",
      "https://amzn.to/44PQN5g",
      "https://amzn.to/3YT2XXp"
    ]
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

  // Add refs for scroll animations
  const howItWorksRef = useRef<HTMLDivElement>(null);

  // Add effect to check for password reset success
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  useEffect(() => {
    const resetSuccess = sessionStorage.getItem('passwordResetSuccess');
    if (resetSuccess === 'true') {
      setShowResetSuccess(true);
      sessionStorage.removeItem('passwordResetSuccess');
      
      // Auto-hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setShowResetSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

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
            className='bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-2 px-4 rounded-full border border-transparent transition-all duration-300 shadow-[0_0_12px_rgba(236,72,153,0.4)] hover:shadow-[0_0_18px_rgba(236,72,153,0.5)]'
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
        <section className="flex flex-col items-center text-center py-4 md:py-16 px-4 relative">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-1 leading-tight">
              <span className="block animate-fade-in">
                Find the perfect gift for
              </span>
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent inline-block min-w-40 text-left pb-[2px] [text-shadow:0_0_8px_rgba(236,72,153,0.4)] animate-fade-in delay-200">
                {textOptions[textIndex]}
              </span>
            </h1>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <Link href="/guest">
              <button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-3 px-8 rounded-full font-semibold shadow-[0_0_12px_rgba(236,72,153,0.4)] hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] transition-[background,shadow,transform] duration-300 ease-out scale-100 hover:scale-105 active:scale-95 text-lg flex items-center animate-fade-in delay-400">
                Generate now
                <ArrowRight size={20} className="ml-2" />
              </button>
            </Link>
          </div>
        </section>

        {/* Pinterest-style grid with consistent sizing and animations */}
        <div className="w-full px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {pinStates.map((pin, i) => (
              <a
                key={i}
                href={amazonLinks[textOptions[textIndex]][i]}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100 cursor-pointer group relative"
                style={{
                  opacity: pin.opacity,
                  transform: pin.transform,
                  transition: 'all 1s ease-in-out',
                  height: '320px',
                  display: pin.active ? 'block' : 'block',
                }}
              >
                <div className="w-full h-full relative">
                  <Image 
                    src={relationImages[textOptions[textIndex]][i]}
                    alt={`Gift idea ${i + 1} for ${textOptions[textIndex]}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-medium text-lg">
                      View on Amazon
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Descriptive Section */}
        <section ref={howItWorksRef} id="how-it-works" className="bg-white py-20 px-4 overflow-hidden mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h4 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-6 pb-[2px] [text-shadow:0_0_8px_rgba(236,72,153,0.4)] animate-fade-in">
                  It&apos;s the thought that counts!
                </h4>
                <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
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
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in {
                opacity: 0;
                animation: fadeIn 1s ease-out forwards;
              }
              .delay-200 {
                animation-delay: 200ms;
              }
              .delay-400 {
                animation-delay: 400ms;
              }
              .delay-600 {
                animation-delay: 600ms;
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
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-100"
                  >
                    <ChevronLeft className="w-8 h-8 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-100"
                  >
                    <ChevronRight className="w-8 h-8 text-gray-700" />
                  </button>
                  
                  <div 
                    className="flex space-x-6 scroll-container py-4"
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
                        className="flex-shrink-0 w-1/3 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 backdrop-blur-sm relative"
                      >
                        <Link 
                          href={`/guest?prompt=${encodeURIComponent(example.prompt)}`}
                          className="absolute top-4 right-4 flex items-center gap-1 text-xs bg-gradient-to-r from-pink-500 to-orange-400 text-white px-2.5 py-1.5 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 z-10"
                        >
                          <Sparkles size={12} className="opacity-90" />
                          Try it out
                        </Link>
                        <div className="relative">
                          <div className="text-pink-300/30 text-7xl font-serif absolute -top-6 -left-4">&ldquo;</div>
                          <p className="text-gray-700 text-lg leading-relaxed pl-4 pt-2 pr-4">
                            {example.prompt}
                          </p>
                          <div className="mt-6 text-right">
                            <span className="text-pink-500 font-medium tracking-wide">- {example.relationship}</span>
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
                        className="flex-shrink-0 w-1/3 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 backdrop-blur-sm relative"
                      >
                        <Link 
                          href={`/guest?prompt=${encodeURIComponent(example.prompt)}`}
                          className="absolute top-4 right-4 flex items-center gap-1 text-xs bg-gradient-to-r from-pink-500 to-orange-400 text-white px-2.5 py-1.5 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 z-10"
                        >
                          <Sparkles size={12} className="opacity-90" />
                          Try it out
                        </Link>
                        <div className="relative">
                          <div className="text-pink-300/30 text-7xl font-serif absolute -top-6 -left-4">&ldquo;</div>
                          <p className="text-gray-700 text-lg leading-relaxed pl-4 pt-2 pr-4">
                            {example.prompt}
                          </p>
                          <div className="mt-6 text-right">
                            <span className="text-pink-500 font-medium tracking-wide">- {example.relationship}</span>
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
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-3 px-8 rounded-full font-semibold shadow-[0_0_12px_rgba(236,72,153,0.4)] hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] transition-[background,shadow,transform] duration-300 ease-out scale-100 hover:scale-105 active:scale-95 text-lg"
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

      {/* Success Modal */}

      {showResetSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-400 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 duration-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Password successfully reset!</span>
          </div>
        </div>
      )}
    </div>
  );
}