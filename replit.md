# Aura - AI Avatar Creator

**Your Digital Soul, Brought to Life.**

## Overview

Aura is a premium AI avatar creation platform powered by Stability AI and Supabase. Users can create stunning, personalized AI avatars with magical aura effects through an intuitive, beautifully designed interface.

### Key Features

- **AI-Powered Avatar Generation**: Create custom avatars using advanced AI with customizable features
- **Multiple Art Styles**: Realistic, Anime, Fantasy, Cartoon, and Cyberpunk styles
- **Aura Effects**: Unique glowing aura effects (Subtle, Strong, Holographic)
- **User Authentication**: Powered by Supabase Auth with email/password and Google OAuth support
- **Credit System**: Free tier with 3 avatars/day, Premium tier with unlimited generation
- **Community Gallery**: Browse and share public avatars
- **Personal Profile**: Save and manage your avatar collection

## Project Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **AI**: Stability AI (Stable Diffusion Image Generation)
- **Auth & Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Showcase.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── AuthDialog.tsx  # Email/password authentication dialog
│   │   ├── contexts/      # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── lib/           # Utility libraries
│   │   │   ├── supabase.ts
│   │   │   └── queryClient.ts
│   │   ├── pages/         # Application pages
│   │   │   ├── Index.tsx       # Landing page
│   │   │   ├── Studio.tsx      # Avatar creation studio
│   │   │   ├── Gallery.tsx     # Public avatar gallery
│   │   │   ├── Profile.tsx     # User profile & saved avatars
│   │   │   └── Premium.tsx     # Premium membership page
│   │   └── App.tsx        # Main app component
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # In-memory storage implementation
│   ├── stability.ts      # Stability AI integration
│   └── supabase.ts       # Supabase server client
└── shared/               # Shared types and schemas
    └── schema.ts         # Drizzle ORM schemas & Zod validation
```

## Features by Page

### 🏠 Home (Landing Page)
- Hero section with animated background and gradient overlays
- Feature showcase with glassmorphic cards
- Call-to-action buttons linking to Studio and Gallery

### 🎨 Avatar Studio
- Comprehensive customization panel:
  - Gender, Age, Skin Tone
  - Hair Style & Color
  - Outfit, Background
  - Art Style, Pose
  - Aura Effect intensity
  - Resolution (512px, 1024px, 2048px Premium)
- Real-time preview with loading states
- Generates 4 avatar variations simultaneously
- Download functionality
- Credit tracking

### 🖼️ Gallery
- Browse public community avatars
- Filter by art style
- Like and share functionality (UI ready)
- Responsive grid layout

### 👤 Profile
- User information display
- Credits and membership status
- Personal avatar collection
- Download saved avatars
- Empty state with CTA to Studio

### 💎 Premium (Aura+)
- Feature comparison (Free vs Premium)
- Pricing: $20/month
- Premium benefits:
  - Unlimited avatars
  - 2048px resolution
  - No watermarks
  - 2x faster generation
  - Early access to features

## API Endpoints

### User Management
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `PATCH /api/users/:id/credits` - Update user credits
- `PATCH /api/users/:id/premium` - Update premium status

### Avatar Generation & Management
- `POST /api/avatars/generate` - Generate new avatars (4 variations)
- `GET /api/avatars/:id` - Get avatar by ID
- `GET /api/users/:userId/avatars` - Get user's avatars
- `GET /api/avatars/public/gallery` - Get public avatars
- `PATCH /api/avatars/:id/public` - Toggle avatar visibility
- `DELETE /api/avatars/:id` - Delete avatar

## Environment Variables

Required environment variables (stored in Replit Secrets):

```
STABILITY_API_KEY        # Stability AI API key (from platform.stability.ai)
SUPABASE_URL             # Supabase project URL
SUPABASE_ANON_KEY        # Supabase anonymous key
SUPABASE_SERVICE_KEY     # Supabase service role key
```

Frontend environment variables (in .env):
```
VITE_SUPABASE_URL        # Supabase URL for frontend
VITE_SUPABASE_ANON_KEY   # Supabase anon key for frontend
```

## Design System

### Colors
- **Primary**: Lavender (`#B8A4D7`)
- **Secondary**: Sky Blue (`#A0E8FF`)
- **Accent**: Pink (`#FFC6E7`)
- **Gradient**: Lavender → Primary → Sky

### Visual Style
- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Neumorphism**: Soft shadows and highlights
- **Glow Effects**: Animated glowing elements on hover
- **Smooth Animations**: Fade-in, slide-up, float effects
- **Typography**: Poppins/Inter, light weight with gradient text

## Current State

### ✅ Completed
- Full-stack application architecture
- Data schema and type definitions
- Gemini AI integration for avatar generation
- Supabase authentication setup
- In-memory storage implementation (MemStorage)
- Complete frontend UI (all pages)
- API route handlers
- Navigation and routing
- Authentication context and flow
- Responsive design

### ⏳ Pending
- Stripe payment integration for Premium
- Supabase database migration (currently using in-memory storage)
- Image storage in Supabase Storage
- Like/Share functionality implementation
- Actual watermark addition for free tier

