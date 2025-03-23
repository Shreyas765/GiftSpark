"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

type AuthFormsProps = {
  initialMode: 'login' | 'signup';
  onSuccess?: () => void;
};

const AuthForms: React.FC<AuthFormsProps> = ({ initialMode, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          redirect: true
        });
        
        if (result?.error) {
          setError('Invalid email or password');
        } else if (result?.url && onSuccess) {
          onSuccess();
        }
      } 
      // For signup mode
      else {
        // First create the user
        const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerData.message || 'Failed to create account');
        }

        // After successful registration, sign in the user
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
          redirect: true
        });
        
        if (result?.error) {
          setError('Failed to sign in after account creation');
        } else if (result?.url && onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
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
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full transition-colors"
        >
          {isLoading ? 'Loading...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-cyan-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-cyan-600 hover:underline"
            >
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForms;