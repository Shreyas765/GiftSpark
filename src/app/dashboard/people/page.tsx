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
  ChevronLeft, ChevronRight, Plus, StickyNote, Trash2
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
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

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      setProfiles(prevProfiles => {
        const updatedProfiles = prevProfiles.filter(profile => profile.id !== profileId);
        // Save to localStorage immediately
        if (isLoggedIn && session?.user?.email) {
          const userProfilesKey = `userProfiles_${session.user.email}`;
          localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
        }
        return updatedProfiles;
      });
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
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
          {/* <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-md group transition-colors">
            <Settings size={20} className="text-gray-500 group-hover:text-cyan-600" />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </Link> */}
          
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
            <h1 className="text-xl font-semibold text-gray-800">People</h1>
          </div>

          {/* User Avatar */}
          <UserAvatar />
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Created Profiles</h2>
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
                <p className="mt-4 font-medium text-cyan-600">Add a new profile</p>
              </div>

              {/* Profile Cards */}
              {profiles.map((profile) => (
                <div 
                  key={profile.id}
                  onClick={() => navigateToProfileDetails(profile.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-64 flex flex-col p-6 hover:bg-cyan-50 relative group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-gradient-to-r from-cyan-100 to-cyan-200 flex items-center justify-center ring-2 ring-cyan-200">
                      {profile.imageUrl ? (
                        <div className="w-full h-full">
                          <img 
                            src={profile.imageUrl} 
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl font-semibold text-cyan-600">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{profile.name}</h3>
                      <div className="flex items-center gap-2">
                        <StickyNote size={16} className="text-cyan-600 shrink-0" />
                        <button
                          onClick={(e) => handleDeleteProfile(e, profile.id)}
                          className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors shrink-0"
                          title="Delete profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 flex-grow line-clamp-4">
                    {profile.details || "No details added yet"}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Created {new Date(profile.createdAt).toLocaleDateString()}
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
        onAddProfile={handleAddProfile}
      />
    </div>
  );
}