# UCSP Tuna - Multi-Language Event Booking Platform

## Overview

This is a professional event booking platform for UCSP Tuna, a university music group. The landing page is designed to showcase services and allow clients to book performances for their events. The platform includes a bilingual interface (English/Spanish) and a super admin management system.

## Architecture

### Public-Facing (Landing Page)
- **Purpose**: Showcase UCSP Tuna services and enable event booking inquiries
- **Features**:
  - Bilingual support (English/Spanish) with language toggle
  - Service packages showcase (Serenade, Ceremony, Celebration, Custom)
  - Client testimonials
  - Contact form integration
  - Responsive design

### Super Admin Area
- **Access**: `/admin` (Super Admins Only)
- **Login**: `/admin/login`
- **Functions**:
  - Member management (view, add, edit roles)
  - Event management (create, view, manage events)
  - Attendance tracking
  - Activity monitoring

## Setup Instructions

### 1. Environment Variables

Add the following to your Vercel project environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

The database schema is already configured in `scripts/setup-supabase.sql`. It includes:

- **profiles**: User profiles with role-based access control
- **activities**: Events/performances
- **attendance**: Attendance tracking
- **activity_feed**: Activity logs

### 3. Super Admin Creation

To create a super admin user:

1. Go to Supabase Authentication panel
2. Create a new user with email: `admin@ucsp-tuna.edu` (or your preferred email)
3. In the `profiles` table, set the user's `role` to `super_admin`

### 4. Language System

The platform uses a custom i18n system:

- **File**: `/lib/translations.ts` - Contains all UI text for EN/ES
- **Hook**: `/hooks/use-language.ts` - Language state management
- **Toggle**: Language switcher in the header

To add new translations:
1. Add strings to `/lib/translations.ts` under both `en` and `es` keys
2. Use `const { t } = useLanguage()` in components
3. Access text via `t.section.key`

### 5. Admin Panel Access

- Navigate to `/admin/login`
- Enter super admin credentials
- Access member and event management

## File Structure

```
/components/landing/
├── header.tsx       - Navigation with language toggle
├── hero.tsx         - Main CTA section
├── features.tsx     - Why choose UCSP Tuna
├── services.tsx     - Service packages
├── events.tsx       - Client testimonials (was events)
├── cta.tsx          - Call to action / booking
└── footer.tsx       - Footer links

/app/admin/
├── login/           - Super admin login
├── page.tsx         - Dashboard
├── members/         - Member management
├── events/          - Event management
└── layout.tsx       - Admin sidebar

/app/api/
├── admin/login/route.ts   - Admin authentication
└── admin/logout/route.ts  - Admin logout

/lib/
├── translations.ts  - i18n strings (EN/ES)
└── auth.ts         - Auth utilities

/hooks/
└── use-language.ts  - Language state management
```

## Key Features

### Bilingual Support
- Toggle between English and Spanish
- All UI text automatically updates
- Persistent language state during session

### Service Booking
- 4 service packages with pricing
- Custom inquiries via email
- Professional presentation

### Admin-Only Management
- Super admin authentication
- Member role assignment
- Event/activity management
- Attendance tracking

## Authentication Flow

### Public Users
- No login required to view landing page
- Language selection available to all
- Contact form for booking inquiries (email-based)

### Super Admins
- Login required at `/admin/login`
- Role-based access control enforced
- Session stored in HTTP-only cookie

## Deployment

1. Push code to GitHub/Vercel
2. Set environment variables in Vercel project settings
3. Database schema already deployed to Supabase
4. Platform is ready for use

## User Roles

- **super_admin**: Full access to admin panel, manages everything
- **tuno_admin**: Regular admin (currently not used in booking flow)
- **tuno**: Regular member (currently not used in booking flow)
- **pardillo**: Member level (currently not used in booking flow)
- **aspirante**: Aspirant member (currently not used in booking flow)

## Email Configuration

Update the email in `/components/landing/cta.tsx` to your actual contact email:

```javascript
// Change this:
<a href="mailto:info@ucsp-tuna.edu?subject=Event Booking Inquiry">

// To your actual email
<a href="mailto:your-email@domain.edu?subject=Event Booking Inquiry">
```

## Support

For issues or questions, contact the development team or check the admin panel for system status.
