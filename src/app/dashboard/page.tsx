"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthForms from '../components/auth-forms';
import Modal from '../components/Modal';
import ProfileModal from '../components/ProfileModal';
import Image from 'next/image';
import UserAvatar from '../components/UserAvatar';
import GiftCarousel from '../components/GiftCarousel';

// Icons
import { 
  Menu, X, Home, Gift, User, Settings, LogOut, 
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
}

export default function GiftPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Input state
  const [inputValue, setInputValue] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Debuggin here check if session works
  useEffect(() => {
    if (session?.user) {
      console.log('Session user data:', session.user);
    }
  }, [session]);

  // Load profiles from localStorage on component mount
  useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      const savedProfiles = localStorage.getItem(userProfilesKey);
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }
    }
  }, [isLoggedIn, session?.user?.email]);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (isLoggedIn && session?.user?.email && profiles.length > 0) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      localStorage.setItem(userProfilesKey, JSON.stringify(profiles));
    }
  }, [profiles, isLoggedIn, session?.user?.email]);

  const handleAddProfile = (newProfile: Profile) => {
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles, newProfile];
      // Save to localStorage immediately
      if (isLoggedIn && session?.user?.email) {
        const userProfilesKey = `userProfiles_${session.user.email}`;
        localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
      }
      return updatedProfiles;
    });
  };

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setInputValue(profile.details);
    setShowRecommendations(false);
  };

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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-pink-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-10
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        bg-white border-r border-gray-200
        ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} 
        flex flex-col
      `}>
        {/* Sidebar Header */}
       <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/" className={`flex items-center ${!sidebarOpen && 'lg:hidden'}`}>
            <div className="text-gray-800 font-bold text-xl flex items-center">
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Gift</span>Spark
              <span className="ml-1 text-yellow-400 text-2xl">✨</span>
            </div>
          </Link>
          
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100 hidden lg:block"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {/* Navigation Links */}
            <Link href="/dashboard" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <Home size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
            </Link>
            
            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <Gift size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">My Gift Ideas</span>}
            </Link>
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <User size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">People</span>}
            </Link>
          </nav>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={async () => {
              await signOut({ redirect: true, callbackUrl: '/' });
            }}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-md group transition-colors"
          >
            <LogOut size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg">
          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Page Title */}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Dashboard</h1>
          </div>

          {/* User Avatar */}
          <UserAvatar />
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <section className="max-w-7xl mx-auto w-full pb-20">
            
            {/* Profiles Section */}
            <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4 px-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className={`flex flex-col items-center space-y-3 p-3 rounded-2xl transition-all duration-300 ${
                    selectedProfile?.id === profile.id 
                      ? 'bg-white shadow-lg ring-2 ring-pink-500/50' 
                      : 'hover:bg-white/50 hover:shadow-md'
                  }`}
                >
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-orange-300 flex items-center justify-center shadow-inner">
                    {profile.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile.name}</span>
                </button>
              ))}

              {/* Add Profile Button */}
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="h-20 w-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white hover:from-pink-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={28} />
              </button>
            </div>

            {/* The Text Box Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-gray-200/50">
              <div className="bg-gradient-to-br from-pink-500 to-orange-400 p-8">
                <p className="text-2xl font-bold text-white mb-3">
                  {selectedProfile 
                    ? `Gift ideas for ${selectedProfile.name}`
                    : "What are their hobbies/interests/age..."}
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
                    if (!selectedProfile) {
                      setSelectedProfile({
                        id: 'temp',
                        name: 'Custom Search',
                        details: inputValue,
                        createdAt: new Date().toISOString()
                      });
                    }
                    setShowRecommendations(true);
                  }}
                >
                  Generate Gift Ideas
                </button>
              </div>
            </div>

            {/* Gift Recommendations Section */}
            {selectedProfile && inputValue && showRecommendations && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-6 max-w-2xl mx-auto">
                  {selectedProfile.id === 'temp' 
                    ? 'Gift Recommendations' 
                    : `Gift Recommendations for ${selectedProfile.name}`}
                </h2>
                <div className="overflow-visible -mx-6">
                  <GiftCarousel description={inputValue} />
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onAddProfile={handleAddProfile}
      />
    </div>
  );
}