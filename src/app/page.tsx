"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const profiles = [
    {
      id: 1,
      name: 'Shreyas',
      avatar: '/landing_images/test_profile_pic.svg'
    },
    {
      id: 2, 
      name: 'Bayler',
      avatar: '/landing_images/test_profile_pic.svg'
    },
    {
      id: 3,
      name: 'Alice',
      avatar: '/landing_images/test_profile_pic.svg',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-cyan-100 flex flex-col">
      {/* Top Navigation Bar*/}
      <header className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-700 to-cyan-800 shadow-md">
        {/* Logo in Nav */}
        <div className="flex items-center">
          <Link href="/">
            <div className="text-white font-bold text-2xl mr-8 flex items-center ">
              <span className="text-cyan-300">Gift</span> Spark
              <span className="ml-2 text-yellow-300 text-3xl">✨</span>
            </div>
          </Link>
          
        </div>

        <div className='flex gap-4'>

          {/* TODO: This portion of the code should be*/}

        {/* <Link href="/profiles">
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
              Your Profiles
            </button>
          </Link> */}

          <Link href='/login'>
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full'>
              Login
            </button>
          </Link>
          <Link href='/signup'>
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-full'>
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex flex-col flex-1 p-6 md:p-12'>
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-8">
          <h1 className="text-5xl font-bold text-cyan-800 mb-4 tracking-tight">
            GiftSpark
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-teal-400 rounded mb-8"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-700 mb-4">
            LET US DO THE THINKING!
          </h2>
          <p className="text-lg text-cyan-600 max-w-2xl mb-6">
            Finding the perfect gift doesn't have to be stressful. Tell us about your loved ones, and we'll suggest ideal gifts tailored just for them.
          </p>
        </section>

        {/* Profiles Section - Horizontal Scrolling */}
        <section className="mb-8 max-w-2xl mx-auto w-full">
          <div className="overflow-x-auto pb-4 mb-2 scrollbar-hide">
            <div className="flex space-x-6 px-2 min-w-min">
              {profiles.length > 0 && profiles.map((profile) => (
                <div key={profile.id} className="flex flex-col items-center">
                  <button
                    className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden hover:ring-4 hover:ring-cyan-400 transition duration-300 shadow-md"
                    onClick={() => router.push(`/recommendations/${profile.id}`)}
                  >
                    <img
                      src={profile.avatar}
                      alt={`Profile for ${profile.name}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                  <span className="text-sm font-medium text-cyan-800 mt-2">{profile.name}</span>
                </div>
              ))}
              {/* Add Profile Button */}
              <div className="flex flex-col items-center">
                <button 
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-400 text-white hover:from-cyan-600 hover:to-teal-500 transition duration-300 shadow-md"
                  onClick={() => console.log("Open add profile modal")} 
                >
                  <span className="text-xl">+</span>
                </button>
                <span className="text-sm font-medium text-cyan-800 mt-2">Add New</span>
              </div>
            </div>
          </div>
          
          {/* Shopping for someone new text */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-cyan-700">
              Shopping for someone new?
            </p>
          </div>
        </section>

        {/* Gift Input Section */}
        <section className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6">
              <p className="text-xl font-bold text-white mb-2">
                What are their hobbies/interests/age...
              </p>
              <p className="text-cyan-100 text-sm mb-0">
                The more details you provide, the better our suggestions will be!
              </p>
            </div>
            
            <div className="p-6">
              <textarea
                placeholder="e.g. Likes hiking, reading, 25 years old, collects vinyl records, loves dogs..."
                className="w-full p-4 rounded-lg border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none text-gray-800 shadow-inner"
                rows={4}
              ></textarea>

              <button className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 text-white py-3 px-6 rounded-lg font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Generate Gift Ideas
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gradient-to-r from-cyan-800 to-cyan-900 text-white text-center">
        <div className="container mx-auto px-4">
          <p className="mb-4">© 2025 GiftSpark - Finding the perfect gift, every time</p>
          <div className="flex justify-center space-x-4 text-sm text-cyan-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}