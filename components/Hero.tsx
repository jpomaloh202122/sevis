'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface HeroProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function Hero({ searchQuery, setSearchQuery }: HeroProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="relative bg-gradient-to-br from-png-black via-gray-900 to-png-black">
      <div className="absolute inset-0 bg-gradient-to-r from-png-gold/10 to-png-red/10"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="flex justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-md">
              <Image
                src="/images/hero/50years.jpg"
                alt="Papua New Guinea 50 Years Celebration"
                width={400}
                height={300}
                className="rounded-lg shadow-2xl w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="text-left order-1 lg:order-2">
            <h1 className="text-4xl font-bold tracking-tight text-png-white sm:text-6xl">
              Welcome to <span className="text-png-gold">SEVIS PORTAL</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-200 max-w-2xl">
              Your gateway to Papua New Guinea government services. Access public services, 
              apply for permits, and connect with government departments all in one place.
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 max-w-lg">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for government services..."
                    className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg shadow-lg focus:ring-2 focus:ring-png-gold focus:ring-opacity-50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-png-red hover:bg-red-700 text-png-white px-6 py-2 rounded-md font-semibold transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-png-gold">50+</div>
                <div className="text-gray-200 text-sm">Government Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-png-gold">24/7</div>
                <div className="text-gray-200 text-sm">Online Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-png-gold">100%</div>
                <div className="text-gray-200 text-sm">Secure & Reliable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 