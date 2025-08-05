# SEVIS PORTAL - Demo Accounts

This document provides information about the demo accounts available for testing the SEVIS PORTAL authentication system.

## Available Demo Accounts

### Admin Account
- **Email**: `admin@sevis.gov.pg`
- **Password**: `pawword`
- **Role**: Administrator
- **Access**: Admin Dashboard with system statistics and application management

### User Account
- **Email**: `user@example.com`
- **Password**: `pawword`
- **Role**: Citizen/User
- **Access**: User Dashboard with personal applications and profile management

## How to Login

1. Navigate to the login page: `http://localhost:3001/login`
2. Choose the appropriate tab (Citizen/User Login or Admin Login)
3. Enter the credentials for the desired account
4. Click "Sign in"

## Account Features

### Admin Account Features
- **Overview Dashboard**: System-wide statistics and metrics
- **Application Management**: View and manage all user applications
- **Reports & Analytics**: System reports and analytics (placeholder)
- **System Settings**: Configuration settings (placeholder)
- **User Management**: Manage user accounts and permissions

### User Account Features
- **Personal Dashboard**: Overview of personal applications
- **Application Tracking**: View status and progress of submitted applications
- **Profile Management**: Update personal information and settings
- **Service Applications**: Submit new applications for government services
- **Document Upload**: Upload required documents for applications

## Testing Workflow

### Admin Testing
1. Login with admin credentials
2. Access admin dashboard
3. View system statistics
4. Navigate through different tabs
5. Test logout functionality

### User Testing
1. Login with user credentials
2. Access user dashboard
3. View personal applications
4. Navigate to service application form
5. Test the multi-step application process
6. Update profile information
7. Test logout functionality

## Security Notes

⚠️ **Important**: These are demo accounts for testing purposes only. In a production environment:

- Use strong, unique passwords
- Implement proper password hashing
- Add two-factor authentication
- Use secure session management
- Implement proper access controls
- Add rate limiting for login attempts

## Session Management

- Sessions are stored in localStorage for demo purposes
- Logout clears the session data
- Sessions persist across browser refreshes
- Clear browser data to reset sessions

## Troubleshooting

If you encounter login issues:

1. **Check credentials**: Ensure you're using the exact email and password
2. **Clear browser data**: Clear localStorage if session issues occur
3. **Check console**: Look for any JavaScript errors in browser console
4. **Server status**: Ensure the development server is running on port 3001

## Development Notes

- Authentication is currently client-side only (for demo purposes)
- User data is stored in localStorage
- No actual backend API calls are made
- All data is mock data for demonstration

---

**For support or questions, please refer to the main README.md file.** 