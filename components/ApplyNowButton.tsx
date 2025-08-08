"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ApplyNowButtonProps {
  href: string
  className?: string
  children?: React.ReactNode
}

export default function ApplyNowButton({ href, className = '', children }: ApplyNowButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault()
    if (!user) {
      const redirect = encodeURIComponent(href)
      router.push(`/login?redirect=${redirect}`)
    } else {
      router.push(href)
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children || 'Apply Now'}
    </button>
  )
}
