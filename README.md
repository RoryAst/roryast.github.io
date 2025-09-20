# AstroCal - Restructured Codebase

## 📁 Project Structure

```
project/
├── assets/
│   ├── css/                   # Modular CSS files
│   │   ├── base.css          # CSS variables, reset, base styles
│   │   ├── components.css    # Reusable UI components
│   │   ├── pages.css         # Page-specific styles
│   │   └── utilities.css     # Utility classes and responsive design
│   └── js/                   # Modular JavaScript files
│       ├── auth.js           # Authentication functionality
│       ├── calendar.js       # Calendar and event management
│       ├── email.js          # Email input handling
│       └── scroll.js         # Scroll and navigation functionality
├── auth/
│   └── index.html            # Authentication page
├── config/
│   └── supabase-config.js    # Supabase configuration
├── dashboard/
│   └── index.html            # User dashboard
├── docs/                     # Documentation and guides
├── index.html                # Landing page
└── README.md                 # This file
```

## 🚀 Improvements Made

### 1. **Modular CSS Architecture**
- Split monolithic `styles.css` into 4 focused files:
  - `base.css`: CSS custom properties, reset styles, typography system
  - `components.css`: Reusable UI components (dock, cards, forms)
  - `pages.css`: Page-specific layouts and styles
  - `utilities.css`: Helper classes and responsive breakpoints

### 2. **Modular JavaScript Architecture**
- Split large `script.js` into specialized modules:
  - `auth.js`: Complete authentication system with session management
  - `calendar.js`: iCalendar event generation and management
  - `email.js`: Email input validation and submission
  - `scroll.js`: Smooth scrolling and dock functionality

### 3. **Organized File Structure**
- **Pages**: HTML files organized in dedicated feature folders (`/auth`, `/dashboard`)
- **Assets**: All CSS and JS files organized under `/assets`
- **Config**: Configuration files centralized in `/config`
- **Docs**: Documentation and guides in `/docs`

### 4. **Optimized Loading Strategy**
Each page now loads only the required assets:

#### Landing Page (`index.html`)
- CSS: `base.css`, `components.css`, `pages.css`, `utilities.css`
- JS: `scroll.js`, `email.js`

#### Auth Page (`auth/index.html`)
- CSS: `base.css`, `pages.css`, `utilities.css`
- JS: `auth.js`

#### Dashboard (`dashboard/index.html`)
- CSS: `base.css`, `pages.css`, `utilities.css`
- JS: `auth.js`

## 🎯 Benefits

### Performance
- **Reduced bundle size**: Each page loads only necessary code
- **Faster initial load**: Smaller CSS/JS payloads
- **Better caching**: Modular files enable better browser caching

### Maintainability
- **Separation of concerns**: Each file has a single responsibility
- **Easier debugging**: Locate issues quickly in focused files
- **Scalable architecture**: Easy to add new features without bloating existing files

### Development Experience
- **Better organization**: Logical file structure
- **Reduced conflicts**: Smaller files reduce merge conflicts
- **Reusable components**: Shared CSS/JS components across pages

## 🔧 File Descriptions

### CSS Files

#### `base.css`
- CSS custom properties (colors, typography, spacing)
- CSS reset and normalization
- Base element styles
- Typography system

#### `components.css`
- Floating dock component
- Calendar card component
- Email input component
- Feature cards and bullets
- Form components

#### `pages.css`
- Hero section (landing page)
- Product overview section
- Authentication page styles
- Dashboard page styles
- Page-specific layouts

#### `utilities.css`
- Text utilities (gradients, colors)
- Background utilities
- Shadow utilities
- Border radius utilities
- Transition utilities
- Responsive design breakpoints

### JavaScript Files

#### `auth.js`
- `SessionManager`: Global session management
- `AuthManager`: Login/signup functionality
- `DashboardManager`: Dashboard user interface
- User profile management
- Supabase authentication integration

#### `calendar.js`
- `iCalendarGenerator`: Complete calendar system
- Event creation and management
- Recurring event handling
- iCalendar (.ics) export functionality
- Calendar visualization

#### `email.js`
- `EmailInputHandler`: Email validation and submission
- Waitlist email management
- Form state handling
- Supabase integration for email storage

#### `scroll.js`
- `ScrollManager`: Page scroll functionality
- Dock button scroll behavior
- Smooth scrolling between sections
- Scroll position detection

## 🚀 Getting Started

1. **Development**: Open `index.html` in your browser
2. **Authentication**: Navigate to `auth/` for login/signup
3. **Dashboard**: Access `dashboard/` after authentication

## 📱 Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- ES6+ JavaScript features used

## 🔗 Dependencies

- **Supabase**: Authentication and database
- **Inter Font**: Typography
- **Vanilla HTML/CSS/JS**: No frameworks required

This restructured codebase provides a solid foundation for future development while maintaining clean, efficient, and maintainable code.
