'use client'

import { useState, useEffect, useRef } from 'react'
import { Bars3Icon, XMarkIcon, UserCircleIcon, UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if user is admin
  const isAdmin = user && ['admin', 'super_admin', 'approving_admin', 'vetting_admin'].includes(user.role)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-black shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">SEVIS PORTAL</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 relative">
                <Image
                  src="/logos/newlogo.png"
                  alt="SEVIS PORTAL Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SEVIS PORTAL</h1>
                <p className="text-sm text-gray-300">Government of PNG</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
               <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                 <div className="flex items-center space-x-4">
                   {user ? (
                     <>
                       <div className="flex items-center space-x-3">
                         {user.photoUrl ? (
                           <img 
                             src={user.photoUrl} 
                             alt={user.name}
                             className="h-8 w-8 rounded-full object-cover border-2 border-white"
                           />
                         ) : (
                           <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                             <UserIcon className="h-5 w-5 text-white" />
                           </div>
                         )}
                         <span className="text-sm text-gray-300">
                           Welcome, {user.name}
                         </span>
                       </div>

                       {/* User Hamburger Menu (All logged-in users) */}
                       <div className="relative" ref={dropdownRef}>
                         <button
                           onClick={() => setUserMenuOpen(!userMenuOpen)}
                           className="inline-flex items-center space-x-1 text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors"
                         >
                           <Bars3Icon className="h-5 w-5" />
                           <ChevronDownIcon className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                         </button>

                         {/* Dropdown Menu */}
                         {userMenuOpen && (
                           <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                             {/* Admin Dashboard - Only for Admins */}
                             {isAdmin && (
                               <Link 
                                 href="/admin"
                                 onClick={() => setUserMenuOpen(false)}
                                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                               >
                                 <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                 </svg>
                                 Admin Dashboard
                               </Link>
                             )}

                             {/* Regular Dashboard - Only for Regular Users */}
                             {!isAdmin && (
                               <Link 
                                 href="/dashboard"
                                 onClick={() => setUserMenuOpen(false)}
                                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                               >
                                 <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                 </svg>
                                 Dashboard
                               </Link>
                             )}

                             {/* Cards - For All Users */}
                             <Link 
                               href="/dashboard/cards"
                               onClick={() => setUserMenuOpen(false)}
                               className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                             >
                               <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                               </svg>
                               My Cards
                             </Link>

                             {/* Profile - For All Users */}
                             <Link 
                               href="/dashboard/profile"
                               onClick={() => setUserMenuOpen(false)}
                               className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                             >
                               <UserIcon className="w-4 h-4 mr-3" />
                               Profile
                             </Link>

                             {/* Separator */}
                             <div className="border-t border-gray-100"></div>

                             {/* Logout - For All Users */}
                             <button 
                               onClick={() => {
                                 setUserMenuOpen(false)
                                 logout()
                               }}
                               className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                             >
                               <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                               </svg>
                               Logout
                             </button>
                           </div>
                         )}
                       </div>
                     </>
                   ) : (
                     <>
                       <Link href="/register" className="text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors">
                         Register
                       </Link>
                       <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors">
                         <UserCircleIcon className="h-6 w-6 inline mr-1" />
                         Login
                       </Link>
                     </>
                   )}
                 </div>
               </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">SEVIS PORTAL</span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 relative">
                    <Image
                      src="/logos/newlogo.png"
                      alt="SEVIS PORTAL Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-lg font-bold text-white">SEVIS PORTAL</span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-white hover:text-png-red transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center px-3 py-2 mb-4">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-white mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-300 text-sm capitalize">{user.role.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Admin Menu Items */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}

                      {/* Regular User Dashboard */}
                      {!isAdmin && (
                        <Link
                          href="/dashboard"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          Dashboard
                        </Link>
                      )}

                      {/* Cards Link */}
                      <Link
                        href="/dashboard/cards"
                        className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        My Cards
                      </Link>

                      {/* Profile Link */}
                      <Link
                        href="/dashboard/profile"
                        className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="w-5 h-5 mr-3" />
                        Profile
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          logout()
                        }}
                        className="-mx-3 flex items-center w-full rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 