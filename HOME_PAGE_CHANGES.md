# Home Page Changes Summary

## Changes Made

### 1. Disabled News and Announcements Section

**File**: `app/page.tsx`

**Changes**:
- Commented out the import for `NewsSection` component
- Removed `<NewsSection />` from the page render with a comment explaining it's disabled

**Before**:
```tsx
import NewsSection from '@/components/NewsSection'
...
<ComprehensiveServices />
<NewsSection />
<Footer />
```

**After**:
```tsx
// import NewsSection from '@/components/NewsSection' // Disabled
...
<ComprehensiveServices />
{/* <NewsSection /> Disabled news and announcements */}
<Footer />
```

### 2. Added Public Servant Pass to G2G Services Section

**File**: `components/ComprehensiveServices.tsx`

**Changes**:
- Added Public Servant Pass as the first service in the `g2gServices` array
- Set status as 'available' so users can access it immediately
- Linked to the correct service page at `/services/g2g/public-servant-pass`

**Addition**:
```tsx
const g2gServices: Service[] = [
  {
    name: 'Public Servant Pass',
    description: 'Digital identity and authentication system for Papua New Guinea government employees. Apply for secure G2G access credentials.',
    status: 'available',
    link: '/services/g2g/public-servant-pass'
  },
  // ... existing services
]
```

## Result

### Home Page Updates
1. **Cleaner Layout**: News and announcements section no longer appears, making the page more focused on services
2. **Public Servant Pass Visible**: The service now appears prominently in the G2G section with:
   - Green "Available" status badge
   - "Access Service" link that takes users to the registration page
   - Clear description of the service

### G2G Section Status
- **Before**: 0 of 8 services available (all internal)
- **After**: 1 of 9 services available (Public Servant Pass is now accessible to users)

### User Experience
- Users can now easily find and access the Public Servant Pass application from the home page
- The G2G section shows it has available services, encouraging government employees to explore
- Direct link takes users to the comprehensive service information and registration form

## Files Modified
1. `app/page.tsx` - Disabled news section
2. `components/ComprehensiveServices.tsx` - Added Public Servant Pass to G2G services

## Testing
- TypeScript compilation passes without errors
- Service card displays with correct styling and "Available" status
- Link points to correct service page at `/services/g2g/public-servant-pass`

The Public Servant Pass registration service is now prominently displayed and easily accessible from the home page's G2G services section.