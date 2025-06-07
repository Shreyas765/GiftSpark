"use client";

import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Upload, Download, FileText, AlertCircle, Menu, X, Home, Users, Building, LogOut, ChevronLeft, ChevronRight, Building2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '../../components/UserAvatar';

interface PayrollRecord {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  lastUpdated: Date;
}

export default function PayrollPage() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [payrollFile, setPayrollFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePayrollUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPayrollFile(file);
      setError(null);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/payroll/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload payroll file');
        }

        const data = await response.json();
        
        // Process the records to extract emails if not already present
        const processedRecords = data.records.map((record: any) => {
          // If email is not in the record, try to extract it from the name or other fields
          if (!record.email) {
            // Try to find email in the name field (common format: "John Doe <john@example.com>")
            const emailMatch = record.name.match(/<([^>]+)>/);
            if (emailMatch) {
              record.email = emailMatch[1];
              record.name = record.name.replace(/<[^>]+>/, '').trim();
            } else {
              // If no email found, generate a placeholder
              record.email = `${record.name.toLowerCase().replace(/\s+/g, '.')}@company.com`;
            }
          }
          return record;
        });

        setPayrollRecords(processedRecords);
        setSuccess('Payroll file uploaded successfully!');
        setShowUploadModal(false);
      } catch (err) {
        setError('Failed to upload payroll file. Please try again.');
        console.error('Error uploading payroll:', err);
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Here you would typically generate and download a template file
    alert('Template download functionality will be implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
            
            <Link href="/dashboard/departments" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 hover:text-pink-600 rounded-xl group transition-all duration-200">
              <Building2 size={20} className="text-gray-500 group-hover:text-pink-600" />
              {sidebarOpen && <span className="ml-3 font-medium">Departments</span>}
            </Link>

            <Link href="/dashboard/payroll" className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-md group transition-colors">
              <DollarSign size={20} className="text-pink-600" />
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
              Payroll Management
            </h1>
          </div>

          <UserAvatar />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="mt-2 text-gray-600">Upload and manage your employee payroll data</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={20} className="mr-2" />
                  Download Template
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Payroll
                </button>
              </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h2 className="text-xl font-semibold mb-4">Upload Payroll File</h2>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handlePayrollUpload}
                        className="hidden"
                        id="payroll-file"
                      />
                      <label
                        htmlFor="payroll-file"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <span className="text-gray-600">Click to upload or drag and drop</span>
                        <span className="text-sm text-gray-500 mt-1">CSV or Excel files only</span>
                      </label>
                    </div>
                    {error && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-2" />
                        {error}
                      </div>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => document.getElementById('payroll-file')?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                <FileText size={20} className="mr-2" />
                {success}
              </div>
            )}

            {/* Payroll Records Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.salary.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {payrollRecords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No payroll records found. Upload a file to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 