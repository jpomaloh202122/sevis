import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SEVIS PORTAL - Papua New Guinea Government Services',
  description: 'Official government services portal for Papua New Guinea. Access public services, apply for permits, and connect with government departments.',
  keywords: 'Papua New Guinea, government services, SEVIS, e-government, public services',
  authors: [{ name: 'Government of Papua New Guinea' }],
  icons: {
    icon: '/logos/newlogo.png',
    apple: '/logos/newlogo.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 