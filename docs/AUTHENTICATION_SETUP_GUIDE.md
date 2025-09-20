# AstroCal Authentication Setup Guide

This guide covers the Phase 1 authentication implementation for AstroCal, including email/password authentication, user profiles, and protected routes.

## 🎯 Phase 1 Overview

Phase 1 establishes the core authentication foundation:
- Email/password authentication with Supabase Auth
- Google OAuth integration for seamless sign-in
- Automatic user profile creation
- Row Level Security (RLS) for data isolation
- Session management across browser sessions
- Protected dashboard with empty state (as planned)

## 📁 Project Structure

```
/
├── index.html          # Public landing page with waitlist
├── auth.html           # Dedicated login/signup page
├── dashboard.html      # Protected dashboard (Phase 1: empty)
├── styles.css          # Enhanced with auth navigation styles
├── script.js           # Session management & email functionality
├── supabase-config.js  # Supabase configuration
└── supabase-schema.sql # Complete database schema with RLS
```

## 🔧 Setup Instructions

### 1. Supabase Project Setup

1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project: "AstroCal"
   - Note your Project URL and anon key

2. **Update Configuration**:
   ```javascript
   // supabase-config.js
   const SUPABASE_CONFIG = {
       url: 'https://your-project-id.supabase.co',
       anonKey: 'your-anon-key-here'
   };
   ```

### 2. Database Schema Setup

1. **Execute Schema**:
   - Open Supabase SQL Editor
   - Copy content from `supabase-schema.sql`
   - Execute the script

2. **Schema Includes**:
   - `waitlist_emails` table for landing page signups
   - `profiles` table extending auth.users
   - RLS policies for data protection
   - Automatic profile creation trigger
   - Proper permissions and indexes

### 3. Authentication Settings

1. **Configure Auth**:
   - Go to Authentication > Settings
   - Set Site URL: `http://localhost:3000` (development) or your domain
   - Email confirmations: Optional for development
   - Password requirements: Minimum 6 characters (Supabase default)

### 4. Google OAuth Setup

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API (if not already enabled)
   - Go to "Credentials" and create OAuth 2.0 Client ID
   - Set Application type to "Web application"
   - Add authorized redirect URIs:
     - Development: `https://your-project-id.supabase.co/auth/v1/callback`
     - Production: `https://your-project-id.supabase.co/auth/v1/callback`

2. **Supabase OAuth Configuration**:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret
   - Save configuration

3. **OAuth Redirect Configuration**:
   - In Supabase Dashboard > Authentication > URL Configuration
   - Add redirect URLs:
     - `http://localhost:3000/auth/` (development)
     - `https://yourdomain.com/auth/` (production)

## 🎨 User Interface

### Navigation
- **Public**: Shows "Sign In" and "Get Started" buttons
- **Authenticated**: Shows "Dashboard" and "Sign Out" buttons
- **Responsive**: Adapts to mobile screens
- **Consistent**: Follows existing AstroCal design system

### Authentication Page (`auth.html`)
- **Dual Mode**: Toggle between login and signup
- **Google OAuth**: One-click sign-in with Google
- **Form Validation**: Client-side and server-side validation
- **Password Strength**: Real-time strength indicator
- **Error Handling**: Clear, user-friendly error messages
- **Responsive Design**: Mobile-optimized layout

### Dashboard (`dashboard.html`)
- **Protected Route**: Requires authentication
- **Empty State**: Shows coming features as per Phase 1 plan
- **Feature Preview**: Cards showing upcoming functionality
- **User Context**: Displays user name and email
- **Secure Logout**: Proper session termination

## 🔒 Security Implementation

### Row Level Security (RLS)
```sql
-- Profiles table policies
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Waitlist emails policies  
CREATE POLICY "Anyone can insert waitlist emails" ON waitlist_emails
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only authenticated users can read waitlist emails" ON waitlist_emails
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Input Validation
- **Email**: Regex validation on both client and server
- **Password**: Minimum 6 characters, strength indicator
- **Profile**: Automatic creation with user metadata
- **Rate Limiting**: Built-in Supabase protection

### Session Management
- **Persistent Sessions**: Automatic token refresh
- **Protected Routes**: Dashboard requires authentication
- **State Synchronization**: Real-time auth state updates
- **Secure Logout**: Complete session cleanup

## 🧪 Testing

### Manual Testing Checklist

#### Public Landing Page
- [ ] Navigation shows "Sign In" and "Get Started"
- [ ] Waitlist form accepts valid emails
- [ ] Waitlist form validates email format
- [ ] Duplicate emails show appropriate message

#### Authentication Flow
- [ ] "Get Started" navigates to signup mode
- [ ] "Sign In" navigates to login mode
- [ ] Toggle between login/signup works
- [ ] Password strength indicator functions
- [ ] Form validation shows errors
- [ ] Successful signup creates account and profile
- [ ] Successful login redirects to dashboard
- [ ] Invalid credentials show error
- [ ] Google Sign-In button appears and functions
- [ ] Google OAuth flow redirects properly
- [ ] Google authentication creates user profile

#### Protected Dashboard
- [ ] Unauthenticated users redirect to auth
- [ ] Dashboard displays user information
- [ ] "Coming Soon" features are visible
- [ ] Logout button works correctly
- [ ] Navigation updates for authenticated state

#### Session Persistence
- [ ] Refresh page maintains login state
- [ ] Close/reopen browser maintains session
- [ ] Session expires appropriately
- [ ] Multiple tabs sync auth state

### Automated Testing (Browser Console)

```javascript
// Test authentication flow
const testAuth = async () => {
    console.log('Testing authentication...');
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    
    // Test database connection
    try {
        const { data, error } = await supabase.from('profiles').select('count');
        console.log('Database connection:', error ? 'Failed' : 'Success');
    } catch (e) {
        console.log('Database test error:', e.message);
    }
};

