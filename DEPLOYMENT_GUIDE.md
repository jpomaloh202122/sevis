# SEVIS Portal Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the SEVIS Portal to various hosting platforms with production-ready configurations.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Netlify Deployment](#netlify-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Custom Server Deployment](#custom-server-deployment)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- **Supabase Account**: PostgreSQL database hosting
- **Email Service**: Resend (recommended) or alternative SMTP service
- **SMS Service**: Twilio account for SMS verification
- **Domain Name**: Custom domain for production deployment
- **SSL Certificate**: HTTPS encryption (usually provided by hosting platform)

### Development Requirements
- Node.js 18+ and npm
- Git for version control
- Code editor (VS Code recommended)
- Command line interface

## Environment Configuration

### Production Environment Variables
Create a comprehensive environment configuration for production:

```bash
# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Primary - Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@your-domain.com

# Email Configuration (Backup - Brevo/SendinBlue)
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@your-domain.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security Configuration
NEXTAUTH_SECRET=your_super_secure_random_string_here
NEXTAUTH_URL=https://your-domain.com

# Monitoring and Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your_sentry_dsn
```

### Environment Variable Security
- Never commit `.env` files to version control
- Use hosting platform's environment variable management
- Rotate sensitive keys regularly
- Use different keys for staging and production

## Database Setup

### Supabase Production Configuration

#### 1. Create Production Database
```bash
# Create new Supabase project for production
# Note: Use a different project from development
```

#### 2. Execute Database Schema
```sql
-- Run the complete schema in Supabase SQL Editor
-- File: database/schema.sql
```

#### 3. Configure Row Level Security
```sql
-- Ensure RLS policies are properly configured
-- File: database/fix-rls-policies.sql
```

#### 4. Create Initial Admin Account
```sql
-- After deployment, create admin account:
INSERT INTO users (email, name, role, password_hash, email_verified, phone, national_id)
VALUES (
  'admin@your-domain.com',
  'System Administrator',
  'admin',
  '$2b$10$hashedpasswordhere',
  true,
  '+1234567890',
  'ADMIN001'
);
```

#### 5. Database Optimization
```sql
-- Create additional indexes for production
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_reference_number 
ON applications(reference_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_service_status 
ON applications(service_name, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
ON users(role);
```

## Netlify Deployment

### Automatic Deployment from Git

#### 1. Connect Repository
1. Log in to Netlify
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the SEVIS Portal repository
5. Configure build settings

#### 2. Build Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### 3. Environment Variables Setup
In Netlify dashboard, go to Site settings → Environment variables:

```
NODE_ENV = production
NEXT_PUBLIC_BASE_URL = https://your-site.netlify.app
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
RESEND_API_KEY = your_resend_key
RESEND_FROM_EMAIL = noreply@your-domain.com
TWILIO_ACCOUNT_SID = your_twilio_sid
TWILIO_AUTH_TOKEN = your_twilio_token
TWILIO_PHONE_NUMBER = your_twilio_number
```

#### 4. Custom Domain Setup
1. Go to Domain management in Netlify
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify's load balancer)
   ```
4. Enable HTTPS (automatic with Let's Encrypt)

### Manual Deployment

#### 1. Build Locally
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Export static files (if using static export)
npm run export
```

#### 2. Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to draft URL
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Vercel Deployment

### Automatic Deployment

#### 1. Import Project
1. Go to Vercel dashboard
2. Click "New Project"
3. Import from Git repository
4. Select SEVIS Portal repository

#### 2. Configure Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### 3. Environment Variables
Add in Vercel dashboard under Settings → Environment Variables:
```
NODE_ENV = production
NEXT_PUBLIC_BASE_URL = https://your-domain.vercel.app
[... all other environment variables ...]
```

#### 4. Custom Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as provided by Vercel

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Docker Deployment

### Dockerfile Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  sevis-portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=https://your-domain.com
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    env_file:
      - .env.production
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.sevis.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.sevis.tls=true"
      - "traefik.http.routers.sevis.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v2.10
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "./traefik.yml:/traefik.yml"
      - "./acme.json:/acme.json"
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build the image
docker build -t sevis-portal .

