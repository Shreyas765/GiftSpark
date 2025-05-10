"use client";
import React, { useState } from 'react';
import Modal from './Modal';
import Link from 'next/link';
import { User, X, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: { 
    id: string; 
    name: string; 
    details: string; 
    createdAt: string;
    birthday?: string;
  }) => void;
}

export default function ProfileModal({ isOpen, onClose, onAddProfile }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a new profile with a unique ID
      const newProfile = {
        id: crypto.randomUUID(),
        name,
        details,
        createdAt: new Date().toISOString(),
        birthday: birthday || undefined
      };
      
      onAddProfile(newProfile);
      onClose();
    } catch (error) {
      console.error('Error creating profile:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a Profile">
      <div className="relative">
        {/* Header with improved styling */}
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <Link
            href="/dashboard/people"
            className="p-2 text-gray-400 hover:text-pink-600 transition-colors rounded-full hover:bg-gray-100"
            title="View all profiles"
          >
            <User size={18} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded shadow-sm text-sm flex items-start">
              <div className="mr-2 flex-shrink-0 mt-0.5">
                <X size={16} className="text-red-500" />
              </div>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block font-medium text-gray-700 text-sm">
              Who are you shopping for?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eg. John, Mom, Best Friend..."
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition duration-200 ease-in-out shadow-sm"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="birthday" className="block font-medium text-gray-700 text-sm">
              Birthday (Optional)
            </label>
            <input
              type="date"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition duration-200 ease-in-out shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="details" className="block font-medium text-gray-700 text-sm">
              Notes about this person
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any notes about their preferences, interests, or gift ideas..."
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition duration-200 ease-in-out shadow-sm min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-orange-400 border border-transparent rounded-lg hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-60 transition-colors duration-200 flex items-center justify-center min-w-24"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}