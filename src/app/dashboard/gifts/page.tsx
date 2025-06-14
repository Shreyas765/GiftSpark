"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, X, Home, Users, LogOut, 
  ChevronLeft, ChevronRight, Gift,
  CalendarIcon, Bell, Plus, DollarSign,
  Lock, Unlock, CheckCircle2, XCircle,
  Search
} from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';
import Calendar from '../../components/Calendar';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  interests?: string;
  selectedForGift?: boolean;
  firstName: string;
  lastName: string;
  isVisible?: boolean;
}

interface CustomEvent {
  id: string;
  name: string;
  date: Date;
  description?: string;
  color: string;
  isGift?: boolean;
  giftDetails?: {
    minPrice?: number;
    maxPrice?: number;
    giftDescription?: string;
    selectedEmployees?: string[];
  };
}

export default function GiftsPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [giftEvents, setGiftEvents] = useState<CustomEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showGenerateGifts, setShowGenerateGifts] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState<{name: string, interests: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch employees and gift events data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesResponse = await fetch('/api/employees');
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData);
        }

        // Load gift events from localStorage
        if (session?.user?.email) {
          const companyDomain = session.user.email.split('@')[1];
          const companyEventsKey = `companyEvents_${companyDomain}`;
          const savedEvents = localStorage.getItem(companyEventsKey);
          if (savedEvents) {
            try {
              const parsedEvents = JSON.parse(savedEvents);
              const eventsWithDates = parsedEvents
                .map((event: any) => ({
                  ...event,
                  date: new Date(event.date)
                }))
                .filter((event: CustomEvent) => event.isGift);
              setGiftEvents(eventsWithDates);
            } catch (error) {
              console.error('Error loading gift events:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [session?.user?.email]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('companyEvents_') && session?.user?.email) {
        const companyDomain = session.user.email.split('@')[1];
        const companyEventsKey = `companyEvents_${companyDomain}`;
        if (e.key === companyEventsKey) {
          try {
            const savedEvents = localStorage.getItem(companyEventsKey);
            if (savedEvents) {
              const parsedEvents = JSON.parse(savedEvents);
              const eventsWithDates = parsedEvents
                .map((event: any) => ({
                  ...event,
                  date: new Date(event.date)
                }))
                .filter((event: CustomEvent) => event.isGift);
              setGiftEvents(eventsWithDates);
            }
          } catch (error) {
            console.error('Error loading gift events:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session?.user?.email]);

  const handleEventSelect = (event: CustomEvent) => {
    setSelectedEvent(event);
    // Update employee selection status based on event's selected employees
    if (event.giftDetails?.selectedEmployees) {
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => ({
          ...emp,
          selectedForGift: event.giftDetails?.selectedEmployees?.includes(emp.id)
        }))
      );
    } else {
      setEmployees(prevEmployees =>
        prevEmployees.map(emp => ({
          ...emp,
          selectedForGift: false
        }))
      );
    }
  };

  const handleEmployeeNameClick = (employeeId: string) => {
    if (!selectedEvent) return;
    const updatedEmployees = employees.map(emp =>
      emp.id === employeeId ? { ...emp, selectedForGift: !emp.selectedForGift } : emp
    );
    setEmployees(updatedEmployees);

    // Update the event's selected employees
    const selectedEmployeeIds = updatedEmployees
      .filter(emp => emp.selectedForGift)
      .map(emp => emp.id);

    const updatedEvent = {
      ...selectedEvent,
      giftDetails: {
        ...selectedEvent.giftDetails,
        selectedEmployees: selectedEmployeeIds
      }
    };
    setSelectedEvent(updatedEvent);

    // Update in the events list
    setGiftEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === selectedEvent.id ? updatedEvent : event
      )
    );

    // Save to localStorage
    if (session?.user?.email) {
      const companyDomain = session.user.email.split('@')[1];
      const companyEventsKey = `companyEvents_${companyDomain}`;
      try {
        const savedEvents = localStorage.getItem(companyEventsKey);
        if (savedEvents) {
          const allEvents = JSON.parse(savedEvents);
          const updatedEvents = allEvents.map((event: any) =>
            event.id === selectedEvent.id ? updatedEvent : event
          );
          localStorage.setItem(companyEventsKey, JSON.stringify(updatedEvents));
        }
      } catch (error) {
        console.error('Error saving event:', error);
      }
    }
  };

  const handleBudgetEdit = () => {
    setShowPasswordModal(true);
  };

  const verifyPassword = async () => {
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setIsEditingBudget(true);
        setNewBudget(selectedEvent?.giftDetails?.maxPrice?.toString() || '');
      } else {
        alert('Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
    }
  };

  const saveBudget = async () => {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      giftDetails: {
        ...selectedEvent.giftDetails,
        maxPrice: parseFloat(newBudget)
      }
    };

    setSelectedEvent(updatedEvent);
    setGiftEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === selectedEvent.id ? updatedEvent : event
      )
    );
    setIsEditingBudget(false);

    // Save to localStorage
    if (session?.user?.email) {
      const companyDomain = session.user.email.split('@')[1];
      const companyEventsKey = `companyEvents_${companyDomain}`;
      try {
        const savedEvents = localStorage.getItem(companyEventsKey);
        if (savedEvents) {
          const allEvents = JSON.parse(savedEvents);
          const updatedEvents = allEvents.map((event: any) =>
            event.id === selectedEvent.id ? updatedEvent : event
          );
          localStorage.setItem(companyEventsKey, JSON.stringify(updatedEvents));
        }
      } catch (error) {
        console.error('Error saving event:', error);
      }
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <Home size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
            </Link>
            
            <Link href="/dashboard/employees" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <Users size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Employees</span>}
            </Link>

            <Link href="/dashboard/calendar" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <CalendarIcon size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Calendar</span>}
            </Link>

            <Link href="/dashboard/gifts" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <Gift size={20} className="text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Gifts</span>}
            </Link>
          </nav>

          {/* Calendar Preview Section */}
          {sidebarOpen && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Calendar profiles={[]} customEvents={undefined} />
            </div>
          )}
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
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            <h1 className="text-xl font-semibold text-black">
              Gift Management
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <UserAvatar />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Gift Events Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">Gift Events</h2>
                <button
                  onClick={() => setShowGenerateGifts(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg shadow hover:opacity-90 transition-all"
                >
                  <Gift size={18} />
                  {selectedEvent ? `Generate Gifts for ${selectedEvent.name}` : 'Generate Gifts'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {giftEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all shadow-sm bg-gray-50 ${
                      selectedEvent?.id === event.id
                        ? 'border-pink-500 bg-pink-100'
                        : 'border-gray-400 hover:border-pink-200 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-black">{event.name}</h3>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    </div>
                    <p className="text-sm text-black">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    {event.giftDetails && (event.giftDetails.minPrice !== undefined || event.giftDetails.maxPrice !== undefined) && (
                      <p className="text-sm font-medium text-black mt-2">
                        Budget: {event.giftDetails.minPrice !== undefined && event.giftDetails.maxPrice !== undefined
                          ? `$${event.giftDetails.minPrice.toLocaleString()} - $${event.giftDetails.maxPrice.toLocaleString()}`
                          : event.giftDetails.minPrice !== undefined
                            ? `$${event.giftDetails.minPrice.toLocaleString()}`
                            : event.giftDetails.maxPrice !== undefined
                              ? `$${event.giftDetails.maxPrice.toLocaleString()}`
                              : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-black">{selectedEvent.name}</h2>
                    <p className="text-sm text-black">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {isEditingBudget ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Enter budget"
                        />
                        <button
                          onClick={saveBudget}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button
                          onClick={() => setIsEditingBudget(false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleBudgetEdit}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <DollarSign size={18} />
                        {selectedEvent.giftDetails?.minPrice !== undefined && selectedEvent.giftDetails?.maxPrice !== undefined
                          ? `$${selectedEvent.giftDetails.minPrice.toLocaleString()} - $${selectedEvent.giftDetails.maxPrice.toLocaleString()}`
                          : selectedEvent.giftDetails?.minPrice !== undefined
                            ? `$${selectedEvent.giftDetails.minPrice.toLocaleString()}`
                            : selectedEvent.giftDetails?.maxPrice !== undefined
                              ? `$${selectedEvent.giftDetails.maxPrice.toLocaleString()}`
                              : 'Set Budget'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Employee List */}
                <div className="space-y-4">
                  {/* Search and Select All Controls */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <button
                      onClick={() => {
                        const updatedEmployees = employees.map(emp => ({
                          ...emp,
                          selectedForGift: true
                        }));
                        setEmployees(updatedEmployees);
                        if (selectedEvent) {
                          const updatedEvent = {
                            ...selectedEvent,
                            giftDetails: {
                              ...selectedEvent.giftDetails,
                              selectedEmployees: updatedEmployees.map(emp => emp.id)
                            }
                          };
                          setSelectedEvent(updatedEvent);
                          setGiftEvents(prevEvents =>
                            prevEvents.map(event =>
                              event.id === selectedEvent.id ? updatedEvent : event
                            )
                          );
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg shadow hover:opacity-90 transition-all"
                    >
                      Select All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees
                      .filter(employee => 
                        searchTerm === '' || 
                        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm)
                      )
                      .map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-4 rounded-lg border transition-all shadow-sm bg-gray-50 ${
                          employee.selectedForGift
                            ? 'border-pink-200 bg-pink-100'
                            : 'border-gray-400 opacity-50'
                        } text-black cursor-pointer hover:border-pink-200 hover:bg-pink-50/50`}
                        onClick={() => handleEmployeeNameClick(employee.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-medium ${employee.selectedForGift ? 'text-black' : 'text-gray-400'}`}
                              >
                                {employee.firstName} {employee.lastName}
                              </h3>
                              <div className="flex gap-1">
                                {giftEvents
                                  .filter(event => event.giftDetails?.selectedEmployees?.includes(employee.id))
                                  .map(event => (
                                    <div
                                      key={event.id}
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: event.color }}
                                      title={event.name}
                                    />
                                  ))
                                }
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{employee.position}</p>
                          </div>
                          <div className="ml-4">
                            {employee.selectedForGift ? (
                              <CheckCircle2 size={20} className="text-pink-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                        </div>
                        {employee.interests && (
                          <button
                            className="text-left w-full mt-2 text-sm text-black underline hover:text-pink-600 line-clamp-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInterestsModal({ 
                                name: `${employee.firstName} ${employee.lastName}`, 
                                interests: employee.interests! 
                              });
                            }}
                          >
                            {employee.interests.length > 50
                              ? `${employee.interests.substring(0, 50)}...`
                              : employee.interests}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-black mb-4">Enter Password</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Enter your password"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Gifts Modal */}
      {showGenerateGifts && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-black mb-4">Generate Gifts</h3>
            <p className="text-black mb-6">
              This feature will be implemented soon. It will help you generate personalized gift suggestions for your employees.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowGenerateGifts(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interests Modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">{showInterestsModal.name}'s Interests</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowInterestsModal(null)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
              <p className="text-black whitespace-pre-line">{showInterestsModal.interests}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowInterestsModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 