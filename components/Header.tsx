'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Departments', href: '/departments' },
  { name: 'News', href: '/news' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

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
                       <span className="text-sm text-gray-300">
                         Welcome, {user.name}
                       </span>
                       <Link 
                         href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                         className="text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors"
                       >
                         {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                       </Link>
                       <button 
                         onClick={logout}
                         className="text-sm font-semibold leading-6 text-white hover:text-png-red transition-colors"
                       >
                         Logout
                       </button>
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
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:text-png-red transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 