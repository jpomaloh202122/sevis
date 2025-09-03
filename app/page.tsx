'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ServicesGrid from '@/components/ServicesGrid'
// import NewsSection from '@/components/NewsSection' // Disabled
import Footer from '@/components/Footer'
import QuickAccess from '@/components/QuickAccess'
import ComprehensiveServices from '@/components/ComprehensiveServices'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen">
      <Header />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <QuickAccess />
      <ComprehensiveServices />
      {/* <NewsSection /> Disabled news and announcements */}
      <Footer />
    </main>
  )
} 