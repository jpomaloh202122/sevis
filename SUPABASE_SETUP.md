# Supabase Setup Guide for SEVIS PORTAL

This guide will help you set up Supabase as your database backend for the SEVIS PORTAL.

## 🚀 Step 1: Create a Supabase Project

1. **Visit [supabase.com](https://supabase.com)** and sign up/login
2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: `sevis-portal`
   - Enter database password (save this!)
   - Choose region closest to your users
   - Click "Create new project"

## 🔑 Step 2: Get Your Project Credentials

1. **Go to Project Settings**:
   - In your Supabase dashboard, click the gear icon (Settings)
   - Click "API" in the sidebar

2. **Copy the credentials**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `your-anon-key-here`
   - **Service Role Key**: `your-service-role-key-here` (keep this secret!)

## 📝 Step 3: Set Up Environment Variables

1. **Create `.env.local` file** in your project root:
   ```bash
   # Create the file
   touch .env.local
   ```

2. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Replace the placeholder values** with your actual credentials

## 🗄️ Step 4: Set Up Database Schema

1. **Open Supabase SQL Editor**:
   - In your Supabase dashboard, click "SQL Editor"
   - Click "New query"

2. **Run the schema script**:
   - Copy the contents of `database/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify tables are created**:
   - Go to "Table Editor" in the sidebar
   - You should see: `users`, `services`, `applications`

## 🔐 Step 5: Configure Authentication (Optional)

If you want to use Supabase Auth instead of custom auth:

1. **Go to Authentication Settings**:
   - Click "Authentication" in the sidebar
   - Click "Settings"

2. **Configure providers**:
   - Enable "Email" provider
   - Configure any additional providers (Google, GitHub, etc.)

3. **Update auth context** to use Supabase Auth

## 🧪 Step 6: Test the Connection

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test database operations**:
   - Try logging in with demo accounts
   - Check if data is being saved/retrieved
   - Monitor the Network tab in browser dev tools

## 📊 Step 7: Monitor Your Database

1. **View real-time data**:
   - Go to "Table Editor" in Supabase dashboard
   - You can view and edit data directly

2. **Check logs**:
   - Go to "Logs" in the sidebar
   - Monitor API requests and errors

3. **Set up alerts** (optional):
   - Configure email alerts for errors
   - Set up monitoring for performance

## 🔧 Step 8: Production Deployment

1. **Update environment variables** for production:
   - Use the same Supabase project
   - Update your deployment platform's environment variables

2. **Configure CORS** (if needed):
   - Go to "Settings" > "API"
   - Add your production domain to allowed origins

3. **Set up backups**:
   - Supabase provides automatic backups
   - Consider setting up additional backup strategies

## 🛠️ Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Check your environment variables
   - Ensure you're using the correct keys
   - Restart your development server

2. **"Table doesn't exist" error**:
   - Run the schema.sql script again
   - Check if tables were created in Table Editor

3. **CORS errors**:
   - Add your domain to Supabase CORS settings
   - Check browser console for specific errors

4. **Authentication issues**:
   - Verify RLS policies are set up correctly
   - Check user permissions and roles

### Getting Help:

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Discord Community**: [discord.gg/supabase](https://discord.gg/supabase)
- **GitHub Issues**: Create an issue in your repository

## 📈 Next Steps

After setup, you can:

1. **Customize the schema** for your specific needs
2. **Add more tables** for additional features
3. **Set up real-time subscriptions** for live updates
4. **Implement file storage** for document uploads
5. **Add email notifications** using Supabase Edge Functions
6. **Set up analytics** and monitoring

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use Row Level Security (RLS)** for data protection
3. **Validate all inputs** on both client and server
4. **Regularly rotate API keys**
5. **Monitor for suspicious activity**
6. **Keep dependencies updated**

---

**Your SEVIS PORTAL is now connected to Supabase! 🎉**

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in your repository. 