testAuth();
```

## 🚧 Troubleshooting

### Common Issues

#### "Authentication service unavailable"
- **Check**: Supabase config values
- **Verify**: Project URL format (includes https://)
- **Confirm**: Anon key is correct

#### Google OAuth issues
- **Check**: Google OAuth credentials in Supabase
- **Verify**: Redirect URIs match exactly
- **Confirm**: Google Cloud Console project is active
- **Test**: OAuth provider is enabled in Supabase

#### "User already registered" 
- **Normal**: Prevents duplicate accounts
- **Action**: Direct to login instead

#### "Invalid login credentials"
- **Check**: Email/password combination
- **Verify**: Account confirmation status
- **Test**: Password requirements met

#### Profile creation fails
- **Check**: Database triggers are active
- **Verify**: RLS policies allow access
- **Review**: Schema execution completed

#### Session not persisting
- **Check**: Browser localStorage
- **Verify**: No JavaScript errors
- **Test**: Auth state listeners working

### Debug Tools

#### Browser Console Commands
```javascript
// Check auth state
supabase.auth.getSession().then(console.log);

// Test profile access
supabase.from('profiles').select('*').then(console.log);

// Monitor auth changes
supabase.auth.onAuthStateChange(console.log);
```

#### Supabase Dashboard
- **Authentication > Users**: View registered users
- **Table Editor > profiles**: Check profile creation
- **Logs**: Monitor authentication attempts
- **API Logs**: Debug failed requests

## 📊 Monitoring

### Key Metrics to Track
- **User Registrations**: Daily/weekly signup counts
- **Authentication Success Rate**: Login success vs failures
- **Session Duration**: How long users stay logged in
- **Bounce Rate**: Users who signup but don't return

### Supabase Analytics
- **Auth Analytics**: Built-in user growth metrics
- **Database Usage**: Monitor table access patterns
- **API Calls**: Track authentication request volume
- **Error Rates**: Monitor failed authentication attempts

## 🚀 Production Deployment

### Pre-Deployment Checklist

#### Configuration
- [ ] Update Site URL to production domain
- [ ] Enable email confirmations
- [ ] Configure custom email templates
- [ ] Set up proper CORS policies
- [ ] Test all auth flows in production environment

#### Security
- [ ] Verify RLS policies are active
- [ ] Test data isolation between users
- [ ] Confirm no sensitive data exposure
- [ ] Set up error monitoring
- [ ] Configure rate limiting if needed

#### Performance
- [ ] Test auth performance under load
- [ ] Monitor database connection limits
- [ ] Set up backup policies
- [ ] Configure log retention
- [ ] Test session handling capacity

## 🛠 Future Phases

Phase 1 provides the foundation for upcoming features:

### Phase 2: Calendar Integration
- Google Calendar API integration (leveraging existing OAuth)
- Outlook integration
- Calendar sync and permissions

### Phase 3: AI Scheduling
- Machine learning for time optimization
- Smart conflict resolution
- Productivity pattern analysis

### Phase 4: Advanced Features
- Team scheduling
- Meeting preferences
- Automated scheduling suggestions

### Phase 5: Mobile & Integrations
- Mobile app authentication
- Third-party integrations
- API access controls

## 📝 Development Notes

### Code Architecture
- **Modular Design**: Authentication separate from core functionality
- **Consistent Styling**: Follows existing design system
- **Progressive Enhancement**: Works without JavaScript for basic navigation
- **Mobile-First**: Responsive design throughout

### Best Practices Followed
- **Security**: RLS policies, input validation, secure sessions
- **UX**: Clear error messages, loading states, intuitive navigation
- **Performance**: Optimized queries, efficient state management
- **Accessibility**: Semantic HTML, keyboard navigation, screen reader support

### Technical Decisions
- **Supabase Auth**: Reliable, scalable authentication service
- **Row Level Security**: Database-level security enforcement
- **Client-Side Routing**: Simple page-based navigation
- **Session Persistence**: Browser-based session storage

This completes Phase 1 of the AstroCal authentication system. The foundation is now ready for calendar integration and advanced scheduling features in future phases.
