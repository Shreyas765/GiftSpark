"use client";

// This is the main branch
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import AuthForms from './components/auth-forms';
import Modal from "./components/Modal" // modal for business branch needed
import { usePathname } from "next/navigation";

import { 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Building2,
  Users,
  Gift
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
  
  // State for carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // carousel navigation functions. 
  // change numbers if you add more products
  const totalSlides = 5;
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

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

  //  image mapping for each relation
  const relationImages: Record<Relation, string[]> = {
    "your mom": Array.from({length: 5}, (_, i) => `/GS_images/mom/mom${i + 1}.png`),
    "your partner": Array.from({length: 5}, (_, i) => `/GS_images/partner/partner${i + 1}.png`),
    "your coworker": Array.from({length: 5}, (_, i) => `/GS_images/coworker/coworker${i + 1}.png`),
    "your grandma": Array.from({length: 5}, (_, i) => `/GS_images/Grandma/Grandma${i + 1}.png`),
    "your roommate": Array.from({length: 5}, (_, i) => `/GS_images/roommate/roomate${i + 1}.png`)
  };

  // Amazon affiliate links mapping
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

  // Add ref for gifts section
  const giftsSectionRef = useRef<HTMLDivElement>(null);

  // State to control the arrow's visibility
  const [showArrow, setShowArrow] = useState(true);

  // Function to scroll to gifts section and hide arrow
  const scrollToGifts = () => {
    giftsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowArrow(false);
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Hide arrow when scrolled down more than 200px
      if (window.scrollY > 200) {
        setShowArrow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If still loading or user is logged in, show nothing (or a loading spinner)
  if (isLoading || isLoggedIn) {
    return null; // Or return a loading spinner
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Streamline Your Employee Gifting
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Manage employee birthdays, anniversaries, and special occasions all in one place
            </p>
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-white text-pink-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose GiftSpark for Your Business?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Building2 className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business-Focused</h3>
              <p className="text-gray-600">Designed specifically for HR teams to manage employee gifting at scale.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
              <p className="text-gray-600">Easily manage employee information, birthdays, and special occasions.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Gift className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Automated Gifting</h3>
              <p className="text-gray-600">Set up automated gift deliveries for employee milestones and celebrations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Employee Experience?</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-orange-500 transition-colors"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="border-2 border-pink-500 text-pink-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalMode === 'login' ? 'Log in to Your Business Account' : 'Create Your Business Account'}
      >
        <AuthForms
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
        />
      </Modal>
    </div>
  );
}