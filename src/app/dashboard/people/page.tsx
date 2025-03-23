"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from '@/app/components/Modal';
import ProfileModal from '@/app/components/ProfileModal';
import Image from 'next/image';

// Icons
import { 
  Menu, X, Home, Gift, User, Settings, LogOut, 
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  imageUrl: string | null;
  details: string;
}

export default function PeoplePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfiles();
    }
  }, [isLoggedIn]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(Array.isArray(data) ? data : []);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleProfileSuccess = (newProfile: Profile) => {
    setProfiles([...profiles, newProfile]);
  };

  const navigateToProfileDetails = (profileId: string) => {
    router.push(`/dashboard/people/${profileId}`);
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
            
            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors">
              <Gift size={20} className="text-gray-500 group-hover:text-cyan-600" />
              {sidebarOpen && <span className="ml-3">My Gift Ideas</span>}
            </Link>
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 bg-cyan-50 text-cyan-600 rounded-md group transition-colors">
              <User size={20} className="text-cyan-600" />
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
            onClick={handleLogout}
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
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          {/* Page Title */}
          <h1 className="text-xl font-semibold text-gray-800">People</h1>
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">People to Shop For</h2>
              <p className="text-gray-500 mt-1">Add and manage profiles of people you want to buy gifts for</p>
            </div>
            
            {/* Profiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Add Profile Card */}
              <div 
                onClick={() => setProfileModalOpen(true)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-64 flex flex-col items-center justify-center group border-2 border-dashed border-cyan-200 hover:border-cyan-400"
              >
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-100 to-cyan-200 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-cyan-300 transition-colors duration-300">
                  <Plus size={36} className="text-cyan-600" />
                </div>
                <p className="mt-4 font-medium text-cyan-600">Add someone to shop for</p>
              </div>

              {/* Profile Cards */}
              {Array.isArray(profiles) && profiles.map((profile) => (
                <div 
                  key={profile.id}
                  onClick={() => navigateToProfileDetails(profile.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-64 flex flex-col items-center justify-center p-6 hover:bg-cyan-50"
                >
                  <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {profile.imageUrl ? (
                      <Image
                        src={profile.imageUrl}
                        alt={profile.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-semibold text-cyan-600">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-800">{profile.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center line-clamp-2">
                    {profile.details || "No details added yet"}
                  </p>
                  <div className="mt-4 px-4 py-2 bg-cyan-100 text-cyan-600 rounded-full text-xs font-medium">
                    View details
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccess={handleProfileSuccess}
      />
    </div>
  );
}