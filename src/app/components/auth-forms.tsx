"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

type AuthFormsProps = {
  initialMode: 'login' | 'signup';
  onSuccess?: () => void;
};

const AuthForms: React.FC<AuthFormsProps> = ({ initialMode, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Reset shake animation after it completes
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => {
        setShake(false);
      }, 820); // Animation duration + a little extra
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true
      });

      if (result?.error) {
        setError('Failed to sign in with Google');
      } else if (result?.url && onSuccess) {
        onSuccess();
      }
    } catch (err) {
        console.error('Google sign-in error:', err);
        setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // For login mode
      if (mode === 'login') {
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
          redirect: false // Changed to false to handle errors
        });
        
        if (result?.error) {
          setError('Invalid credentials, please try again');
          setShake(true);
        } else if (result?.url) {
          window.location.href = result.url;
          if (onSuccess) onSuccess();
        }
      } 
      // For signup mode
      else {
        // First create the business account
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            companyName,
            industry,
            size,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerData.message || 'Failed to create business account');
        }

        // After successful registration, sign in the business
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
          redirect: false
        });
        
        if (result?.error) {
          setError('Failed to sign in after account creation');
          setShake(true);
        } else if (result?.url) {
          window.location.href = result.url;
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShake(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div 
          className={`mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center justify-center ${shake ? 'animate-shake' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-gray-700 hover:bg-gray-50 mb-4 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
      </button>
      
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      
      <form onSubmit={handleEmailSubmit}>
        {mode === 'signup' && (
          <>
            <div className="mb-4">
              <label htmlFor="companyName" className="block text-gray-700 text-sm font-medium mb-1">Company Name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="industry" className="block text-gray-700 text-sm font-medium mb-1">Industry</label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Transportation">Transportation</option>
                <option value="Energy">Energy</option>
                <option value="Media">Media</option>
                <option value="Construction">Construction</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Legal">Legal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="size" className="block text-gray-700 text-sm font-medium mb-1">Company Size</label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Business Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 px-4 rounded-md hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-sm text-pink-600 hover:text-pink-700">
            Forgot password?
          </Link>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <p className="text-gray-600 text-sm">
            Don&apos;t have a business account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-400 hover:bg-clip-text hover:text-transparent"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Already have a business account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-pink-500 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-400 hover:bg-clip-text hover:text-transparent"
            >
              Log in
            </button>
          </p>
        )}
      </div>
      
      {/* Add the shake animation to your styles */}
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          10% { transform: translateX(-10px); }
          20% { transform: translateX(10px); }
          30% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          50% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        
        .animate-shake {
          animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default AuthForms;