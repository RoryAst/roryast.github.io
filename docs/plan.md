# AstroCal Development Plan
## Intelligent Calendar Management Platform

---

## 📋 Executive Summary

AstroCal is an AI-powered calendar management platform that provides intelligent scheduling, seamless calendar integrations, and productivity insights. This comprehensive plan outlines the complete development roadmap from MVP to production-ready application.

### Core Value Proposition
- **Smart Scheduling**: AI-powered suggestions for optimal meeting times
- **Seamless Integration**: Connect with Google Calendar, Outlook, and other platforms
- **Productivity Insights**: Analytics and recommendations for workflow optimization
- **Cross-Platform**: Responsive design across all devices and platforms

---

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+) with Supabase client
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with OAuth providers
- **Calendar APIs**: Google Calendar API, Microsoft Graph API
- **AI/ML**: OpenAI GPT-4 API for scheduling suggestions
- **Infrastructure**: Supabase cloud + Vercel/Netlify for frontend
- **Monitoring**: Supabase dashboard + basic error tracking

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   AI Services   │
│   (HTML/CSS/JS) │◄──►│   (Backend)     │◄──►│   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Host   │    │   PostgreSQL    │    │   Calendar APIs │
│   (Vercel/Netlify)│   │   + Auth        │    │   (Google/MS)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Supabase Components:**
- **Database**: PostgreSQL with real-time subscriptions
- **Auth**: Built-in authentication with OAuth providers
- **API**: Auto-generated REST and GraphQL APIs
- **Storage**: File storage for user data
- **Edge Functions**: Serverless functions for AI integration

---

## 🔐 Authentication Strategy & Implementation Plan

### Phase 1: Email/Password Authentication (Weeks 1-2)

**Goal**: Establish secure, simple authentication foundation with email/password only.

#### 1.1 Core Authentication Infrastructure
- **Supabase Auth**: Leverage built-in email/password authentication
- **User Profiles**: Automatic profile creation on signup
- **Row Level Security (RLS)**: Database-level data isolation
- **Session Management**: Persistent login across browser sessions

#### 1.2 Page Structure
```
/auth.html          # Dedicated login/signup page
/dashboard.html     # Protected dashboard (empty initially)
/index.html         # Public landing page with waitlist
```

#### 1.3 Security Features
- **Input Validation**: Client and server-side email/password validation
- **Password Requirements**: Minimum 6 characters (Supabase default)
- **Rate Limiting**: Built-in Supabase protection against brute force
- **HTTPS Only**: All authentication traffic encrypted
- **Development Privacy**: Password-protected during development

#### 1.4 Database Schema (Phase 1)
```sql
-- User profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);
```

### Phase 2: Google OAuth Integration (Weeks 3-4)

**Goal**: Add seamless Google sign-in as an alternative to email/password.

#### 2.1 Google OAuth Setup
- **Google Cloud Console**: Configure OAuth 2.0 application
- **Supabase Provider**: Enable Google provider in Supabase dashboard
- **Redirect Handling**: Seamless redirect flow to dashboard
- **Profile Sync**: Import Google profile data (name, email)

#### 2.2 Enhanced User Experience
- **One-Click Sign In**: "Continue with Google" button
- **Profile Enhancement**: Auto-populate user details from Google (name, email)
- **Calendar Permission**: Optional calendar access scope for future features
- **Fallback**: Email/password remains available as backup

#### 2.3 Implementation Details
```javascript
// Google OAuth integration
async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard.html',
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        }
    });
}
```

### Phase 3: Enhanced Security & Features (Weeks 5-6)

**Goal**: Add advanced authentication features and security improvements.

#### 3.1 Advanced Security
- **Email Verification**: Require email confirmation for new accounts
- **Password Reset**: Secure password reset via email
- **Account Recovery**: Multiple recovery options
- **Audit Logging**: Track authentication events

#### 3.2 User Experience Improvements
- **Remember Me**: Extended session options
- **Profile Management**: In-app profile editing
- **Account Settings**: Privacy and security preferences
- **Session Management**: View and revoke active sessions

#### 3.3 Monitoring & Analytics
- **Auth Metrics**: Track login success rates, popular methods
- **Security Monitoring**: Failed login attempts, suspicious activity
- **User Onboarding**: Track signup completion rates

### Security Architecture

