"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Modal from "./components/Modal"
import AuthForms from './components/auth-forms';
import { usePathname } from "next/navigation";

import { 
  ArrowRight
} from 'lucide-react';

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
  
  // State for device toggle
  const [deviceView, setDeviceView] = useState<'mobile' | 'web'>('web');

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

  // Toggle device view
  const toggleDeviceView = (view: 'mobile' | 'web') => {
    setDeviceView(view);
  };
  

  // If still loading or user is logged in, show nothing (or a loading spinner)
  if (isLoading || isLoggedIn) {
    return null; // Or return a loading spinner
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
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
        <section className="flex flex-col items-center text-center py-4 md:py-16 px-4 relative">
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
              className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg flex items-center"
            >
              Generate now
              <ArrowRight size={20} className="ml-2" />
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

        {/* Descriptive Section with Just Steps - Now with Consistent Cyan Background */}
        <section id="how-it-works" className="bg-white py-20 px-4 overflow-hidden mt-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-5xl font-bold font-bold text-cyan-600 mb-6">
                It's the thought that counts!
              </h2>
              <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed">
                With{" "}
                <span className="text-cyan-600 relative inline-block">
                  <span className="relative z-10">smart and personalized AI suggestions</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500/30 via-cyan-500 to-cyan-500/30" 
                        style={{
                          backgroundSize: "200% 100%",
                          animation: "moveGradient 2s linear infinite"
                        }}></span>
                </span>{" "}
                for anyone in your life, let us help you with the thinking so you can focus on what matters.
              </p>
            </div>
          </div>

          <style jsx>{`
            @keyframes moveGradient {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
          `}</style>
            
            {/* Device Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-white p-1 rounded-full shadow-md inline-flex">
                <button 
                  className={`device-toggle-btn py-2 px-6 rounded-full flex items-center gap-2 ${deviceView === 'web' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                  onClick={() => toggleDeviceView('web')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0015 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                  Web
                </button>
                <button 
                  className={`device-toggle-btn py-2 px-6 rounded-full flex items-center gap-2 ${deviceView === 'mobile' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                  onClick={() => toggleDeviceView('mobile')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  Mobile
                </button>
              </div>
            </div>
            
            {/* Mobile View */}
            {deviceView === 'mobile' && (
              <div className="space-y-16">
                {/* Step 1 - Image on Right */}
                <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                  <div className="w-full md:w-1/2">
                    <div className="text-center md:text-left px-4">
                      <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">1</div>
                      <h3 className="font-bold text-3xl text-gray-800 mb-4">Select or Create Profiles</h3>
                      <p className="text-gray-600 text-lg">Tell us a little about them so we can curate the perfect gift recommendations from recent trends!</p>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                      <div className="text-gray-400">Profile creation animation -mobile</div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 - Image on Left */}
                <div className="flex flex-col md:flex-row-reverse items-center md:items-center gap-8">
                  <div className="w-full md:w-1/2">
                    <div className="text-center md:text-left px-4">
                      <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">2</div>
                      <h3 className="font-bold text-3xl text-gray-800 mb-4">Scroll and Enjoy</h3>
                      <p className="text-gray-600 text-lg">Pick a cateogory and browse personalized gift recommendations tailored to their tastes and preferences.</p>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                      <div className="text-gray-400">Gift suggestion animation -mobile</div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 - Image on Right */}
                <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                  <div className="w-full md:w-1/2">
                    <div className="text-center md:text-left px-4">
                      <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">3</div>
                      <h3 className="font-bold text-3xl text-gray-800 mb-4">Interact and Refine!</h3>
                      <p className="text-gray-600 text-lg">Swipe right if you like a gift and left if you don't so that we can generate recommendations you like!</p>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                      <div className="text-gray-400">animation -mobile</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Web View*/}
            {deviceView === 'web' && (
              <div className="space-y-16">
              {/* Step 1 - Image on Right */}
              <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                <div className="w-full md:w-1/2">
                  <div className="text-center md:text-left px-4">
                    <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">1</div>
                    <h3 className="font-bold text-3xl text-gray-800 mb-4">Select or Create Profiles</h3>
                    <p className="text-gray-600 text-lg">Tell us a little about them so we can curate the perfect gift recommendations from recent trends!</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                    <div className="text-gray-400">Profile creation animation -web</div>
                  </div>
                </div>
              </div>
              
              {/* Step 2 - Image on Left */}
              <div className="flex flex-col md:flex-row-reverse items-center md:items-center gap-8">
                <div className="w-full md:w-1/2">
                  <div className="text-center md:text-left px-4">
                    <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">2</div>
                    <h3 className="font-bold text-3xl text-gray-800 mb-4">Scroll and Enjoy</h3>
                    <p className="text-gray-600 text-lg">Pick a cateogory and browse personalized gift recommendations tailored to their tastes and preferences.</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                    <div className="text-gray-400">Gift suggestion animation -web</div>
                  </div>
                </div>
              </div>
              
              {/* Step 3 - Image on Right */}
              <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                <div className="w-full md:w-1/2">
                  <div className="text-center md:text-left px-4">
                    <div className="bg-cyan-100 text-cyan-800 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl mx-auto md:mx-0 mb-4">3</div>
                    <h3 className="font-bold text-3xl text-gray-800 mb-4">Interact and Refine!</h3>
                    <p className="text-gray-600 text-lg">Swipe right if you like a gift and left if you don't so that we can generate recommendations you like!</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="rounded-lg overflow-hidden bg-white shadow-lg h-64 flex items-center justify-center">
                    <div className="text-gray-400">animation -web</div>
                  </div>
                </div>
              </div>
            </div>
          )}
            
            {/* CTA Button */}
            <div className="flex justify-center mt-16">
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
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