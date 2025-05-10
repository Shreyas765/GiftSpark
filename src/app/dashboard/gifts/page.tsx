"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import UserAvatar from '../../components/UserAvatar';
import Calendar from '@/app/components/Calendar';

// Icons
import {
  Menu, X, Home, Gift, User, LogOut, ChevronLeft, ChevronRight, Heart
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
  birthday?: string;
}

interface GiftIdea {
  id: string;
  title: string;
  description: string;
  price?: string;
  link?: string;
  createdAt: string;
  isLiked: boolean;
}

interface ProfileGifts {
  profileId: string;
  gifts: GiftIdea[];
}

export default function GiftsPage() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile and gift states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [likedGifts, setLikedGifts] = useState<ProfileGifts[]>([]);

  // Load profiles from localStorage on component mount
  useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      const savedProfiles = localStorage.getItem(userProfilesKey);
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }

      // Load liked gifts
      const userLikedGiftsKey = `userLikedGifts_${session.user.email}`;
      const savedLikedGifts = localStorage.getItem(userLikedGiftsKey);
      if (savedLikedGifts) {
        setLikedGifts(JSON.parse(savedLikedGifts));
      }
    }
  }, [isLoggedIn, session?.user?.email]);

  // Save liked gifts to localStorage whenever they change
  useEffect(() => {
    if (isLoggedIn && session?.user?.email && likedGifts.length > 0) {
      const userLikedGiftsKey = `userLikedGifts_${session.user.email}`;
      localStorage.setItem(userLikedGiftsKey, JSON.stringify(likedGifts));
    }
  }, [likedGifts, isLoggedIn, session?.user?.email]);

  // const handleToggleLike = (profileId: string, giftId: string) => {
  //   setLikedGifts(prevLikedGifts => {
  //     const profileGifts = prevLikedGifts.find(pg => pg.profileId === profileId);
      
  //     if (profileGifts) {
  //       // Profile exists, update gift
  //       const giftIndex = profileGifts.gifts.findIndex(g => g.id === giftId);
  //       if (giftIndex !== -1) {
  //         // Gift exists, toggle like
  //         const updatedGifts = [...profileGifts.gifts];
  //         updatedGifts[giftIndex] = {
  //           ...updatedGifts[giftIndex],
  //           isLiked: !updatedGifts[giftIndex].isLiked
  //         };
          
  //         return prevLikedGifts.map(pg =>
  //           pg.profileId === profileId
  //             ? { ...pg, gifts: updatedGifts }
  //             : pg
  //         );
  //       } else {
  //         // Gift doesn't exist, do nothing for now
  //         return prevLikedGifts;
  //       }
  //     } else {
  //       // Profile doesn't exist, do nothing for now
  //       return prevLikedGifts;
  //     }
  //   });
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-pink-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-orange-50">
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <Home size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <Gift size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3">My Gift Ideas</span>}
            </Link>
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <User size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">People</span>}
            </Link>
          </nav>

          {/* Calendar Section */}
          {sidebarOpen && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Calendar profiles={profiles} />
            </div>
          )}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          {/* <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
            <Settings size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </Link> */}
          
          <button 
            onClick={async () => {
              await signOut({ redirect: true, callbackUrl: '/' });
            }}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors"
          >
            <LogOut size={20} className="text-gray-500 group-hover:text-pink-600" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white sticky top-0 z-50">
          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Page Title */}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">My Gift Ideas</h1>
          </div>

          {/* User Avatar */}
          <UserAvatar />
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <p className="text-gray-500 mt-1">View and manage your liked gift ideas across all profiles</p>
            </div>

            {/* Liked Gifts Grid */}
            {likedGifts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedGifts.flatMap(profileGifts => 
                  profileGifts.gifts
                    .filter(gift => gift.isLiked)
                    .map(gift => {
                      const profile = profiles.find(p => p.id === profileGifts.profileId);
                      return (
                        <div key={gift.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              {/* Profile Avatar */}
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-orange-100 flex items-center justify-center ring-2 ring-pink-200">
                                {profile?.imageUrl ? (
                                  <Image 
                                    src={profile.imageUrl} 
                                    alt={profile.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-pink-600">
                                    {profile?.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                For {profile?.name}
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{gift.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gift.description}</p>
                            
                            <div className="flex items-center justify-between">
                              {gift.price && (
                                <span className="text-pink-600 font-medium">{gift.price}</span>
                              )}
                              {gift.link && (
                                <a 
                                  href={gift.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                                >
                                  View Item →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Heart size={48} className="mx-auto text-pink-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved gifts yet</h3>
                  <p className="text-gray-500">
                    When you find gift ideas you like, click the heart icon to save them here for later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}