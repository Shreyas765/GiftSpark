"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, X, Home, Users, LogOut, 
  ChevronLeft, ChevronRight, DollarSign,
  Pencil, Save, Plus, CalendarIcon,
  ShoppingCart, Trash2, ChevronUp, Bell
} from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';
import Calendar from '../../components/Calendar';
import AddEmployee from '../../components/AddEmployee';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  interests?: string;
  lastGift?: {
    name: string;
    date: Date;
  };
}

interface EmailFormat {
  format: string;
  example: string;
  description: string;
}

export default function EmployeesPage() {
  const { data: session, status } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [emailExample, setEmailExample] = useState({ name: '', email: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [learnedFormat, setLearnedFormat] = useState<EmailFormat | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [tempFormat, setTempFormat] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatDescription, setFormatDescription] = useState<string>('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

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

  useEffect(() => {
    // Fetch employees data
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleInterestsUpdate = (event: CustomEvent) => {
      const { employeeId, interests } = event.detail;
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === employeeId ? { ...emp, interests } : emp
        )
      );
    };

    window.addEventListener('interestsUpdated', handleInterestsUpdate as EventListener);
    return () => {
      window.removeEventListener('interestsUpdated', handleInterestsUpdate as EventListener);
    };
  }, []);

  const handleCellEdit = (rowIndex: number, col: string, value: string) => {
    setEditingCell({ row: rowIndex, col });
    setEditValue(value);
  };

  const handleSaveEdit = async (rowIndex: number, col: string) => {
    const updatedEmployees = [...employees];
    const employee = updatedEmployees[rowIndex];
    
    if (col === 'firstName') employee.firstName = editValue;
    else if (col === 'lastName') employee.lastName = editValue;
    else if (col === 'email') employee.email = editValue;
    else if (col === 'interests') employee.interests = editValue;

    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employee.id, [col]: editValue })
      });

      if (response.ok) {
        setEmployees(updatedEmployees);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }

    setEditingCell(null);
  };

  const analyzeEmailFormat = async () => {
    if (!emailExample.name || !emailExample.email) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: emailExample.name,
          email: emailExample.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLearnedFormat(data);
      }
    } catch (error) {
      console.error('Error analyzing email format:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddEmployee = async (employee: { firstName: string; lastName: string; email: string }) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      const newEmployee = await response.json();
      console.log('New employee added:', newEmployee); // Debug log
      
      setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
      setShowAddEmployee(false); // Close the modal after successful addition
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees?id=${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== employeeId));
      } else {
        console.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
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
            
            <Link href="/dashboard/employees" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <Users size={20} className="text-pink-600" />
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
            
            <h1 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              Employees
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
          <section className="max-w-7xl mx-auto w-full pb-20">
            {/* Email Format Settings */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-900">Email Format Settings</h2>
                <button
                  onClick={() => {/* TODO: Implement import functionality */}}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  Import Emails from Payroll
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    To set up your company's email format, provide an example of an employee's name and their email address.
                    Our AI will analyze the pattern and apply it to all employees.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        value={emailExample.name}
                        onChange={(e) => setEmailExample(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., John Smith"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={emailExample.email}
                        onChange={(e) => setEmailExample(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g., jsmith@company.com"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={analyzeEmailFormat}
                    disabled={isAnalyzing || !emailExample.name || !emailExample.email}
                    className="mt-4 w-full px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Format...
                      </div>
                    ) : (
                      'Analyze Format'
                    )}
                  </button>
                </div>

                {learnedFormat && learnedFormat.format && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Learned Format</h3>
                      <div className="bg-gray-50 p-3 rounded-md flex flex-col gap-2">
                        <div>
                          <span className="text-xs text-gray-500 mr-2">Template:</span>
                          <span className="text-lg font-mono text-pink-600">{learnedFormat.format}</span>
                        </div>
                        {learnedFormat.description && (
                          <div>
                            <span className="text-xs text-gray-500 mr-2">Description:</span>
                            <span className="text-base text-gray-800">{learnedFormat.description}</span>
                          </div>
                        )}
                        {learnedFormat.example && (
                          <div>
                            <span className="text-xs text-gray-500 mr-2">Example (Jane Doe):</span>
                            <span className="text-base text-gray-800">{learnedFormat.example}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={async () => {
                          // Apply the learned format to all employees in the UI
                          if (!learnedFormat || !learnedFormat.format) return;
                          const domainMatch = learnedFormat.format.match(/@.+$/);
                          const domain = domainMatch ? domainMatch[0] : '';
                          
                          try {
                            // Update all employees with the new email format
                            const updatedEmployees = await Promise.all(employees.map(async (emp) => {
                              let email = learnedFormat.format
                                .replace(/\{firstName\}/gi, emp.firstName.toLowerCase())
                                .replace(/\{lastName\}/gi, emp.lastName.toLowerCase());
                              // If the format doesn't include a domain, append the original domain
                              if (!email.includes('@') && domain) {
                                email += domain;
                              }

                              // Update employee in the backend
                              const response = await fetch('/api/employees', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  employeeId: emp.id,
                                  email
                                })
                              });

                              if (!response.ok) {
                                throw new Error(`Failed to update employee ${emp.id}`);
                              }

                              return { ...emp, email };
                            }));

                            setEmployees(updatedEmployees);
                            alert('Email format applied to all employees successfully!');
                          } catch (error) {
                            console.error('Error applying email format:', error);
                            alert('Failed to apply email format to all employees. Please try again.');
                          }
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg shadow hover:opacity-90 transition-all font-semibold"
                      >
                        Set Format!
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Add Employee Button */}
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => setShowAddEmployee(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg shadow hover:opacity-90 transition-all font-medium"
              >
                <Plus size={18} />
                Add Employee
              </button>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Gift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interests</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50" data-employee-id={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="text-gray-900">{employee.firstName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{employee.lastName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCell?.row === rowIndex && editingCell?.col === 'email' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border rounded"
                            />
                            <button
                              onClick={() => handleSaveEdit(rowIndex, 'email')}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900">{employee.email}</span>
                            <button
                              onClick={() => handleCellEdit(rowIndex, 'email', employee.email)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.lastGift ? (
                          <div>
                            <div>{employee.lastGift.name}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(employee.lastGift.date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>No gifts bought</span>
                            <button
                              onClick={() => {/* TODO: Implement shop item functionality */}}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-md transition-colors"
                            >
                              <ShoppingCart size={14} />
                              Gift
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 max-w-[200px]">
                            {employee.interests ? 
                              (employee.interests.length > 50 ? 
                                `${employee.interests.substring(0, 50)}...` : 
                                employee.interests) 
                              : "No data"}
                          </span>
                          <button
                            onClick={() => {
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50';
                              modal.innerHTML = `
                                <div class="bg-white rounded-xl p-5 max-w-md w-full mx-4 shadow-xl border border-gray-100">
                                  <div class="flex justify-between items-center mb-3">
                                    <h3 class="text-base font-semibold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">${employee.firstName}'s Interests</h3>
                                    <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="this.closest('.fixed').remove()">
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4">
                                    <textarea 
                                      class="w-full h-32 p-3 text-sm text-gray-700 bg-white/50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                                      placeholder="Enter employee's interests and hobbies..."
                                    >${employee.interests || ""}</textarea>
                                  </div>
                                  <div class="mt-4 flex justify-end gap-2">
                                    <button 
                                      onclick="this.closest('.fixed').remove()"
                                      class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onclick="
                                        const textarea = this.closest('.bg-white').querySelector('textarea');
                                        const newInterests = textarea.value;
                                        
                                        fetch('/api/employees', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            employeeId: '${employee.id}',
                                            interests: newInterests
                                          })
                                        })
                                        .then(response => {
                                          if (response.ok) {
                                            const row = document.querySelector('[data-employee-id=\\'${employee.id}\\']');
                                            if (row) {
                                              const interestsCell = row.querySelector('.line-clamp-1');
                                              if (interestsCell) {
                                                interestsCell.textContent = newInterests || 'No data';
                                              }
                                            }
                                            // Update the React state
                                            window.dispatchEvent(new CustomEvent('interestsUpdated', {
                                              detail: {
                                                employeeId: '${employee.id}',
                                                interests: newInterests
                                              }
                                            }));
                                            this.closest('.fixed').remove();
                                          } else {
                                            throw new Error('Failed to update interests');
                                          }
                                        })
                                        .catch(error => {
                                          console.error('Error:', error);
                                          alert('Failed to update interests. Please try again.');
                                        });
                                      "
                                      class="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              `;
                              document.body.appendChild(modal);
                              modal.addEventListener('click', (e) => {
                                if (e.target === modal) {
                                  modal.remove();
                                }
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ChevronUp size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Add Employee Modal */}
      <AddEmployee
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        onAdd={handleAddEmployee}
      />
    </div>
  );
} 