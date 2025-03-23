"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import Link from 'next/link';
import { User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: any) => void;
}

export default function ProfileModal({ isOpen, onClose, onSuccess }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          imageUrl: null,
          details: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not create profile. Please try again.');
      }

      if (!data || !data.name) {
        throw new Error('We received invalid data. Please try again.');
      }

      onSuccess(data);
      onClose();
    } catch (error) {
      console.error('Error creating profile:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Someone to Shop For">
      <div className="flex justify-end mb-2">
        <Link
          href="/dashboard/people"
          className="p-2 text-gray-500 hover:text-cyan-600 transition-colors"
        >
          <User size={20} />
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
            </div>
        )}
        
        <div>
            <label htmlFor="name" className="block font-medium text-gray-700">
            Who are you shopping for?
            </label>
            <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eg. John, Mom, Best Friend..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-600 focus:ring-cyan-600 placeholder:text-gray-600 text-gray-800"
            required
            />
        </div>
        
        <div className="flex justify-end space-x-3">
            <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
            Cancel
            </button>
            
            <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
            >
            {isLoading ? 'Adding...' : 'Add Profile'}
            </button>
        </div>
        </form>
    </Modal>
  );
}