# Run the container
docker run -p 3000:3000 --env-file .env.production sevis-portal

# Or use Docker Compose
docker-compose up -d
```

## Custom Server Deployment

### Ubuntu/Debian Server Setup

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/sevis-portal.git
cd sevis-portal

# Install dependencies
npm install

# Build application
npm run build

# Create production environment file
cp .env.local.template .env.production
# Edit .env.production with production values
```

#### 3. PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sevis-portal',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/sevis-portal',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/sevis-portal
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sevis-portal /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Post-Deployment Configuration

### 1. SSL Certificate Setup
```bash
# Using Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 2. Create Initial Admin Account
Visit your deployed application and register, then update the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@domain.com';
```

### 3. Configure Email Domain Verification
Add these DNS records for email services:

**For Resend:**
```
Type: TXT
Name: _resend
Value: resend-verify=your-verification-code
```

**For custom domain emails:**
```
Type: MX
Name: @
Value: 10 mx.resend.com
```

### 4. Test All Functionality
- User registration and verification
- Email and SMS services
- Application submission
- Admin dashboard access
- Document upload/download
- QR code generation

## Monitoring and Maintenance

### Application Monitoring

#### 1. Error Tracking with Sentry
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### 2. Performance Monitoring
```javascript
// lib/analytics.js
export const trackEvent = (eventName, properties) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};
```

### Database Monitoring

#### 1. Supabase Monitoring
- Monitor database performance in Supabase dashboard
- Set up alerts for high CPU/memory usage
- Review slow query logs regularly

#### 2. Backup Strategy
```sql
-- Create automated backups in Supabase
-- Configure backup retention policy
-- Test restore procedures regularly
```

### Server Monitoring (Self-hosted)

#### 1. System Resources
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor PM2 processes
pm2 monit

# Monitor logs
pm2 logs sevis-portal
```

#### 2. Automated Health Checks
```bash
# Create health check script
#!/bin/bash
# health-check.sh

HEALTH_ENDPOINT="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)

if [ $RESPONSE != "200" ]; then
    echo "Application health check failed with response code: $RESPONSE"
    # Send alert notification
    # Restart application if needed
    pm2 restart sevis-portal
fi
```

```bash
# Add to crontab for regular checks
# crontab -e
*/5 * * * * /path/to/health-check.sh
```

## Troubleshooting

### Common Deployment Issues

#### 1. Environment Variables Not Loading
```bash
# Check if environment variables are set
printenv | grep NEXT_PUBLIC

# Verify .env file location and syntax
cat .env.production

# Check build logs for missing variables
npm run build 2>&1 | grep -i error
```

#### 2. Database Connection Issues
```bash
# Test database connection
node -e "
const { supabase } = require('./lib/supabase');
supabase.from('users').select('count').then(console.log);
"
```

#### 3. Email Service Issues
```bash
# Test email sending
curl -X POST https://your-domain.com/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test"}'
```

#### 4. SSL Certificate Issues
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'pending';

-- Create missing indexes
CREATE INDEX CONCURRENTLY idx_applications_performance 
ON applications(status, submitted_at);
```

#### 2. Application Optimization
```javascript
// next.config.js - Production optimizations
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  }
};
```

#### 3. CDN Configuration
Set up CloudFlare or similar CDN for static assets:
- Configure caching rules
- Enable compression
- Set up page rules for performance

### Scaling Considerations

#### Horizontal Scaling
```bash
# Scale PM2 processes
pm2 scale sevis-portal +2

# Load balancer configuration
# Configure Nginx upstream servers
upstream sevis_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

#### Database Scaling
- Configure Supabase read replicas
- Implement database connection pooling
- Consider database partitioning for large datasets

### Security Hardening

#### 1. Server Security
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

#### 2. Application Security
```javascript
// Security headers in next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

---

## Conclusion

This deployment guide covers various deployment scenarios for the SEVIS Portal. Choose the deployment method that best fits your infrastructure requirements and technical expertise.

For additional support or custom deployment scenarios, refer to the main project documentation or contact the development team.

---

*Last Updated: December 2024*