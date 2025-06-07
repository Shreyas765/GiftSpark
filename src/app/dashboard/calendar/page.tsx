"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import UserAvatar from '@/app/components/UserAvatar';
import Calendar from '@/app/components/Calendar';

// Icons
import { 
  Menu, X, Home, Gift, User, LogOut, 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users
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

interface CustomEvent {
  id: string;
  name: string;
  date: Date;
  description?: string;
  color: string;
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
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CustomEvent>>({
    name: '',
    description: '',
    color: '#FF6B6B'
  });

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

  // Load custom events from localStorage
  React.useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userEventsKey = `userEvents_${session.user.email}`;
      const savedEvents = localStorage.getItem(userEventsKey);
      if (savedEvents) {
        setCustomEvents(JSON.parse(savedEvents));
      }
    }
  }, [isLoggedIn, session?.user?.email]);

  // Save custom events to localStorage
  React.useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      const userEventsKey = `userEvents_${session.user.email}`;
      localStorage.setItem(userEventsKey, JSON.stringify(customEvents));
    }
  }, [customEvents, isLoggedIn, session?.user?.email]);

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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

  // Add new custom event
  const handleAddEvent = () => {
    if (selectedDate && newEvent.name) {
      const event: CustomEvent = {
        id: Date.now().toString(),
        name: newEvent.name,
        date: selectedDate,
        description: newEvent.description,
        color: newEvent.color || '#FF6B6B'
      };
      setCustomEvents([...customEvents, event]);
      setShowEventModal(false);
      setNewEvent({ name: '', description: '', color: '#FF6B6B' });
    }
  };

  // Delete custom event
  const handleDeleteEvent = (eventId: string) => {
    setCustomEvents(customEvents.filter(event => event.id !== eventId));
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return customEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Modify the calendar day rendering to include custom events
  const renderCalendarDay = (date: Date) => {
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isCurrentDay = isToday(date);
    const dateEvents = getEventsForDate(date);
    const dateHolidays = getHolidaysForDate(date);
    const dateBirthdays = getBirthdaysForDate(date, profiles);

    return (
      <div
        key={date.toISOString()}
        onClick={() => {
          setSelectedDate(date);
          setShowEventModal(true);
        }}
        className={`
          relative p-1 min-h-[80px]
          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
          ${isCurrentDay ? 'ring-2 ring-pink-500' : ''}
          hover:bg-pink-50 cursor-pointer transition-colors rounded-lg
        `}
      >
        <div className="text-sm font-medium mb-1 text-black">
          {date.getDate()}
        </div>
        
        {/* Display events */}
        <div className="space-y-0.5">
          {dateEvents.map(event => (
            <div
              key={event.id}
              className="text-xs p-0.5 rounded truncate"
              style={{ backgroundColor: event.color + '20', color: event.color }}
            >
              {event.name}
            </div>
          ))}
          
          {/* Display holidays */}
          {dateHolidays.map(holiday => (
            <div key={holiday.name} className="text-xs text-black">
              {holiday.emoji} {holiday.name}
            </div>
          ))}
          
          {/* Display birthdays */}
          {dateBirthdays.map(profile => (
            <div key={profile.id} className="text-xs text-black">
              🎂 {profile.name}&apos;s Birthday
            </div>
          ))}
        </div>
      </div>
    );
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <Home size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link href="/dashboard/employees" className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md group transition-colors">
              <Users size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3">Employees</span>}
            </Link>

            <Link href="/dashboard/calendar" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <CalendarIcon size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3">Calendar</span>}
            </Link>
          </nav>

          {/* Calendar Section */}
          {sidebarOpen && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Calendar profiles={profiles} customEvents={customEvents} />
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
              <p className="text-gray-500 mt-1">View all your gift-giving events</p>
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
              <div className="grid grid-cols-7 gap-1 bg-transparent rounded-lg">
                {/* Weekday headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-white p-1 text-center font-medium text-black text-sm">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {generateCalendarDays().map(renderCalendarDay)}
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

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-200/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {/* List events for the selected day with delete buttons */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-black">Events for {selectedDate.toLocaleDateString()}:</h3>
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-gray-500 text-sm">No events for this day.</div>
              ) : (
                <ul className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <li key={event.id} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-black truncate" style={{ color: event.color }}>{event.name}</span>
                        {event.description && (
                          <span className="block text-xs text-gray-600 truncate">{event.description}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="ml-3 text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded"
                        title="Delete event"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <h2 className="text-xl font-bold mb-4 text-black">
              Add Event for {selectedDate.toLocaleDateString()}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">Event Name</label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Color</label>
                <input
                  type="color"
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 