#### 1. Authentication Flow
```
User Registration/Login → Supabase Auth → JWT Token → Database Access
                                     ↓
                              Row Level Security ← User ID Verification
```

#### 2. Data Protection
- **Row Level Security**: Users can only access their own data
- **JWT Tokens**: Automatic token management and refresh
- **API Security**: All database access through authenticated APIs
- **Input Sanitization**: Prevent SQL injection and XSS attacks

#### 3. Development Security
- **Environment Variables**: Secure credential storage
- **Development Protection**: Password-protected dev pages
- **CORS Configuration**: Restrict API access to authorized domains
- **Rate Limiting**: Prevent abuse and spam

---

## 📅 Calendar Integration Strategy

### 1. Google Calendar Integration
```javascript
// Supabase + Google Calendar Integration
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// OAuth with Supabase
async function connectGoogleCalendar() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar',
      redirectTo: window.location.origin + '/auth/callback'
    }
  })
}

// Store calendar credentials in Supabase
async function saveCalendarIntegration(provider, tokens) {
  const { data, error } = await supabase
    .from('calendar_integrations')
    .insert({
      provider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000)
    })
}
```

**Features:**
- Read/write access to calendars
- Event creation and modification
- Recurring event handling
- Free/busy time queries
- Calendar synchronization

### 2. Microsoft Outlook Integration
```javascript
// Supabase + Microsoft Outlook Integration
async function connectOutlookCalendar() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'https://graph.microsoft.com/Calendars.ReadWrite',
      redirectTo: window.location.origin + '/auth/callback'
    }
  })
}

// Fetch events from Outlook
async function fetchOutlookEvents(startDate, endDate) {
  const { data: integration } = await supabase
    .from('calendar_integrations')
    .select('access_token')
    .eq('provider', 'outlook')
    .single()

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`,
    {
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  return await response.json()
}
```

**Features:**
- Outlook calendar access
- Exchange server integration
- Meeting room booking
- Shared calendar support

### 3. Calendar Sync Engine with Supabase
```javascript
// Real-time calendar sync with Supabase
function setupCalendarSync() {
  // Listen for real-time changes
  supabase
    .channel('calendar_events')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'events' },
      (payload) => {
        console.log('Calendar event changed:', payload)
        updateCalendarUI(payload)
      }
    )
    .subscribe()
}

// Sync events between calendars
async function syncCalendarEvents(events) {
  const { data, error } = await supabase
    .from('events')
    .upsert(events, { onConflict: 'external_id' })
}
```

**Features:**
- **Real-time Sync**: Supabase real-time subscriptions for live updates
- **Conflict Resolution**: Database-level conflict handling
- **Bidirectional Sync**: Changes sync across all connected calendars
- **Offline Support**: Local caching with sync when online

---

## 🎨 Frontend Development Plan

### Phase 1: Core Application Structure
1. **Project Setup**
   - Vanilla HTML5 with semantic markup
   - CSS3 with CSS Grid and Flexbox
   - Modern JavaScript (ES6+) with Supabase client
   - Responsive design with mobile-first approach

2. **Supabase Integration**
   - Initialize Supabase client
   - Set up authentication with Supabase Auth
   - Configure OAuth providers (Google, Microsoft)
   - Handle authentication state management

3. **Dashboard Layout**
   - Single-page application structure
   - Responsive navigation menu
   - Dynamic content loading with Supabase
   - Mobile-optimized interface

### Phase 2: Calendar Interface
1. **Calendar Views**
   - Monthly calendar grid with CSS Grid
   - Weekly and daily views
   - Event list/agenda view
   - View switching with JavaScript

2. **Event Management with Supabase**
   - Modal dialogs for event creation/editing
   - Drag-and-drop with HTML5 drag API
   - Form validation with JavaScript
   - Event categories with color coding
   - Real-time event updates via Supabase subscriptions

3. **AI Suggestions Interface**
   - Smart scheduling recommendations display
   - Conflict resolution suggestions
   - Simple productivity insights
   - Time optimization recommendations

### Phase 3: Advanced Features
1. **Analytics Dashboard**
   - Simple time usage charts with Chart.js
   - Basic productivity metrics from Supabase data
   - Meeting insights display
   - Export functionality

2. **Settings & Preferences**
   - Calendar connection settings via Supabase
   - Notification preferences
   - AI recommendation settings
   - Theme and appearance options

---

## 🔧 Supabase Backend Setup

### Phase 1: Supabase Project Setup
1. **Supabase Project Configuration**
   ```sql
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Create users profile table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     google_id TEXT,
     outlook_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create calendar integrations table
   CREATE TABLE calendar_integrations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
     access_token TEXT NOT NULL,
     refresh_token TEXT,
     expires_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create events table
   CREATE TABLE events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE NOT NULL,
     is_recurring BOOLEAN DEFAULT FALSE,
     recurrence_rule TEXT,
     calendar_id TEXT,
     external_id TEXT UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Row Level Security Policies**
   ```sql
   -- Users can only see their own profile
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   -- Users can only see their own calendar integrations
   CREATE POLICY "Users can view own integrations" ON calendar_integrations
     FOR ALL USING (auth.uid() = user_id);

   -- Users can only see their own events
   CREATE POLICY "Users can view own events" ON events
     FOR ALL USING (auth.uid() = user_id);
   ```

