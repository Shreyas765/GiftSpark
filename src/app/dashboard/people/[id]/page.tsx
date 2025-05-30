"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Menu, X, Home, Gift, User, LogOut, 
  ChevronLeft, ChevronRight, ArrowLeft, Edit2, Trash2,
  Camera, Check, X as XIcon, Calendar as CalendarIcon
} from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';
import Calendar from '@/app/components/Calendar';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
  birthday?: string;
  giftsBought?: GiftBought[];
}

interface GiftBought {
  id: string;
  name: string;
  date: string;
  price?: string;
  notes?: string;
}

export default function ProfileDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [giftsBought, setGiftsBought] = useState<GiftBought[]>([]);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [editedBirthday, setEditedBirthday] = useState("");

  // Load profile and gifts from localStorage
  useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      const savedProfiles = localStorage.getItem(userProfilesKey);
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const foundProfile = profiles.find((p: Profile) => p.id === resolvedParams.id);
        if (foundProfile) {
          setProfile(foundProfile);
          setEditedName(foundProfile.name);
          setEditedDetails(foundProfile.details);
          setEditedBirthday(foundProfile.birthday || '');
          setGiftsBought(foundProfile.giftsBought || []);
        }
      }
    }
  }, [isLoggedIn, session?.user?.email, resolvedParams.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !session?.user?.email) return;

    setIsUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update profile with new image
        const userProfilesKey = `userProfiles_${(session.user as { email: string }).email}`;
        const savedProfiles = localStorage.getItem(userProfilesKey);
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          const updatedProfiles = profiles.map((p: Profile) => 
            p.id === profile.id 
              ? { ...p, imageUrl: base64String }
              : p
          );
          localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
          setProfile({ ...profile, imageUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = () => {
    if (!profile || !session?.user?.email) return;

    const userProfilesKey = `userProfiles_${session.user.email}`;
    const savedProfiles = localStorage.getItem(userProfilesKey);
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      const updatedProfiles = profiles.map((p: Profile) => 
        p.id === profile.id 
          ? { ...p, details: editedDetails }
          : p
      );
      localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
      setProfile({ ...profile, details: editedDetails });
      setIsEditing(false);
    }
  };

  const handleDeleteProfile = () => {
    if (!profile || !session?.user?.email) return;

    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      const savedProfiles = localStorage.getItem(userProfilesKey);
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const updatedProfiles = profiles.filter((p: Profile) => p.id !== profile.id);
        localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
        router.push('/dashboard/people');
      }
    }
  };

  const handleSaveName = () => {
    if (!profile || !session?.user?.email || !editedName.trim()) return;

    const userProfilesKey = `userProfiles_${session.user.email}`;
    const savedProfiles = localStorage.getItem(userProfilesKey);
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      const updatedProfiles = profiles.map((p: Profile) => 
        p.id === profile.id 
          ? { ...p, name: editedName.trim() }
          : p
      );
      localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
      setProfile({ ...profile, name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSaveBirthday = () => {
    if (!profile || !session?.user?.email) return;

    // Adjust the date to account for timezone offset
    const adjustedDate = editedBirthday ? new Date(editedBirthday + 'T12:00:00') : undefined;
    const formattedDate = adjustedDate ? adjustedDate.toISOString().split('T')[0] : undefined;

    const userProfilesKey = `userProfiles_${session.user.email}`;
    const savedProfiles = localStorage.getItem(userProfilesKey);
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      const updatedProfiles = profiles.map((p: Profile) => 
        p.id === profile.id 
          ? { ...p, birthday: formattedDate }
          : p
      );
      localStorage.setItem(userProfilesKey, JSON.stringify(updatedProfiles));
      setProfile({ ...profile, birthday: formattedDate });
      setIsEditingBirthday(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-pink-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-10
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        bg-white border-r border-gray-200
        ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} 
        flex flex-col
        lg:relative
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
            
            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <Gift size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">My Gift Ideas</span>}
            </Link>
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <User size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3">People</span>}
            </Link>

            <Link href="/dashboard/calendar" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <CalendarIcon size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">Calendar</span>}
            </Link>
          </nav>

          {/* Calendar Section */}
          {sidebarOpen && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Calendar profiles={[profile]} />
            </div>
          )}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
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
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard/people')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to People
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDeleteProfile}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={20} className="mr-2" />
              Delete Profile
            </button>
            <UserAvatar />
          </div>
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-orange-100 flex items-center justify-center ring-2 ring-pink-200">
                  {profile.imageUrl ? (
                    <Image
                      src={profile.imageUrl || '/default-avatar.png'}
                      alt={`${profile.name}'s avatar`}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-pink-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Camera size={24} className="text-white" />
                </label>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-pink-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 text-pink-600 hover:text-pink-700"
                        disabled={!editedName.trim()}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setEditedName(profile.name);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-600"
                      >
                        <XIcon size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-500">Created on {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Profile Details</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
                >
                  <Edit2 size={20} className="mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Details'}
                </button>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedDetails}
                    onChange={(e) => setEditedDetails(e.target.value)}
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    placeholder="Enter profile details..."
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.details}</p>
                </div>
              )}
            </div>

            {/* Birthday Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Birthday</h2>
                {!isEditingBirthday ? (
                  <button
                    onClick={() => setIsEditingBirthday(true)}
                    className="flex items-center px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
                  >
                    <Edit2 size={20} className="mr-2" />
                    Edit Birthday
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBirthday}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md transition-colors flex items-center"
                    >
                      <Check size={20} className="mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBirthday(false);
                        setEditedBirthday(profile.birthday || '');
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center"
                    >
                      <XIcon size={20} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {isEditingBirthday ? (
                <div className="space-y-4">
                  <input
                    type="date"
                    value={editedBirthday}
                    onChange={(e) => setEditedBirthday(e.target.value)}
                    className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-100 to-orange-100 flex items-center justify-center">
                    <span className="text-2xl">🎂</span>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {profile.birthday 
                        ? new Date(profile.birthday + 'T12:00:00').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'No birthday set'}
                    </p>
                    {profile.birthday && (
                      <p className="text-sm text-gray-500 mt-1">
                        {(() => {
                          const today = new Date();
                          const birthday = new Date(profile.birthday + 'T12:00:00');
                          const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
                          if (nextBirthday < today) {
                            nextBirthday.setFullYear(today.getFullYear() + 1);
                          }
                          const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          return `${daysUntil} days until next birthday`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gifts Bought Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Gifts Bought for <span className="text-pink-600">{profile.name}:</span></h2>
              {giftsBought.length > 0 ? (
                <div className="space-y-4">
                  {giftsBought.map((gift) => (
                    <div key={gift.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-800">{gift.name || "Untitled Gift"}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(gift.date).toLocaleDateString()}
                          {gift.price && ` • ${gift.price}`}
                        </p>
                        {gift.notes && (
                          <p className="text-sm text-gray-600 mt-1">{gift.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No gifts bought yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}