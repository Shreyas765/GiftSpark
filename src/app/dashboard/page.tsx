"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, X, Home, Users, Building, LogOut, 
  ChevronLeft, ChevronRight, Plus, CalendarIcon,
  UserPlus, Building2, DollarSign
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
  
  // Business and employee states
  const [business, setBusiness] = useState<Business | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGiftCost, setTotalGiftCost] = useState(0);
  const [timeRange, setTimeRange] = useState<'day' | 'week'>('day');
  const [giftSpendingData, setGiftSpendingData] = useState<GiftSpendingData[]>([]);

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

          <UserAvatar />
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
          </section>
        </main>
      </div>
    </div>
  );
}