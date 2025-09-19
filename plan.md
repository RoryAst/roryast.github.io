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

## 🔐 Essential Security & Authentication

### 1. Supabase Authentication
- **Built-in Auth**: Supabase handles user registration, login, and sessions
- **OAuth Providers**: Google, GitHub, Microsoft for easy login
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Automatic token management and refresh

### 2. API Security
- **Supabase API**: Auto-generated secure APIs with built-in validation
- **Rate Limiting**: Built-in rate limiting on Supabase APIs
- **Input Validation**: Database constraints and validation rules
- **CORS Configuration**: Automatic CORS handling

### 3. Data Security
- **HTTPS Only**: All Supabase connections are encrypted
- **Row Level Security**: User data isolation at database level
- **API Key Management**: Secure environment variable storage
- **Real-time Security**: Secure WebSocket connections for live updates

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

### Phase 1: Foundation (Weeks 1-4)
**Supabase Setup:**
- [ ] Create Supabase project and configure
- [ ] Set up PostgreSQL database schema
- [ ] Configure Row Level Security policies
- [ ] Set up Supabase Auth with OAuth providers
- [ ] Create Supabase Edge Functions

**Frontend:**
- [ ] HTML/CSS/JS project structure with Supabase client
- [ ] Supabase authentication integration
- [ ] Basic dashboard layout
- [ ] Calendar grid component

**Security:**
- [ ] Row Level Security configuration
- [ ] Supabase Auth policies
- [ ] Environment variable setup

### Phase 2: Core Features (Weeks 5-8)
**Supabase Backend:**
- [ ] Microsoft Outlook Edge Function
- [ ] Calendar sync Edge Functions
- [ ] Real-time subscriptions setup
- [ ] Event CRUD operations via Supabase client

**Frontend:**
- [ ] Multiple calendar views (month/week/day)
- [ ] Event creation/editing modals
- [ ] Drag-and-drop with HTML5 API
- [ ] Mobile responsive design
- [ ] Real-time updates via Supabase subscriptions

### Phase 3: AI Integration (Weeks 9-12)
**Supabase Backend:**
- [ ] OpenAI Edge Function for AI suggestions
- [ ] Basic scheduling algorithm
- [ ] Simple productivity analytics via Supabase queries
- [ ] Recommendation API via Edge Functions

**Frontend:**
- [ ] AI suggestions display
- [ ] Basic analytics dashboard with Chart.js
- [ ] Settings and preferences
- [ ] Enhanced calendar features

### Phase 4: Polish & Launch (Weeks 13-16)
**Supabase Backend:**
- [ ] Edge Function performance optimization
- [ ] Error handling improvements
- [ ] Supabase dashboard monitoring
- [ ] API documentation

**Frontend:**
- [ ] UI/UX polish
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Testing and bug fixes

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

## 🎯 Next Steps

### Immediate Actions (Week 1)
1. **Setup Development Environment**
   - Initialize GitHub repository
   - Create Supabase project and configure
   - Set up local Supabase development environment

2. **Begin Supabase Setup**
   - Create database schema and tables
   - Configure Row Level Security policies
   - Set up Supabase Auth with OAuth providers

3. **Start Frontend Development**
   - Create HTML/CSS/JS project structure
   - Set up responsive CSS framework
   - Initialize Supabase client
   - Create basic page structure

### Short-term Goals (Month 1)
- Complete Supabase authentication system
- Implement Google Calendar OAuth integration via Supabase
- Build basic calendar interface with real-time updates
- Deploy to staging environment

### Long-term Vision (6 Months)
- Full-featured calendar management platform
- AI-powered scheduling recommendations via Supabase Edge Functions
- Mobile-responsive design
- Production-ready application with active users on Supabase platform

---

*This plan provides a comprehensive roadmap for developing AstroCal from concept to production. Regular reviews and updates will ensure the plan remains relevant and achievable as the project evolves.*
