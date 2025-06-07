"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, X, Home, Users, Building, LogOut, 
  ChevronLeft, ChevronRight, Plus, CalendarIcon,
  UserPlus, Building2, DollarSign, Bell, MessageSquare,
  ChevronDown, CheckCircle2, AlertCircle, Info, Trash2,
  MoreVertical, Filter
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import Calendar from '../components/Calendar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Employee {
  name: string;
  email: string;
  position: string;
  department: string;
  salary?: number;
  startDate: Date;
  birthday?: Date;
  employmentId: string;
  prompt?: string;
  gift?: {
    name: string;
    date: Date;
    price?: number;
  };
}

interface Business {
  companyName: string;
  industry: string;
  size: string;
  employees: Employee[];
}

interface GiftSpendingData {
  date: Date;
  amount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Upcoming Birthday",
      message: "John Doe's birthday is in 3 days",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "Gift Sent",
      message: "Gift for Jane Smith has been delivered",
      time: "1 day ago",
      read: true
    }
  ]);
  
  // Business and employee states
  const [business, setBusiness] = useState<Business | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGiftCost, setTotalGiftCost] = useState(0);
  const [timeRange, setTimeRange] = useState<'day' | 'week'>('day');
  const [giftSpendingData, setGiftSpendingData] = useState<GiftSpendingData[]>([]);

  // Messages state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Gift Delivered',
      message: 'Birthday gift for John Doe has been delivered',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Upcoming Birthday',
      message: 'Jane Smith\'s birthday is in 3 days',
      time: '1 day ago',
      read: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New Employee',
      message: 'Welcome Sarah Johnson to the team!',
      time: '2 days ago',
      read: true
    }
  ]);

  // Message management state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id: number | null, type: 'single' | 'all'} | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all');

  // Load business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (isLoggedIn && session?.user?.email) {
        try {
          setIsLoadingBusiness(true);
          setError(null);
          
          const response = await fetch('/api/business');
          if (!response.ok) {
            throw new Error('Failed to fetch business data');
          }
          
          const data = await response.json();
          setBusiness(data);
        } catch (err) {
          console.error('Error fetching business data:', err);
          setError('Failed to load business data. Please try again later.');
        } finally {
          setIsLoadingBusiness(false);
        }
      }
    };

    fetchBusinessData();
  }, [isLoggedIn, session?.user?.email]);

  // Calculate total gift costs
  useEffect(() => {
    if (business?.employees) {
      const total = business.employees.reduce((sum, employee) => {
        return sum + (employee.gift?.price || 0);
      }, 0);
      setTotalGiftCost(total);
    }
  }, [business?.employees]);

  // Calculate gift spending data
  useEffect(() => {
    if (business?.employees) {
      const spendingData: GiftSpendingData[] = [];
      const today = new Date();
      
      // Generate data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const daySpending = business.employees.reduce((sum, employee) => {
          if (employee.gift?.date && 
              new Date(employee.gift.date).toDateString() === date.toDateString()) {
            return sum + (employee.gift.price || 0);
          }
          return sum;
        }, 0);
        
        spendingData.push({
          date,
          amount: daySpending
        });
      }
      
      setGiftSpendingData(spendingData);
    }
  }, [business?.employees]);

  const chartData = {
    labels: giftSpendingData.map(data => 
      timeRange === 'day' 
        ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })
        : `Week ${Math.ceil((new Date(data.date).getDate()) / 7)}`
    ),
    datasets: [
      {
        label: 'Gift Spending',
        data: giftSpendingData.map(data => data.amount),
        fill: true,
        backgroundColor: 'rgba(249, 168, 212, 0.1)',
        borderColor: 'rgb(236, 72, 153)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        type: 'category',
        grid: {
          display: false,
        }
      }
    },
  };

  if (isLoading || isLoadingBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-pink-600 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 text-xl font-semibold">{error}</div>
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <Home size={20} className="text-pink-600" />
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
          </nav>

          {/* Calendar Preview Section */}
          {sidebarOpen && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Calendar profiles={[]} customEvents={[]} />
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
            
            {/* Company Name */}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              {business?.companyName || 'Loading...'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 relative"
              >
                <Bell size={24} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer group ${
                            !notification.read ? 'bg-pink-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div 
                              className="flex-1"
                              onClick={() => {
                                setNotifications(notifications.map(n =>
                                  n.id === notification.id ? { ...n, read: true } : n
                                ));
                              }}
                            >
                              <p className="font-medium text-gray-800">{notification.title}</p>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-gray-500">{notification.time}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(notifications.filter(n => n.id !== notification.id));
                                }}
                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <UserAvatar />
          </div>
        </header>
                
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <section className="max-w-7xl mx-auto w-full pb-20 space-y-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Spent on Gifts</p>
                    <p className="text-2xl font-semibold text-gray-800">${totalGiftCost.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                
                {/* Time Range Toggle */}
                <div className="flex justify-end mb-4">
                  <div className="inline-flex rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setTimeRange('day')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        timeRange === 'day'
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setTimeRange('week')}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        timeRange === 'week'
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Weekly
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Company Overview</h3>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Total Employees</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">{business?.employees.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Company Size</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">{business?.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm text-gray-500">Industry</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">{business?.industry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content and Messages Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Employee Management Module */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Employee Management</h2>
                    <button
                      onClick={() => setShowAddEmployee(true)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <UserPlus size={20} className="mr-2" />
                      Add Employee
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {business?.employees.map((employee, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
                            <p className="text-sm text-gray-500">{employee.position}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-400 hover:text-pink-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {employee.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {employee.department}
                          </div>
                          {employee.gift && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700">Last Gift</p>
                              <p className="text-sm text-gray-600">{employee.gift.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(employee.gift.date).toLocaleDateString()}
                                {employee.gift.price && ` • $${employee.gift.price}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-800">Messages & Updates</h2>
                      <div className="relative">
                        <button
                          onClick={() => setMessageFilter(messageFilter === 'all' ? 'unread' : 'all')}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Filter size={16} />
                        </button>
                        {messageFilter === 'unread' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {messages.length > 0 && (
                        <button
                          onClick={() => setShowDeleteConfirm({ id: null, type: 'all' })}
                          className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {messages
                      .filter(msg => messageFilter === 'all' || !msg.read)
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`group p-4 rounded-lg border transition-all duration-200 ${
                            msg.type === 'success' ? 'border-green-100 bg-green-50/50 hover:bg-green-50' :
                            msg.type === 'warning' ? 'border-orange-100 bg-orange-50/50 hover:bg-orange-50' :
                            'border-blue-100 bg-blue-50/50 hover:bg-blue-50'
                          } ${!msg.read ? 'ring-2 ring-pink-500/20' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              msg.type === 'success' ? 'text-green-500' :
                              msg.type === 'warning' ? 'text-orange-500' :
                              'text-blue-500'
                            }`}>
                              {msg.type === 'success' ? <CheckCircle2 size={20} /> :
                               msg.type === 'warning' ? <AlertCircle size={20} /> :
                               <Info size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-medium text-gray-900">{msg.title}</h3>
                                <div className="flex items-center gap-1">
                                  {!msg.read && (
                                    <button
                                      onClick={() => {
                                        setMessages(messages.map(m =>
                                          m.id === msg.id ? { ...m, read: true } : m
                                        ));
                                      }}
                                      className="text-xs text-pink-600 hover:text-pink-700 px-2 py-1 rounded-md hover:bg-pink-50 transition-colors"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setShowDeleteConfirm({ id: msg.id, type: 'single' })}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{msg.time}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  msg.type === 'success' ? 'bg-green-100 text-green-700' :
                                  msg.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No messages</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showDeleteConfirm.type === 'all' ? 'Clear All Messages' : 'Delete Message'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showDeleteConfirm.type === 'all' 
                ? 'Are you sure you want to clear all messages? This action cannot be undone.'
                : 'Are you sure you want to delete this message? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === 'all') {
                    setMessages([]);
                  } else {
                    setMessages(messages.filter(m => m.id !== showDeleteConfirm.id));
                  }
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}