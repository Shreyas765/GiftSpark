"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<'email' | 'reset'>('email');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setStep('reset');
      setMessage("Reset code sent to your email");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Store success message in sessionStorage
      sessionStorage.setItem('passwordResetSuccess', 'true');
      // Redirect to landing page without going through NextAuth
      window.location.href = '/';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="w-full max-w-md mx-4 p-6 border rounded-lg shadow-sm">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
          <p className="text-center text-gray-600">
            {step === 'email' 
              ? "Enter your email address and we'll send you a reset code."
              : "Enter the reset code and your new password."}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {message && (
              <p className={`text-sm text-center ${message.includes("error") ? "text-red-500" : "text-green-500"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Sending&hellip;" : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter reset code"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {message && (
              <p className={`text-sm text-center ${message.includes("error") ? "text-red-500" : "text-green-500"}`}>
                {message}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Resetting&hellip;" : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 