3. **Supabase Functions for AI Integration**
   ```sql
   -- Create function for AI scheduling suggestions
   CREATE OR REPLACE FUNCTION get_scheduling_suggestions(
     user_id UUID,
     preferences JSONB
   ) RETURNS JSONB AS $$
   BEGIN
     -- This will call Supabase Edge Function for AI processing
     RETURN '{"suggestions": []}'::JSONB;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

### Phase 2: Supabase Edge Functions for Calendar Integration
1. **Google Calendar Integration Function**
   ```javascript
   // Supabase Edge Function: google-calendar-sync
   import { createClient } from '@supabase/supabase-js'
   import { google } from 'googleapis'

   Deno.serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL'),
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
     )

     const { userId, timeMin, timeMax } = await req.json()

     // Get user's Google integration
     const { data: integration } = await supabase
       .from('calendar_integrations')
       .select('access_token')
       .eq('user_id', userId)
       .eq('provider', 'google')
       .single()

     // Fetch events from Google Calendar
     const calendar = google.calendar({ version: 'v3' })
     calendar.setCredentials({ access_token: integration.access_token })

     const response = await calendar.events.list({
       calendarId: 'primary',
       timeMin: timeMin,
       timeMax: timeMax,
       singleEvents: true,
       orderBy: 'startTime'
     })

     return new Response(JSON.stringify(response.data.items))
   })
   ```

2. **Microsoft Outlook Integration Function**
   ```javascript
   // Supabase Edge Function: outlook-calendar-sync
   Deno.serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL'),
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
     )

     const { userId, timeMin, timeMax } = await req.json()

     // Get user's Outlook integration
     const { data: integration } = await supabase
       .from('calendar_integrations')
       .select('access_token')
       .eq('user_id', userId)
       .eq('provider', 'outlook')
       .single()

     // Fetch events from Microsoft Graph
     const response = await fetch(
       `https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge '${timeMin}' and end/dateTime le '${timeMax}'`,
       {
         headers: {
           'Authorization': `Bearer ${integration.access_token}`,
           'Content-Type': 'application/json'
         }
       }
     )

     const data = await response.json()
     return new Response(JSON.stringify(data.value))
   })
   ```

3. **Calendar Sync Engine**
   - Real-time synchronization via Supabase subscriptions
   - Conflict detection and resolution
   - Bidirectional sync logic
   - Error handling and retry mechanisms

### Phase 3: AI Integration with Supabase Edge Functions
1. **Scheduling AI Service**
   ```javascript
   // Supabase Edge Function: ai-scheduling-suggestions
   import OpenAI from 'openai'

   Deno.serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL'),
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
     )

     const { userId, preferences } = await req.json()

     // Get user's schedule from Supabase
     const { data: events } = await supabase
       .from('events')
       .select('*')
       .eq('user_id', userId)
       .gte('start_time', new Date().toISOString())

     // Initialize OpenAI
     const openai = new OpenAI({
       apiKey: Deno.env.get('OPENAI_API_KEY')
     })

     // Generate AI suggestions
     const prompt = buildSchedulingPrompt(events, preferences)
     const response = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [{ role: "user", content: prompt }]
     })

     return new Response(JSON.stringify({
       suggestions: parseSuggestions(response.choices[0].message.content)
     }))
   })
   ```

2. **Productivity Analytics**
   - Basic time usage analysis via Supabase queries
   - Simple meeting metrics from event data
   - AI-powered productivity recommendations
   - Basic insights generation

---

## 📱 Responsive Design Strategy

### 1. Mobile-First Approach
```css
/* Mobile-first responsive breakpoints */
:root {
  --mobile: 320px;
  --tablet: 768px;
  --desktop: 1024px;
  --large-desktop: 1440px;
}

