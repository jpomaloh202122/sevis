'use client'

import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const newsItems = [
  {
    id: 1,
    title: 'New Online Business Registration System Launched',
    excerpt: 'The government has launched a new streamlined online business registration system to make it easier for entrepreneurs to start their businesses.',
    date: '2024-01-15',
    time: '10:30 AM',
    category: 'Business',
    image: '/api/placeholder/400/200',
    featured: true
  },
  {
    id: 2,
    title: 'Updated National ID Application Process',
    excerpt: 'The national ID application process has been updated with new requirements and faster processing times.',
    date: '2024-01-12',
    time: '2:15 PM',
    category: 'Citizen Services',
    image: '/api/placeholder/400/200',
    featured: false
  },
  {
    id: 3,
    title: 'Tax Filing Deadline Extended',
    excerpt: 'The deadline for filing annual tax returns has been extended to provide relief to taxpayers affected by recent events.',
    date: '2024-01-10',
    time: '9:00 AM',
    category: 'Tax Services',
    image: '/api/placeholder/400/200',
    featured: false
  },
  {
    id: 4,
    title: 'New Health Services Portal Available',
    excerpt: 'A new comprehensive health services portal is now available for accessing medical certificates and health records.',
    date: '2024-01-08',
    time: '11:45 AM',
    category: 'Health Services',
    image: '/api/placeholder/400/200',
    featured: false
  }
]

export default function NewsSection() {
  return (
    <section className="py-16 bg-png-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-png-black sm:text-4xl">
              Latest News & Announcements
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Stay updated with the latest government news and service announcements
            </p>
          </div>
          <Link
            href="/news"
            className="btn-secondary"
          >
            View All News
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          {newsItems.filter(item => item.featured).map((item) => (
            <div key={item.id} className="lg:col-span-2">
              <div className="bg-gradient-to-r from-png-black to-gray-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-8 text-white">
                  <div className="flex items-center mb-4">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                    <span className="ml-4 text-sm opacity-90">Featured</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-lg opacity-90 mb-6">{item.excerpt}</p>
                  <div className="flex items-center text-sm opacity-75">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    <ClockIcon className="h-4 w-4 ml-4 mr-1" />
                    {item.time}
                  </div>
                  <Link
                    href={`/news/${item.id}`}
                    className="inline-flex items-center mt-6 text-white font-semibold hover:underline"
                  >
                    Read More
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Regular News Items */}
          {newsItems.filter(item => !item.featured).map((item) => (
            <div key={item.id} className="bg-png-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <span className="bg-png-gold/20 text-png-black px-3 py-1 rounded-full text-sm font-medium">
                  {item.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-png-black mb-3 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {item.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  <ClockIcon className="h-4 w-4 ml-4 mr-1" />
                  {item.time}
                </div>
                <Link
                  href={`/news/${item.id}`}
                  className="text-png-red hover:text-red-700 font-medium text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Alerts */}
        <div className="mt-12 bg-png-gold/10 border border-png-gold/30 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-png-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-png-black">
                Important Notice
              </h3>
              <p className="mt-2 text-gray-700">
                Due to system maintenance, some services may experience temporary interruptions on Sunday, January 21st, 2024 from 2:00 AM to 6:00 AM. We apologize for any inconvenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 