"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import UserAvatar from '@/app/components/UserAvatar';
import Calendar from '@/app/components/Calendar';

// Icons
import { 
  Menu, X, Home, Gift, User, LogOut, 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  imageUrl?: string;
  birthday?: string;
}

interface Holiday {
  name: string;
  date: Date;
  type: 'major' | 'minor';
  emoji: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper function to get nth weekday of a month
  const getNthWeekday = (year: number, month: number, weekday: number, nth: number) => {
    const firstDay = new Date(Date.UTC(year, month, 1));
    const firstWeekday = firstDay.getUTCDay();
    const offset = (7 + weekday - firstWeekday) % 7;
    const day = 1 + offset + 7 * (nth - 1);
    return new Date(Date.UTC(year, month, day));
  };

  // Easter Sunday calculation
  const getEasterSunday = (year: number) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  };

  // Floating holiday calculations
  const getMothersDay = (year: number) => getNthWeekday(year, 4, 0, 2);     // 2nd Sunday of May
  const getFathersDay = (year: number) => getNthWeekday(year, 5, 0, 3);     // 3rd Sunday of June
  const getThanksgiving = (year: number) => getNthWeekday(year, 10, 4, 4);  // 4th Thursday of November

  // Get all holidays for a given year
  const getHolidays = (year: number): Holiday[] => {
    return [
      { name: "New Year's Day", date: new Date(Date.UTC(year, 0, 1)), type: "major", emoji: "🎆" },
      { name: "Valentine's Day", date: new Date(Date.UTC(year, 1, 14)), type: "major", emoji: "❤️" },
      { name: "Easter Sunday", date: getEasterSunday(year), type: "major", emoji: "🐰" },
      { name: "Mother's Day", date: getMothersDay(year), type: "major", emoji: "👩" },
      { name: "Father's Day", date: getFathersDay(year), type: "major", emoji: "👨" },
      { name: "Independence Day", date: new Date(Date.UTC(year, 6, 4)), type: "major", emoji: "🇺🇸" },
      { name: "Halloween", date: new Date(Date.UTC(year, 9, 31)), type: "major", emoji: "🎃" },
      { name: "Thanksgiving", date: getThanksgiving(year), type: "major", emoji: "🦃" },
      { name: "Christmas", date: new Date(Date.UTC(year, 11, 25)), type: "major", emoji: "🎄" },
      { name: "New Year's Eve", date: new Date(Date.UTC(year, 11, 31)), type: "major", emoji: "🎊" }
    ];
  };

  // Helper function to check if a date has a holiday
  const hasHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return getHolidays(year).some(holiday => {
      const holidayDate = holiday.date;
      return holidayDate.getUTCMonth() === month && 
             holidayDate.getUTCDate() === day;
    });
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return getHolidays(year).filter(holiday => {
      const holidayDate = holiday.date;
      return holidayDate.getUTCMonth() === month && 
             holidayDate.getUTCDate() === day;
    });
  };

  // Load profiles from localStorage on component mount
  React.useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userProfilesKey = `userProfiles_${session.user.email}`;
      const savedProfiles = localStorage.getItem(userProfilesKey);
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }
    }
  }, [isLoggedIn, session?.user?.email]);

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if a date has a birthday
  const hasBirthday = (date: Date, profiles: Profile[]) => {
    return profiles.some(profile => {
      if (!profile.birthday) return false;
      const birthday = new Date(profile.birthday + 'T12:00:00');
      return birthday.getDate() === date.getDate() && 
             birthday.getMonth() === date.getMonth();
    });
  };

  // Get birthdays for a specific date
  const getBirthdaysForDate = (date: Date, profiles: Profile[]) => {
    return profiles.filter(profile => {
      if (!profile.birthday) return false;
      const birthday = new Date(profile.birthday + 'T12:00:00');
      return birthday.getDate() === date.getDate() && 
             birthday.getMonth() === date.getMonth();
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i);
      days.push(date);
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(date);
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push(date);
    }
    
    return days;
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-pink-600 text-xl font-semibold">Loading...</div>
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
            
            <Link href="/dashboard/people" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <User size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">People</span>}
            </Link>

            <Link href="/dashboard/calendar" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <CalendarIcon size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3">Calendar</span>}
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
            <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Calendar</h1>
          </div>

          {/* User Avatar */}
          <UserAvatar />
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Calendar View</h2>
              <p className="text-gray-500 mt-1">View all your gift-giving events and birthdays</p>
            </div>

            {/* Monthly Calendar */}
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isCurrentDay = isToday(date);
                  const hasBirthdayOnDay = hasBirthday(date, profiles);
                  const hasHolidayOnDay = hasHoliday(date);

                  return (
                    <div
                      key={index}
                      className={`
                        relative p-2 min-h-[80px] rounded-lg
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isCurrentDay ? 'ring-2 ring-pink-500' : ''}
                        ${hasBirthdayOnDay ? 'bg-pink-50' : ''}
                        ${hasHolidayOnDay ? 'bg-blue-50' : ''}
                        hover:bg-gray-50 transition-colors
                      `}
                    >
                      <span className={`
                        text-sm font-medium
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isCurrentDay ? 'text-pink-600' : ''}
                      `}>
                        {date.getDate()}
                      </span>

                      {/* Holiday Indicators */}
                      {hasHolidayOnDay && (
                        <div className="mt-1">
                          {getHolidaysForDate(date).map(holiday => (
                            <div
                              key={holiday.name}
                              className="text-xs text-blue-600 bg-blue-100 rounded px-1 py-0.5 mb-1 truncate"
                            >
                              {holiday.emoji} {holiday.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Birthday Indicators */}
                      {hasBirthdayOnDay && (
                        <div className="mt-1">
                          {getBirthdaysForDate(date, profiles).map(profile => (
                            <div
                              key={profile.id}
                              className="text-xs text-pink-600 bg-pink-100 rounded px-1 py-0.5 mb-1 truncate"
                            >
                              🎂 {profile.name}&apos;s Birthday
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-50 border border-pink-200"></div>
                  <span>Birthday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-200"></div>
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full ring-2 ring-pink-500"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 