/* Calendar layout with CSS Grid */
.calendar-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet and desktop enhancements */
@media (min-width: 768px) {
  .calendar-view {
    grid-template-columns: 250px 1fr;
  }
}

@media (min-width: 1024px) {
  .calendar-view {
    grid-template-columns: 250px 1fr 300px;
  }
}

/* Calendar grid layout */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
}

.calendar-day {
  background-color: white;
  min-height: 120px;
  padding: 0.5rem;
}
```

### 2. Cross-Platform Considerations
- **iOS Safari**: Touch-friendly interactions, safe area handling
- **Android Chrome**: Material Design principles, gesture support
- **Desktop Browsers**: Keyboard shortcuts, hover states
- **Tablet**: Hybrid touch/mouse interactions

### 3. Performance Optimization
- **Lazy Loading**: Images and calendar data loaded on demand
- **Event Delegation**: Efficient event handling
- **Local Storage**: Caching user preferences and calendar data
- **Minification**: CSS and JavaScript minification for production

---

## 🚀 Development Phases

### Phase 1: Authentication Foundation (Weeks 1-2)
**Goal**: Establish secure email/password authentication with separate auth and dashboard pages.

**Database Setup:**
- [ ] Update Supabase schema with user profiles table
- [ ] Configure Row Level Security policies for profiles
- [ ] Set up automatic profile creation trigger
- [ ] Test RLS policies with sample data

**Authentication Pages:**
- [ ] Create `auth.html` - dedicated login/signup page
- [ ] Create `dashboard.html` - empty protected dashboard
- [ ] Implement `auth.js` - authentication logic
- [ ] Implement `dashboard.js` - dashboard logic and auth checks

**Core Features:**
- [ ] Email/password registration and login
- [ ] Form validation (client and server-side)
- [ ] Session management and persistence
- [ ] Automatic profile creation on signup
- [ ] Protected dashboard with auth checks
- [ ] Sign out functionality

**Security & Privacy:**
- [ ] Development password protection for auth/dashboard pages
- [ ] Input validation and sanitization
- [ ] Error handling and user feedback
- [ ] Basic rate limiting protection

### Phase 2: Google OAuth Integration (Weeks 3-4)
**Goal**: Add Google sign-in as an alternative authentication method.

**Google OAuth Setup:**
- [ ] Configure Google Cloud Console OAuth application
- [ ] Enable Google provider in Supabase dashboard
- [ ] Set up redirect URLs and domain verification
- [ ] Test OAuth flow in development environment

**Enhanced Authentication:**
- [ ] Add "Continue with Google" button to auth page
- [ ] Implement Google OAuth sign-in flow
- [ ] Handle OAuth redirects and profile data
- [ ] Merge Google profile data with user profiles
- [ ] Maintain email/password as backup option

**User Experience:**
- [ ] Smooth transition between auth methods
- [ ] Profile picture import from Google
- [ ] Auto-population of user details
- [ ] Consistent UI/UX across auth methods

### Phase 3: Enhanced Security & User Management (Weeks 5-6)
**Goal**: Add advanced authentication features and user management.

**Advanced Security:**
- [ ] Email verification for new accounts
- [ ] Password reset functionality
- [ ] Account recovery options
- [ ] Audit logging for security events

**User Management:**
- [ ] In-app profile editing
- [ ] User preferences and settings
- [ ] Session management (view/revoke sessions)
- [ ] Account deletion/deactivation

**Monitoring & Analytics:**
- [ ] Authentication metrics tracking
- [ ] Failed login attempt monitoring
- [ ] User onboarding completion tracking
- [ ] Security event logging

### Phase 4: Dashboard Foundation (Weeks 7-8)
**Goal**: Build basic dashboard structure and navigation.

**Dashboard Infrastructure:**
- [ ] Dashboard layout and navigation
- [ ] User profile header with dropdown
- [ ] Settings and preferences pages
- [ ] Mobile-responsive dashboard design

**Data Infrastructure:**
- [ ] User-specific data models
- [ ] Real-time subscriptions setup
- [ ] Basic CRUD operations for user data
- [ ] Data validation and error handling

**UI/UX Foundation:**
- [ ] Consistent design system
- [ ] Loading states and error handling
- [ ] Accessibility improvements
- [ ] Cross-browser compatibility

### Phase 5: Calendar Integration Preparation (Weeks 9-10)
**Goal**: Prepare infrastructure for calendar features.

**Calendar Data Models:**
- [ ] Design calendar event schema
- [ ] Set up calendar integration tables
- [ ] Configure RLS for calendar data
- [ ] Create calendar sync infrastructure

**Basic Calendar UI:**
- [ ] Calendar view components
- [ ] Event display and basic interactions
- [ ] Calendar navigation (month/week/day views)
- [ ] Event creation modal

### Phase 6: Google Calendar Integration (Weeks 11-12)
**Goal**: Connect Google Calendar for authenticated users.

**Google Calendar API:**
- [ ] Set up Google Calendar API credentials
- [ ] Implement calendar permission flow
- [ ] Create Supabase Edge Functions for calendar sync
- [ ] Build calendar event synchronization

**Calendar Features:**
- [ ] Import existing Google Calendar events
- [ ] Bi-directional sync (AstroCal ↔ Google)
- [ ] Conflict resolution for overlapping events
- [ ] Real-time calendar updates

### Phase 7: Polish & Launch Preparation (Weeks 13-16)
**Goal**: Finalize features, optimize performance, and prepare for launch.

**Performance & Optimization:**
- [ ] Database query optimization
- [ ] Frontend performance improvements
- [ ] Caching strategies
- [ ] Bundle size optimization

**Quality Assurance:**
- [ ] Comprehensive testing (unit, integration, e2e)
- [ ] Cross-browser and device testing
- [ ] Security audit and penetration testing
- [ ] User acceptance testing

**Launch Preparation:**
- [ ] Production deployment setup
- [ ] Monitoring and alerting
- [ ] Documentation and user guides
- [ ] Marketing and launch strategy

---

## 📋 Phase 1 Implementation Guide (Email/Password Authentication)

### Step 1: Database Schema Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: File Structure

Create the following files in your project:

```
project/
├── index.html          # Landing page with waitlist (existing)
├── auth.html           # Login/signup page (new)
├── dashboard.html      # Protected dashboard (new)
├── auth.js            # Authentication logic (new)
├── dashboard.js       # Dashboard logic (new)
├── script.js          # Landing page logic (existing)
├── styles.css         # Shared styles (existing)
├── supabase-config.js # Supabase configuration (existing)
└── ...other files
```

### Step 3: Development Privacy

Add password protection to both `auth.html` and `dashboard.html`:

```html
<!-- Add after <body> tag -->
<script>
// Simple development password protection
(function() {
    const DEV_PASSWORD = 'astrocal2024'; // Change this password
    const DEV_MODE = true; // Set to false to disable protection
    
    if (DEV_MODE && !sessionStorage.getItem('dev_authenticated')) {
        const password = prompt('Development Access Required:');
        if (password !== DEV_PASSWORD) {
            alert('Access denied');
            window.location.href = 'index.html';
            return;
        }
        sessionStorage.setItem('dev_authenticated', 'true');
    }
})();
</script>
```

### Step 4: Core Features Implementation

**Authentication Flow:**
1. User visits `auth.html` 
2. Can sign up or sign in with email/password
3. On success, redirected to `dashboard.html`
4. Dashboard checks authentication state
5. If not authenticated, redirected back to `auth.html`

**Key Components:**
- Form validation (email format, password length)
- Loading states during authentication
- Error handling and user feedback
- Session persistence across browser sessions
- Automatic profile creation on signup
- Secure sign out functionality

### Step 5: Testing Checklist

**Authentication Testing:**
- [ ] Sign up with valid email/password
- [ ] Sign up with invalid email (should show error)
- [ ] Sign up with weak password (should show error)
- [ ] Sign in with correct credentials
- [ ] Sign in with incorrect credentials (should show error)
- [ ] Session persistence (refresh browser, should stay logged in)
- [ ] Sign out functionality (should redirect to auth page)

**Navigation Testing:**
- [ ] Direct access to `/dashboard.html` without auth (should redirect)
- [ ] Direct access to `/auth.html` when already logged in (should redirect to dashboard)
- [ ] Link from landing page to auth page works
- [ ] Mobile responsiveness on all pages

**Security Testing:**
- [ ] Development password protection works
- [ ] User data isolation (users can only see their own data)
- [ ] SQL injection protection (try malicious inputs)
- [ ] XSS protection (try script inputs)

### Success Criteria for Phase 1

✅ **Complete when:**
- Users can register with email/password
- Users can sign in and access dashboard
- Sessions persist across browser refreshes
- User profiles are automatically created
- All forms have proper validation
- Error messages are user-friendly
- Authentication pages are protected from public access
- All security tests pass

**Time Estimate: 1-2 weeks**
**Priority: Critical (blocks all other features)**

---

## 🧪 Testing Strategy

### 1. Unit Testing
- **Frontend**: Jest for JavaScript testing
- **Supabase**: Edge Function testing with Deno test
- **Coverage**: Basic code coverage tracking

### 2. Integration Testing
- **Supabase Integration**: Database and Auth testing
- **Calendar APIs**: Mock services for testing
- **Edge Functions**: API endpoint testing

### 3. Manual Testing
- **User Flows**: Manual testing of key features
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS and Android browsers

### 4. Performance Testing
- **Basic Load Testing**: Simple load testing
- **Supabase Performance**: Query optimization and Edge Function performance
- **Frontend Performance**: Basic performance monitoring

---

## 📊 Monitoring & Analytics

### 1. Basic Application Monitoring
- **Error Logging**: Supabase dashboard logging and basic error tracking
- **Performance**: Supabase performance monitoring
- **Uptime**: Supabase dashboard availability monitoring

### 2. User Analytics
- **Usage Metrics**: Google Analytics for basic tracking
- **User Behavior**: Simple event tracking
- **Feature Usage**: Basic feature adoption tracking

### 3. Business Metrics
- **User Growth**: Registration and basic retention tracking
- **Engagement**: Simple usage metrics
- **Performance**: Basic performance indicators

---

## 🚀 Deployment & DevOps

### 1. Simple Deployment
- **Frontend**: Static hosting on Vercel or Netlify
- **Backend**: Supabase cloud platform (handles everything)
- **Database**: PostgreSQL via Supabase (included)
- **Environment Variables**: Supabase environment variable management

### 2. Basic CI/CD
```yaml
# Simple GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
```

### 3. Environment Management
- **Development**: Local development with Supabase local setup
- **Production**: Live application on Supabase cloud + Vercel/Netlify

---

## 📈 Growth & Scaling Strategy

### 1. Performance Scaling
- **Database Optimization**: PostgreSQL indexing and query optimization via Supabase
- **Caching Strategy**: Local storage and Supabase caching
- **CDN**: Basic content delivery for static assets
- **Supabase Scaling**: Automatic scaling via Supabase platform

### 2. Feature Scaling
- **Additional Integrations**: More calendar providers
- **Enhanced AI Features**: Better scheduling recommendations
- **Mobile Optimization**: Progressive Web App features
- **Team Features**: Basic collaboration features

### 3. Business Scaling
- **Freemium Model**: Free tier with premium features
- **User Feedback**: Iterative improvements based on usage
- **Partnerships**: Integration with productivity tools
- **Simple Analytics**: Basic user behavior insights

---

## 🔒 Basic Compliance & Legal

### 1. Data Privacy
- **Basic Privacy Policy**: Simple privacy practices
- **Data Retention**: Basic data cleanup policies
- **User Rights**: Simple data export and deletion

### 2. Terms & Conditions
- **User Agreement**: Basic terms of service
- **Privacy Policy**: Simple privacy practices
- **Cookie Policy**: Basic cookie usage information

### 3. Basic Security
- **HTTPS**: Secure data transmission
- **Data Protection**: Basic user data protection
- **API Security**: Secure API key management

---

## 📋 Success Metrics

### 1. Technical Metrics
- **Uptime**: 95%+ availability
- **Performance**: <3s page load times
- **Error Rate**: <1% error rate
- **Basic Security**: No critical vulnerabilities

### 2. User Metrics
- **User Acquisition**: 500+ users in first 3 months
- **Retention**: 50%+ monthly retention rate
- **Engagement**: 3+ sessions per user per week
- **User Satisfaction**: Positive user feedback

### 3. Business Metrics
- **User Growth**: Steady month-over-month growth
- **Feature Usage**: High adoption of core features
- **Calendar Integrations**: Successful Google/Outlook connections
- **AI Recommendations**: User acceptance of suggestions

---

## 🎯 Next Steps & Implementation Order

### 🚀 Phase 1: Start Here (Weeks 1-2)
**Priority: CRITICAL - Must complete before any other features**

#### Immediate Actions (This Week)
1. **Database Setup** (Day 1-2)
   - [ ] Run the Phase 1 SQL schema in Supabase SQL Editor
   - [ ] Test profile creation trigger with sample user
   - [ ] Verify RLS policies are working correctly

2. **Create Authentication Pages** (Day 3-5)
   - [ ] Create `auth.html` with email/password forms
   - [ ] Create `dashboard.html` with basic layout
   - [ ] Add development password protection
   - [ ] Style authentication pages to match brand

3. **Implement Authentication Logic** (Day 6-7)
   - [ ] Create `auth.js` with signup/signin functionality
   - [ ] Create `dashboard.js` with auth checks
   - [ ] Add form validation and error handling
   - [ ] Test complete authentication flow

#### Week 2: Testing & Refinement
- [ ] Complete authentication testing checklist
- [ ] Fix any bugs or UX issues
- [ ] Add loading states and better error messages
- [ ] Test on multiple devices and browsers
- [ ] Document any setup issues for future reference

#### Success Criteria ✅
- [ ] New users can register with email/password
- [ ] Existing users can sign in successfully
- [ ] Dashboard is properly protected (redirects if not authenticated)
- [ ] User sessions persist across browser refreshes
- [ ] All forms have proper validation and error handling

### 🔄 Phase 2: Google OAuth (Weeks 3-4)
**Dependency: Phase 1 must be complete and working**

#### Goals
- Add Google sign-in as alternative to email/password
- Import Google profile data (name, email)
- Maintain email/password as backup option

#### Key Tasks
- [ ] Configure Google Cloud Console OAuth app
- [ ] Enable Google provider in Supabase
- [ ] Add "Continue with Google" button to auth page
- [ ] Test OAuth flow end-to-end

### 🛡️ Phase 3: Enhanced Security (Weeks 5-6)
**Optional but recommended before public launch**

#### Goals
- Email verification for new accounts
- Password reset functionality  
- Advanced security features

### 📊 Phase 4+: Dashboard & Calendar Features (Weeks 7+)
**Build upon solid authentication foundation**

#### Progressive Enhancement
- Dashboard infrastructure and navigation
- User profile management (name, email, preferences)
- Calendar data models and basic UI
- Google Calendar integration
- AI features and advanced functionality

---

## ⚠️ Critical Dependencies

**Everything depends on Phase 1 authentication working correctly:**
- Calendar features need authenticated users
- User data needs proper RLS policies
- Dashboard needs auth state management
- All future features require user accounts

**Do not proceed to Phase 2+ until Phase 1 is:**
- ✅ Fully implemented and tested
- ✅ Working reliably in your development environment
- ✅ Passes all authentication tests
- ✅ Has proper error handling and user feedback

---

## 🧪 Development Best Practices

### Testing Each Phase
1. **Manual Testing**: Test every user flow thoroughly
2. **Edge Cases**: Try invalid inputs, network errors, etc.
3. **Cross-Browser**: Test on Chrome, Firefox, Safari
4. **Mobile**: Test responsive design on mobile devices
5. **Security**: Verify RLS policies and input validation

### Code Quality
- **Comments**: Document complex authentication logic
- **Error Handling**: Graceful handling of all error cases
- **User Feedback**: Clear, helpful error and success messages
- **Performance**: Fast loading and responsive interactions

### Git Workflow
- **Feature Branches**: Create branch for each phase
- **Frequent Commits**: Commit working code frequently
- **Testing**: Test before merging to main branch
- **Documentation**: Update README with setup instructions

---

*This plan provides a comprehensive roadmap for developing AstroCal from concept to production. Regular reviews and updates will ensure the plan remains relevant and achievable as the project evolves.*
