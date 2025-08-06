# Netlify Deployment Guide

## Environment Variables Setup

To enable full functionality with Supabase database, you need to set up environment variables in your Netlify deployment.

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `your-anon-key-here`
   - **Service Role Key**: `your-service-role-key-here` (optional)

### Step 2: Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your SEVIS PORTAL site
3. Go to **Site settings** > **Environment variables**
4. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Deploy site**
3. Wait for the build to complete

## Demo Mode (Current State)

If you don't set up the environment variables, the app will work in **Demo Mode**:

### Demo Accounts
- **Admin**: `admin@sevis.gov.pg` / `pawword`
- **User**: `user@example.com` / `pawword`

### Demo Features
- Registration will show "Demo: Account created successfully!"
- Login will work with any email + password `pawword`
- No actual database storage (demo only)

## Troubleshooting

### Registration Fails
- **Cause**: Supabase credentials not configured
- **Solution**: Set up environment variables or use demo mode

### Build Fails
- **Cause**: Invalid URLs in configuration
- **Solution**: Already fixed in latest version

### Login Issues
- **Cause**: Database not accessible
- **Solution**: Use demo accounts or configure Supabase

## Production Setup

For production deployment:

1. Set up proper Supabase project
2. Configure environment variables
3. Set up Row Level Security (RLS) policies
4. Test all functionality
5. Deploy to production

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables are set correctly
3. Test locally with `.env.local` file
4. Contact support if needed 