## Development

### Running the Project

The project is configured to run automatically with the "Start application" workflow:

```bash
npm run dev
```

This starts both the Express backend (port 5000) and Vite frontend server.

### Key Libraries

- `@supabase/supabase-js` - Supabase client
- Native `fetch` API - Stability AI REST API integration
- `@tanstack/react-query` - Data fetching and caching
- `wouter` - Lightweight routing
- `zod` - Schema validation
- `drizzle-orm` - Type-safe ORM
- `tailwindcss` - Utility-first CSS
- `shadcn/ui` - Accessible component library

## User Preferences

- Modern, premium, minimal design aesthetic
- White-glass theme with neon glow accents
- Smooth, magical, emotionally engaging UX
- Mobile-first responsive design

## Recent Changes (October 29, 2025)

### Latest Update - Authentication & Avatar Generation Improvements (October 29, 2025)
- ✅ **Fixed Authentication Dialog Layout**: Removed hover effects from dialog to prevent card position shifting
  - Changed `glass-card` to `glass` for stable positioning
  - Adjusted tab spacing to eliminate layout jumps during login/signup transitions
  - Added `overflow-hidden` to prevent content overflow issues
- ✅ **Improved Avatar Generation Reliability**: 
  - **Sequential Generation**: Changed from parallel to sequential generation with 1-second delays between requests
  - **Partial Success Support**: System now returns successfully generated avatars even if some fail
  - **Better Error Handling**: Added specific error messages for API key issues, credit problems, and network errors
  - **User Feedback**: Toast notifications now show partial success warnings when fewer than 4 avatars are generated
  - **Resilient Processing**: Each avatar generation is attempted independently, preventing total failure
- ✅ **Enhanced User Experience**:
  - Clear error messages for insufficient credits
  - Informative feedback when some avatars fail to generate
  - Improved toast notifications with context-aware titles and descriptions
  - Better pluralization in user-facing messages

### Previous Update - Switched to Stability AI (October 29, 2025)
- ✅ **Migrated to Stability AI**: Replaced Gemini/Imagen with Stability AI for avatar generation
  - **Change**: Switched from Google's Gemini AI to Stability AI's Stable Diffusion
  - **Reason**: User requested to use Stability AI instead of Gemini
  - **Implementation**: 
    - Created new `server/stability.ts` module using Stability AI REST API v2beta
    - Uses `stable-image/generate/core` endpoint for high-quality image generation
    - Supports style presets: photographic, anime, fantasy-art, comic-book, neon-punk
    - Direct REST API integration (no SDK needed) using native fetch
    - Parallel generation of 4 avatars per request
  - **API Configuration**: 
    - Endpoint: `https://api.stability.ai/v2beta/stable-image/generate/core`
    - Output format: PNG, Base64 encoded
    - Aspect ratio: 1:1 (square avatars)
  - **Error Handling**: 
    - Clear error messages for invalid API keys (401)
    - Credit balance warnings (402)
    - Network error detection
  - Updated `server/routes.ts` to import from `stability.ts` instead of `gemini.ts`
  - Removed dependency on `@google/genai` package

### Previous Update - Avatar Generation Fix (October 29, 2025)
- ✅ **Fixed Avatar Generation**: Upgraded from deprecated Gemini model to Imagen 4.0
  - Fixed 500 internal server error in avatar generation
  - Migrated to production-ready `imagen-4.0-generate-001` model
  - Added batch generation support and better error handling

### Previous Update - Email Authentication (October 29, 2025)
- ✅ **Email/Password Authentication**: Added complete email authentication system
  - Created `AuthDialog` component with login and signup forms
  - Implemented using react-hook-form with zodResolver for validation
  - Added `loginSchema` and `signupSchema` to shared/schema.ts
  - Both Google OAuth and email/password options available in one dialog
  - Proper error handling and loading states
  - Follows fullstack_js form architecture guidelines
- ✅ **Updated Navbar**: Sign In button now opens authentication dialog instead of direct Google OAuth
- ✅ **Form Validation**: Client-side validation with zod schemas including password confirmation

### Previous Updates
- ✅ **Environment Setup Complete**: All API keys and secrets configured in Replit Secrets
- ✅ **Database Ready**: Created comprehensive SQL setup (`supabase_setup.sql`) for production
- ✅ **Fixed Authentication**: Updated Supabase configuration to handle missing credentials gracefully
- ✅ **Fixed UI Warnings**: Resolved React DOM nesting warnings in Navbar component
- ✅ **Documentation**: Added complete setup instructions (`SETUP_INSTRUCTIONS.md`)

### Initial Setup
- Initial project setup with full-stack architecture
- Integrated Gemini AI for avatar generation
- Set up Supabase authentication
- Created all main pages (Home, Studio, Gallery, Profile, Premium)
- Implemented navigation and routing
- Added authentication context and user management
- Created API endpoints for avatars and users
- In-memory storage for development (ready to migrate to Supabase)
