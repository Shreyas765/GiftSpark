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

            <Link href="/dashboard/payroll" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <DollarSign size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Payroll</span>}
            </Link>
          </nav>
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
          <section className="max-w-6xl mx-auto w-full pb-20">
            {/* Company Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <p className="text-xl font-semibold text-gray-800">{business?.industry}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Company Size</h3>
                  <p className="text-xl font-semibold text-gray-800">{business?.size} employees</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
                  <p className="text-xl font-semibold text-gray-800">{business?.employees.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Employee Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Employee Management</h2>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={20} className="mr-2" />
                  Add Employee
                </button>
              </div>

              {/* Employee List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gift</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {business?.employees.map((employee, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employmentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.prompt || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.gift ? (
                            <div>
                              <div className="font-medium">{employee.gift.name}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(employee.gift.date).toLocaleDateString()}
                                {employee.gift.price && ` • $${employee.gift.price}`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No gift bought</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-pink-600 hover:text-pink-900 mr-4">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}