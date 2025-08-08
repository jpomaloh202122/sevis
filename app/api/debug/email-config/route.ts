import { NextResponse } from 'next/server'

export async function GET() {
  // Only show this in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG !== 'true') {
    return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 404 })
  }

  const config = {
    host: process.env.BREVO_SMTP_HOST ? 'SET' : 'MISSING',
    port: process.env.BREVO_SMTP_PORT ? 'SET' : 'MISSING', 
    user: process.env.BREVO_SMTP_USER ? 'SET' : 'MISSING',
    password: process.env.BREVO_SMTP_PASSWORD ? 'SET' : 'MISSING',
    fromEmail: process.env.BREVO_FROM_EMAIL ? 'SET' : 'MISSING',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET'
  }

  return NextResponse.json({ 
    message: 'Email Configuration Status',
    config,
    allConfigured: Object.values(config).every(val => val === 'SET' || val !== 'NOT SET')
  })
}