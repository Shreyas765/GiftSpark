"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Modal from "./components/Modal"
import AuthForms from './components/auth-forms';
import { usePathname } from "next/navigation";

// Define the type for pin animation states
type PinState = {
  opacity: number;
  transform: string;
  active: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  // Rotating text options for "Let us do the thinking for..."
  const [textIndex, setTextIndex] = useState(0);
  const textOptions = ["your bestie", "your child", "your mom", "your wife", "your coworker"];

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
          prevStates.map(pin => ({
            opacity: 0,
            transform: 'translateY(-20px)',
            active: true
          }))
        );
        
        // After a short delay, animate new pins in
        setTimeout(() => {
          setPinStates(prevStates => 
            prevStates.map(pin => ({
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

  // If still loading or user is logged in, show nothing (or a loading spinner)
  if (isLoading || isLoggedIn) {
    return null; // Or return a loading spinner
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
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
          <button 
            onClick={() => openAuthModal('login')}
            className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full border border-cyan-500 transition-all duration-300 shadow-sm hover:shadow'
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
      <main className='flex flex-col flex-1'>
        {/* Hero Section with Pinterest-style layout */}
        <section className="flex flex-col items-center text-center py-4 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Find the perfect gift for
              <br />
              <span className="text-cyan-600 inline-block min-w-40 text-left">
                {textOptions[textIndex]}
              </span>
            </h1>
          </div>
        </section>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link href="/guest">
          <button 
            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
          >
            Get Started
          </button>
          </Link>
        </div>

        {/* Pinterest-style grid with consistent sizing and animations */}
        <div className="w-full px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {/* Grid of exactly 5 "pins" with consistent size */}
            {pinStates.map((pin, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{
                  opacity: pin.opacity,
                  transform: pin.transform,
                  transition: 'all 1s ease-in-out',
                  height: '300px', // Fixed height for all pins
                  display: pin.active ? 'block' : 'block',
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <span className="text-lg font-medium text-cyan-800">Gift Idea {i + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Descriptive Section */}
        <section className="flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto px-4 py-16 gap-12 rounded-lg">
          {/* Image on the Left */}
          <div className="w-full md:w-1/2">
            <img
              src="/landing_images/aboutPicture.png" // Replace with your actual image path
              alt="GiftSpark in action"
              className="rounded-lg shadow-lg object-cover w-full h-auto"
            />
          </div>

          {/* Text on the Right */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What is GiftSpark?
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              GiftSpark makes gift-giving easy with smart, personalized suggestions for anyone in your life. Save time and find the perfect gift, stress-free!
            </p>
            <p className="text-gray-600 text-lg">
              Powered by intelligent recommendations and curated ideas, GiftSpark takes the guesswork out of shopping. Start your journey now and find gifts that truly spark joy!
            </p>

            <div className="mt-6">
              <button 
                onClick={() => openAuthModal('signup')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
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