"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from '@/app/components/Modal';
import ProfileModal from '@/app/components/ProfileModal';
import UserAvatar from '../../components/UserAvatar';

// Icons
import { 
  Menu, X, Home, Gift, User, Settings, LogOut, 
  ChevronLeft, ChevronRight, Plus, Sparkles
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
}

export default function GiftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

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
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-cyan-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
              <span className="text-cyan-600">Gift</span>Spark
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors">
              <Home size={20} className="text-gray-500 group-hover:text-cyan-600" />
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 bg-cyan-50 text-cyan-600 rounded-md group transition-colors">
              <Gift size={20} className="text-cyan-600" />
              {sidebarOpen && <span className="ml-3">My Gift Ideas</span>}
            </Link>
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors">
              <User size={20} className="text-gray-500 group-hover:text-cyan-600" />
              {sidebarOpen && <span className="ml-3">People</span>}
            </Link>
          </nav>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors">
            <Settings size={20} className="text-gray-500 group-hover:text-cyan-600" />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </Link>
          
          <button 
            onClick={async () => {
              await signOut({ redirect: true, callbackUrl: '/' });
            }}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors"
          >
            <LogOut size={20} className="text-gray-500 group-hover:text-cyan-600" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Page Title */}
            <h1 className="text-xl font-semibold text-gray-800">My Gift Ideas</h1>
          </div>

          {/* User Avatar */}
          <UserAvatar />
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Previous Gifts</h2>
              <p className="text-gray-500 mt-1">View and manage your gift ideas for each person</p>
            </div>

            {/* Profiles Section */}
            <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-all duration-200 ${
                    selectedProfile?.id === profile.id 
                      ? 'bg-cyan-50 ring-2 ring-cyan-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-r from-cyan-100 to-cyan-200 flex items-center justify-center">
                    {profile.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-cyan-600">
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
                className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-400 text-white hover:from-cyan-600 hover:to-teal-500 transition duration-300 shadow-md"
              >
                <Plus size={24} />
              </button>
            </div>

            {/* Gift Ideas Section */}
            {selectedProfile ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Gift bought for {selectedProfile.name}</h3>
                  <div className="flex items-center gap-2 text-cyan-600">
                    <Sparkles size={20} />
                    <span className="text-sm font-medium">AI Generated</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Placeholder for gift ideas */}
                  <div className="text-gray-500 text-center py-8">
                    <p>No gift ideas generated yet. Go to the dashboard to generate ideas based on their profile!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-gray-500">
                  <p>Select a profile or create a new one to view gift ideas</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onAddProfile={handleAddProfile}
      />
    </div>
  );
}