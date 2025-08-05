# SEVIS PORTAL - Papua New Guinea Government Services

A modern, comprehensive e-government portal for Papua New Guinea, providing citizens and businesses with easy access to government services.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Papua New Guinea's national colors
- **Authentication System**: User and admin login/logout functionality with role-based access
- **User Dashboard**: Track service applications and manage personal profile
- **Admin Dashboard**: Monitor system statistics and manage applications
- **Service Applications**: Multi-step online application forms
- **Comprehensive Services**: 50+ government services across multiple categories
- **Search & Filter**: Advanced search and filtering capabilities
- **Mobile Responsive**: Optimized for all devices and screen sizes
- **Accessibility**: WCAG compliant design for inclusive access
- **News & Updates**: Real-time government announcements and news
- **Contact Support**: Multiple contact methods and support channels

## 🔐 Authentication System

### User Types
- **Citizens/Users**: Register, login, apply for services, track applications
- **Administrators**: Access admin dashboard, view statistics, manage applications

### Features
- **Session Management**: Persistent login state using localStorage
- **Role-based Access**: Different dashboards for users and admins
- **Form Validation**: Client-side validation for all forms
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during authentication

### Login Process
- **User Login**: Access to personal dashboard and service applications
- **Admin Login**: Access to admin dashboard with system statistics
- **Registration**: New user account creation with validation
- **Logout**: Secure session termination

## 📊 Dashboard Features

### User Dashboard
- **Overview Tab**: Quick statistics and recent applications
- **Applications Tab**: Complete application tracking with progress bars
- **Profile Tab**: Personal information and account settings

### Admin Dashboard
- **Overview Tab**: System-wide statistics and popular services
- **Applications Tab**: Complete application management interface
- **Reports Tab**: Analytics and reporting tools
- **Settings Tab**: System configuration and management

## 📝 Service Application System

### Multi-step Application Process
1. **Service Selection**: Choose from available government services
2. **Form Completion**: Fill required information and upload documents
3. **Submission**: Review and submit application
4. **Confirmation**: Receive application ID and status

### Supported Services
- Business Registration
- Driver License Renewal
- National ID Application
- Tax Registration
- Building Permits

### Features
- **Progress Tracking**: Visual progress indicators
- **Document Upload**: Support for multiple file types
- **Form Validation**: Real-time validation feedback
- **Application ID**: Unique tracking numbers
- **Status Updates**: Real-time application status

## 🏗️ Service Categories

- **Citizen Services**: National ID, Birth Certificate, Passport, Voter Registration
- **Business & Commerce**: Business Registration, Trade Licenses, Import/Export Permits
- **Health Services**: Medical Certificates, Health Insurance, Vaccination Records
- **Transportation**: Driver License, Vehicle Registration, Road Tax Payment
- **Legal Services**: Legal Documents, Court Services, Property Registration
- **Public Safety**: Police Clearance, Security Licenses, Emergency Services

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **UI Components**: Headless UI
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Authentication**: Custom auth context with localStorage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SEVISPORTAL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
SEVISPORTAL/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Homepage
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   ├── services/          # Services pages
│   │   └── apply/         # Service application form
│   ├── contact/           # Contact page
│   └── ...
├── components/            # React components
│   ├── Header.tsx         # Navigation header with auth
│   ├── Hero.tsx           # Hero section
│   ├── QuickAccess.tsx    # Quick access services
│   ├── ServicesGrid.tsx   # Services grid
│   ├── NewsSection.tsx    # News and announcements
│   └── Footer.tsx         # Footer component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## 🔐 Authentication Implementation

### AuthContext (`contexts/AuthContext.tsx`)
- Manages user authentication state
- Provides login/logout functions
- Handles session persistence
- Role-based access control

### Key Features
- **User Registration**: Complete registration form with validation
- **User Login**: Tabbed interface for user and admin login
- **Session Persistence**: Automatic login state restoration
- **Role-based Navigation**: Different dashboards based on user role
- **Secure Logout**: Proper session cleanup

## 🎨 Design System

### Colors
- **Primary Red**: `#CE1126` (PNG National Color)
- **Black**: `#000000` (Text and backgrounds)
- **Gold**: `#FFD700` (Accent color)
- **White**: `#FFFFFF` (Backgrounds and text)
- **Government Blue**: `#1E40AF`
- **Government Green**: `#059669`
- **Government Orange**: `#EA580C`
- **Government Purple**: `#7C3AED`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with PNG-specific colors and design tokens.

### TypeScript
Strict TypeScript configuration for better development experience and type safety.

## 📱 Responsive Design

The portal is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators

## 🔒 Security Features

### Current Implementation
- Client-side authentication (for demo purposes)
- localStorage for session persistence
- Form validation and sanitization

### Production Recommendations
- Implement server-side authentication
- Use secure HTTP-only cookies
- Add CSRF protection
- Implement rate limiting
- Add input sanitization
- Use HTTPS only
- Implement proper password hashing

## 📊 Performance

- Optimized images and assets
- Code splitting
- Lazy loading
- SEO optimized
- Fast loading times

## 🧪 Testing

### Demo Accounts
For testing purposes, the following demo accounts are available:

**Admin Account:**
- Email: `admin@sevis.gov.pg`
- Password: `pawword`

**User Account:**
- Email: `user@example.com`
- Password: `pawword`

See `DEMO_ACCOUNTS.md` for detailed testing instructions.

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Admin login and dashboard access
- [ ] Service application submission
- [ ] Dashboard navigation and tabs
- [ ] Form validation and error handling
- [ ] Responsive design on mobile
- [ ] Logout functionality
- [ ] Session persistence

### Automated Testing (Future)
- Unit tests for components
- Integration tests for authentication
- E2E tests for user workflows
- API endpoint testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@sevis.gov.pg
- Phone: +675 123 4567
- Website: [Contact Page](/contact)

## 🗺️ Roadmap

### Phase 1 (Completed)
- ✅ Basic portal structure
- ✅ Service catalog
- ✅ Contact forms
- ✅ News section
- ✅ User authentication and profiles
- ✅ Online application forms
- ✅ User and admin dashboards
- ✅ Service application tracking
- ✅ Multi-step application process

### Phase 2 (Planned)
- 🔄 Payment integration
- 🔄 Real-time status tracking
- 🔄 Document verification system
- 🔄 Email notifications
- 🔄 Advanced reporting and analytics

### Phase 3 (Future)
- 📋 Multi-language support
- 📋 Mobile app development
- 📋 API integration with government systems
- 📋 Two-factor authentication
- 📋 Role-based permissions
- 📋 Advanced security features

## 🙏 Acknowledgments

- Government of Papua New Guinea
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for the beautiful icons

---

**Built with ❤️ for the people of Papua New Guinea** 