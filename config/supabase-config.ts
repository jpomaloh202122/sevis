// Supabase Configuration
// Copy this file to .env.local and replace with your actual values

export const SUPABASE_CONFIG = {
  // Your Supabase project URL (found in your project settings)
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  
  // Your Supabase anon/public key (found in your project settings)
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  
  // Optional: Service role key for admin operations
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
}

// Environment variables you need to set in .env.local:
/*
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
*/ 