"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import AuthForms from './components/auth-forms';
import Modal from "./components/Modal"
import { usePathname } from "next/navigation";

import { 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Building2,
  Users,
  Gift,
  Upload,
  Zap,
  Clock,
  Shield,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Heart,
  Briefcase
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const pathname = usePathname();

  // State for modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isLoggedIn && pathname === "/") {
      router.push('/dashboard');
    }
  }, [isLoggedIn, pathname, router]);

  // Handle opening the auth modal
  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Handle auth success
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
  };

  // Add effect to check for password reset success
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  useEffect(() => {
    const resetSuccess = sessionStorage.getItem('passwordResetSuccess');
    if (resetSuccess === 'true') {
      setShowResetSuccess(true);
      sessionStorage.removeItem('passwordResetSuccess');
      
      const timer = setTimeout(() => {
        setShowResetSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Inc.",
      content: "GiftSpark transformed our employee recognition program. What used to take hours now happens automatically.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "People Operations Manager",
      company: "StartupXYZ",
      content: "Our employees love the personalized gifts, and I love not having to remember every birthday and anniversary.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Chief People Officer",
      company: "Global Solutions Ltd.",
      content: "The ROI on employee satisfaction has been incredible. Worth every penny.",
      rating: 5
    }
  ];

  // Remove stats counter animation state and ref
  const [counts, setCounts] = useState({ employees: 0, gifts: 0, companies: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Animate counters
          const duration = 2000;
          const steps = 60;
          const stepDuration = duration / steps;
          
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            
            setCounts({
              employees: Math.floor(10000 * progress),
              gifts: Math.floor(50000 * progress),
              companies: Math.floor(500 * progress)
            });
            
            if (step >= steps) {
              clearInterval(timer);
              setCounts({ employees: 10000, gifts: 50000, companies: 500 });
            }
          }, stepDuration);
        }
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Add smooth scroll handler
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading || isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-0">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <Gift className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="text-2xl font-bold text-white">
                  GiftSpark
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#how-it-works" 
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-white/90 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#features" 
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-white/90 hover:text-white transition-colors"
              >
                Features
              </a>
              <a 
                href="#retention" 
                onClick={(e) => scrollToSection(e, 'retention')}
                className="text-white/90 hover:text-white transition-colors"
              >
                Retention
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => scrollToSection(e, 'pricing')}
                className="text-white/90 hover:text-white transition-colors"
              >
                Pricing
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openAuthModal('login')}
                className="bg-white border border-pink-500 text-pink-600 px-6 py-2 rounded-full text-sm font-medium hover:bg-pink-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Log in
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-white text-pink-600 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        {/* Password Reset Success Banner */}
        {showResetSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 fixed top-16 left-0 right-0 z-50">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">Password reset successful! You can now log in with your new password.</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-pink-500 via-pink-600 to-orange-500 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Automate Employee
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    {" "}Gifting
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl mb-8 text-gray-900">
                  Upload your payroll, and we'll handle personalized gifts for every employee milestone—birthdays, anniversaries, and achievements.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Free Trial
                    <ArrowRight className="inline ml-2 w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Watch Demo
                  </button>
                </div>
                
                <div className="flex items-center gap-6 text-gray-900">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Visual with Steps */}
              <div className="relative">
                <div className="relative h-[500px] w-full rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"
                    alt="Employee receiving a gift"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Steps Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                          <div className="bg-pink-500 rounded-full p-2">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium block">Upload Payroll</span>
                            <span className="text-sm text-white/80">One-time setup</span>
                          </div>
                          <div className="ml-auto bg-green-400 w-3 h-3 rounded-full"></div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                          <div className="bg-pink-500 rounded-full p-2">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium block">AI Generates Gifts</span>
                            <span className="text-sm text-white/80">Personalized for each employee</span>
                          </div>
                          <div className="ml-auto bg-green-400 w-3 h-3 rounded-full"></div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                          <div className="bg-pink-500 rounded-full p-2">
                            <Gift className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium block">Automated Delivery</span>
                            <span className="text-sm text-white/80">Hands-free gifting</span>
                          </div>
                          <div className="ml-auto bg-green-400 w-3 h-3 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                  Save 95% Time
                </div>
                <div className="absolute -bottom-4 -left-4 bg-orange-400 text-orange-900 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  100% Automated
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-20 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">How GiftSpark Works</h2>
              <p className="text-xl text-gray-800">Three simple steps to transform your employee experience</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative h-48 w-full mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                    alt="Upload data illustration"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="bg-pink-500 w-8 h-1 mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">1. Upload Your Data</h3>
                <p className="text-gray-800 text-lg">
                  Simply upload your payroll CSV or add employees manually. Include birthdays, hire dates, and any special occasions.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="relative h-48 w-full mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80"
                    alt="AI gift curation illustration"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="bg-pink-500 w-8 h-1 mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">2. AI Curates Gifts</h3>
                <p className="text-gray-800 text-lg">
                  Our AI analyzes employee preferences and occasions to select personalized gifts from Amazon's vast catalog.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="relative h-48 w-full mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80"
                    alt="Automated delivery illustration"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="bg-pink-500 w-8 h-1 mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">3. Automated Delivery</h3>
                <p className="text-gray-800 text-lg">
                  Gifts are automatically ordered and delivered on schedule. You get notifications, employees get surprises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Retention Section */}
        <div id="retention" className="py-20 bg-gradient-to-br from-pink-50 to-orange-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Boost Employee Retention</h2>
              <p className="text-xl text-gray-800">Create a culture of appreciation that keeps your best talent</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-pink-500 rounded-full p-3 flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Show You Care</h3>
                    <p className="text-gray-800">Regular recognition through personalized gifts shows employees they're valued beyond their work output.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-pink-500 rounded-full p-3 flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Build Stronger Bonds</h3>
                    <p className="text-gray-800">Celebrate personal milestones to create deeper connections between employees and your company.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-pink-500 rounded-full p-3 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Increase Engagement</h3>
                    <p className="text-gray-800">Recognized employees are 2.7x more likely to be highly engaged and stay with your company.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                  alt="Happy team collaboration"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                      <div className="text-4xl font-bold">47%</div>
                      <div>of employees would stay longer at a company that recognizes their work</div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                      <div className="text-4xl font-bold">56%</div>
                      <div>of employees say recognition is more important than salary</div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                      <div className="text-4xl font-bold">78%</div>
                      <div>of employees say recognition makes them more productive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-gradient-to-r from-gray-50 to-pink-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Built for HR Professionals</h2>
              <p className="text-xl text-gray-800">Everything you need to create a world-class employee experience</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
                    alt="Enterprise ready illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <Building2 className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Enterprise Ready</h3>
                <p className="text-gray-800">Scale from 10 to 10,000 employees with enterprise-grade security and compliance.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1506784693919-ef06d93c28d2?auto=format&fit=crop&q=80"
                    alt="Smart scheduling illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <Calendar className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Smart Scheduling</h3>
                <p className="text-gray-800">Never miss a birthday, work anniversary, or company milestone with intelligent automation.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"
                    alt="Personalized touch illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <Heart className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Personalized Touch</h3>
                <p className="text-gray-800">AI-powered gift selection based on employee profiles, interests, and preferences.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80"
                    alt="Data security illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <Shield className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Data Security</h3>
                <p className="text-gray-800">Bank-level encryption and GDPR compliance to keep employee data safe and secure.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80"
                    alt="Analytics illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <TrendingUp className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Analytics & Insights</h3>
                <p className="text-gray-800">Track engagement, measure ROI, and optimize your employee recognition program.</p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full mb-6 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80"
                    alt="HR integration illustration"
                    fill
                    className="object-cover"
                  />
                </div>
                <Briefcase className="w-12 h-12 text-pink-500 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">HR Integration</h3>
                <p className="text-gray-800">Seamlessly integrate with your existing HR tools and payroll systems.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Loved by HR Teams Everywhere</h2>
              <p className="text-xl text-gray-800">See what our customers have to say</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-800 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-700">{testimonial.role}</div>
                    <div className="text-sm text-pink-600">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Teaser */}
        <div id="pricing" className="py-20 bg-gradient-to-r from-pink-500 to-orange-400 text-white scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl mb-8">
              Starting at just $5 per employee per month. No hidden fees, no long-term contracts.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-8">
              <div className="text-5xl font-bold mb-2">$5</div>
              <div className="text-xl opacity-90">per employee/month</div>
              <div className="mt-4 text-pink-100">+ cost of gifts (you control the budget)</div>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Delight Your Employees?</h2>
            <p className="text-xl text-gray-800 mb-8">
              Join companies that have transformed their employee experience with automated gifting.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => openAuthModal('signup')}
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-orange-500 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                I Have an Account
              </button>
            </div>
            
            <div className="mt-8 text-sm text-gray-700">
              Free 14-day trial • No credit card required • Cancel anytime
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <Modal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          title={authModalMode === 'login' ? 'Log in to Your Business Account' : 'Create Your Business Account'}
        >
          <AuthForms
            initialMode={authModalMode}
            onSuccess={handleAuthSuccess}
          />
        </Modal>
      </div>
    </div>
  );
}