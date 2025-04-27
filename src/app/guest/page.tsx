"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForms from '../components/auth-forms';
import Modal from '../components/Modal';
import GiftCarousel from '../components/GiftCarousel';

// Icons
import { 
  Menu, X, Home, Gift, User,
  ChevronLeft, ChevronRight,
  LogIn, Sparkles
} from 'lucide-react';

// Create a separate component for the content that uses useSearchParams
function GiftPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Input state
  const [inputValue, setInputValue] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // State for modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  const [protectedNavigation, setProtectedNavigation] = useState<string | null>(null);

  // Effect to handle pre-filled prompt from URL
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      setInputValue(prompt);
      setShowRecommendations(true);
    }
  }, [searchParams]);

  // Handle protected navigation
  const handleProtectedNavigation = (path: string) => {
    if (!isLoggedIn) {
      setProtectedNavigation(path);
      openAuthModal('login');
    } else {
      router.push(path);
    }
  };

  // Handle auth success
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (protectedNavigation) {
      router.push(protectedNavigation);
      setProtectedNavigation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Handle opening the auth modal
  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Sidebar */}
    <div className={`
      fixed inset-y-0 left-0 z-10
      transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      bg-white/80 backdrop-blur-lg border-r border-gray-200/50
      ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
      flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50 bg-white/50">
        <Link href="/" className={`flex items-center ${!sidebarOpen && 'lg:hidden'}`}>
          <div className="text-gray-800 font-bold text-xl flex items-center">
            <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Gift</span>Spark
            <span>✨</span>
          </div>
        </Link>
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-xl hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-xl hover:bg-gray-100 hidden lg:block"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={`px-2 space-y-2 ${!sidebarOpen && 'lg:flex lg:flex-col lg:items-center'}`}>
          {/* Navigation Links */}
          <button
            onClick={() => handleProtectedNavigation('/dashboard')}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl group transition-all duration-200 ${!sidebarOpen ? 'lg:justify-center lg:w-12 lg:p-3' : 'w-full'}`}
          >
            <Home size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
          </button>
          <button
            onClick={() => handleProtectedNavigation('/dashboard/gifts')}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl group transition-all duration-200 ${!sidebarOpen ? 'lg:justify-center lg:w-12 lg:p-3' : 'w-full'}`}
          >
            <Gift size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3 font-medium">My Gift Ideas</span>}
          </button>
          <button
            onClick={() => handleProtectedNavigation('/dashboard/people')}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl group transition-all duration-200 ${!sidebarOpen ? 'lg:justify-center lg:w-12 lg:p-3' : 'w-full'}`}
          >
            <User size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3 font-medium">People</span>}
          </button>
        </nav>
      </div>
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200/50 bg-white/50">
        <button
          onClick={() => openAuthModal('login')}
          className={`flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl group transition-all duration-200 ${!sidebarOpen ? 'lg:justify-center lg:w-12 lg:p-3 lg:mx-auto' : 'w-full'}`}
        >
          <LogIn size={20} className="text-gray-500 group-hover:text-pink-600" />
          {sidebarOpen && <span className="ml-3 font-medium">Login</span>}
        </button>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        {/* Mobile menu button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          {/* Page Title */}
          <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Quick Gen Mode</h1>
        </div>
      </header>
              
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <section className="max-w-7xl mx-auto w-full pb-20">
          
          {/* Login CTA Section */}
          <div className="flex flex-col items-center mb-8">
            <button 
              onClick={() => openAuthModal('login')}
              className="h-20 w-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white hover:from-pink-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles size={32} />
            </button>
            <p className="text-sm font-medium text-gray-600 mt-3">
              Login to save profiles!
            </p>
          </div>

          {/* The Text Box Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-gray-200/50">
            <div className="bg-gradient-to-br from-pink-500 to-orange-400 p-8">
              <p className="text-2xl font-bold text-white mb-3">
                What are their hobbies/interests/age...
              </p>
              <p className="text-pink-50 text-sm mb-0 font-medium">
                The more details you provide, the better our suggestions will be!
              </p>
            </div>

            <div className="p-8">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. Likes hiking, reading, 25 years old, collects vinyl records, loves dogs..."
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-gray-800 shadow-inner bg-white/80 backdrop-blur-sm"
                rows={4}
              ></textarea>

              <button 
                className="mt-6 w-full bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-4 px-6 rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => {
                  if (!inputValue.trim()) {
                    alert('Please enter some details about the person');
                    return;
                  }
                  setShowRecommendations(true);
                }}
              >
                Generate Gift Ideas
              </button>
            </div>
          </div>

          {/* Gift Recommendations Section */}
          {showRecommendations && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-6 max-w-2xl mx-auto">
                Gift Recommendations
              </h2>
              <div className="w-full">
                <GiftCarousel description={inputValue} shouldGenerate={showRecommendations} />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>

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

// Main component with Suspense boundary
export default function GiftPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <GiftPageContent />
    </Suspense>
  );
}