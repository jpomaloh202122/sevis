# Netlify Email Setup Guide

## Best Options for Netlify Email Delivery

### Option 1: Resend (Recommended) ⭐
**Perfect for Netlify deployments - Modern, reliable, great free tier**

#### Setup Steps:
1. **Sign up at [Resend.com](https://resend.com)**
   - Free tier: 3,000 emails/month
   - No credit card required
   - Excellent deliverability

2. **Get your API key**
   - Go to API Keys section
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Add to Netlify Environment Variables**
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Done!** Your verification emails will now use Resend

#### Why Resend is great for Netlify:
- ✅ Simple REST API (no SMTP configuration)
- ✅ Works perfectly with serverless functions
- ✅ Modern, clean email templates
- ✅ Great deliverability rates
- ✅ Detailed analytics and logs
- ✅ Free tier is generous

---

### Option 2: EmailJS (Alternative)
**Client-side email service that works with Netlify**

#### Setup Steps:
1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create email service (Gmail, Outlook, etc.)
3. Create email template
4. Add to environment variables:
   ```
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   EMAILJS_PUBLIC_KEY=your_public_key
   ```

---

### Option 3: Keep Brevo but Fix Netlify Config
**If you want to stick with your current setup**

#### Add these to Netlify Environment Variables:
```
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=9441e2001@smtp-brevo.com
BREVO_SMTP_PASSWORD=VwYkaSG0fqgnvbLI
BREVO_FROM_EMAIL=Joshua <pomalohjoshua@gmail.com>
NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
```

---

## How to Add Environment Variables in Netlify

1. **Go to Netlify Dashboard**
2. **Select your site**
3. **Go to Site Settings → Environment Variables**
4. **Click "Add a variable"**
5. **Add each variable one by one**
6. **Redeploy your site** (important!)

---

## Testing Your Setup

### Test API Endpoint
After deployment, test with:
```bash
POST https://your-site.netlify.app/api/test/email
Content-Type: application/json

{
  "email": "your-test-email@gmail.com",
  "testKey": "test123"
}
```

### Check Configuration
Visit: `https://your-site.netlify.app/api/debug/email-config`

---

## Current Implementation

Your app now supports **multiple email providers** with automatic fallback:

1. **First choice**: Resend (if `RESEND_API_KEY` is set)
2. **Fallback**: Brevo SMTP (if SMTP vars are set)  
3. **Last resort**: Demo mode (logs only)

This ensures your verification emails work regardless of which service you choose!

---

## Recommendation

**Use Resend** - it's specifically designed for applications like yours and works flawlessly with Netlify. The setup is just one environment variable, and you get better email templates and deliverability.

Just add `RESEND_API_KEY=re_your_key` to Netlify and you're done! 🚀