# Aura - Premium AI Avatar Studio

## Overview

Aura is a fully functional AI-powered avatar generation platform built with React, TypeScript, and Express. The application allows users to create customized AI-generated avatars with various styles, poses, and effects. It features a modern white-themed glassmorphic UI design with glowing animations and a freemium business model where users get 10 free credits and can upgrade to premium for unlimited generations.

## Recent Changes

### October 28, 2025 - UI/UX Improvements & Full AI Integration

#### Navigation & Responsiveness
- ✅ **Responsive Navigation**: Made navbar fully responsive with mobile breakpoints
  - Removed "Home" link (Aura logo now serves as home button)
  - Hidden secondary links (Trending, Leaderboard, Premium) on mobile/tablet
  - Responsive text sizing and spacing for all screen sizes
- ✅ **Enhanced Avatar Dropdown**: Redesigned user avatar in navbar
  - Beautiful circular avatar with gradient purple ring effect
  - Improved dropdown with profile picture, name, email, and credit badges
  - Guest mode dropdown with welcoming message and Login/Signup options

#### AI Integration - Production Ready
- ✅ **Gemini AI Integration**: Properly configured for prompt enhancement
  - Checks both GEMINI_API_KEY and GOOGLE_AI_API_KEY for compatibility
  - Enhances user prompts to create more detailed and vivid descriptions
  - Graceful fallback to base prompts if API unavailable
- ✅ **Replicate AI for Custom Avatars**: Integrated SDXL model for all avatar types
  - Custom mode now uses real AI generation (not just placeholders!)
  - Photo mode continues using Replicate for transformations
  - Both modes use Gemini-enhanced prompts for better quality
  - Smart fallback to DiceBear if Replicate fails

#### Guest Mode & Accessibility
- ✅ **Creator Page Guest Access**: Removed authentication requirement
  - Avatar creator now works without login in guest mode
  - Uses demo user for testing and development
  - Better error handling with informative messages
  - Validation for photo uploads before generation

#### Developer Experience
- ✅ **Improved Error Handling**: Enhanced user feedback system
  - Specific error messages for different failure scenarios
  - Console logging for debugging
  - Better loading states during generation
  - Clear validation messages

### Previous Updates - Deployment & Firebase
- ✅ **Firebase Guest Mode**: Made Firebase optional - app runs in guest mode when not configured
- ✅ **Vercel Build Fix**: Resolved TypeScript compilation errors for production
- ✅ **Vercel Deployment Configuration**: Complete setup with proper routing

### October 27, 2025

### Phase 1: Initial Setup
- ✅ Migrated from Lovable to Replit full-stack template
- ✅ Implemented complete data schema for avatars, users, and credits
- ✅ Built all backend API routes (avatar generation, user management)
- ✅ Created all frontend pages:
  - Home page with hero section and glowing animations
  - Avatar Creator with full customization options
  - Gallery page with avatar grid
  - Premium page with pricing and benefits
  - Profile page with saved avatars
- ✅ Added navigation bar with glassmorphism styling
- ✅ Implemented credit system (free users: 10 credits, premium: unlimited)
- ✅ Fixed credit balance reporting bug
- ✅ Added proper query invalidation for real-time UI updates

### Phase 2: Photo Upload & AI Integration
- ✅ **Image Upload System**: Drag-and-drop file upload, camera capture, and image cropping
- ✅ **Replicate AI Integration**: Real AI-powered avatar generation from photos
- ✅ **Photo-to-Avatar Transformation**: Upload selfies and transform into various avatar styles
- ✅ **Multiple Style Variations**: Generate 4-6 different styles (realistic, anime, cartoon, cyberpunk, watercolor, 3D)
- ✅ **Background Removal API**: AI-powered background removal and replacement
- ✅ **Multi-Format Export**: Generate avatars in Profile (400x400), Story (1080x1920), Post (1080x1080), HD (2048x2048) sizes
- ✅ **Two Creation Modes**: 
  - Custom Avatar: Create from scratch with customization options
  - Photo-Based: Upload photo and transform with AI

### Phase 3: Social Media & Viral Growth Features
- ✅ **Social Engagement System**: Like, comment, and share functionality for all avatars
- ✅ **Community Features**: 
  - Trending page showing most liked/shared avatars
  - Leaderboard page ranking top creators by engagement
  - Comments section with user info and timestamps
- ✅ **Social Sharing Integration**: 
  - Platform-optimized sharing (Instagram, Twitter, TikTok, Facebook)
  - Web Share API for native sharing on mobile
  - Batch download feature (ZIP with all sizes)
  - AI-powered hashtag generation
- ✅ **Referral System**: Unique referral codes, credit rewards (5 credits per referral), abuse prevention
- ✅ **Growth Mechanics**:
  - Social proof counters on homepage (user count, avatars created, premium users)
  - Animated counter components for engagement metrics
  - Newsletter signup for weekly style drops
  - Featured creator showcases
- ✅ **Enhanced Navigation**: Added Trending and Leaderboard pages to main navigation
- ✅ **Comprehensive Security Implementation**:
  - Firebase Authentication with ID token verification
  - Server-side authentication middleware
  - All user-scoped endpoints secured against identity spoofing
  - User data isolation enforced (users can only access/modify their own data)
  - Automatic token refresh and header injection on client

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type safety and modern component patterns
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router

**UI Component Library**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui components built on top of Radix UI for consistent design
- Tailwind CSS for utility-first styling with custom design tokens
- Custom glassmorphic and neumorphic styling with CSS variables

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Hook Form with Zod resolvers for form state and validation
- Local component state using React hooks for UI state

**Design System**
- HSL-based color system defined in CSS variables for theme consistency
- Custom color palette: lavender (primary), sky blue (secondary), pink accents
- Glassmorphism effects with backdrop blur and transparency
- Generous spacing, floating cards, and smooth animations throughout

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API endpoints
- TypeScript for type safety across the entire codebase
- Custom middleware for request logging and error handling

**API Structure**
- RESTful API design with `/api` prefix for all endpoints
- Routes organized by resource type (users, avatars)
- Zod schemas shared between frontend and backend for runtime validation

**Development Setup**
- Vite middleware mode for seamless SSR in development
- Hot module replacement for both client and server code
- tsx watch for server-side TypeScript execution

**Production Build**
- Separate builds for client (Vite) and server (TypeScript compiler)
- Static file serving with Express for production deployment
- Client built to `dist`, server compiled to `dist/server` and `dist/shared`
- Vercel deployment uses `api/[...path].ts` as serverless function entry point

### Data Storage

**Current Implementation**
- In-memory storage using Map data structures (`MemStorage` class)
- No persistent database - data resets on server restart
- Default demo user created on server initialization

**Storage Interface Design**
- Abstract `IStorage` interface allows for easy database swapping
- Supports avatar and user CRUD operations
- Prepared for future integration with PostgreSQL/Drizzle ORM or similar

**Data Models**
- **User**: id, name, email, credits, isPremium, referralCode, newsletterSubscribed, timestamps, stats (totalLikes, totalShares, avatarCount)
- **Avatar**: id, userId, prompt, request, URLs, size, isPremium, isPublic, isFeatured, isRemixable, likes, likedBy, shares, comments, hashtags, variations
- **Comment**: id, avatarId, userId, userName, userPhoto, text, timestamp
- **Referral**: id, referrerId, referredUserId, creditsAwarded, status, timestamp
- **AvatarRequest**: comprehensive customization options (gender, age, ethnicity, hair, outfit, art style, etc.)
- **PlatformStats**: totalUsers, totalAvatars, premiumUsers, totalLikes, totalShares

### Authentication & Authorization

**Current Implementation (Production-Ready)**
- ✅ Firebase Authentication with Email/Password and Google Sign-In
- ✅ Server-side ID token verification using Firebase Admin SDK
- ✅ Authentication middleware (`auth-middleware.ts`) on all protected endpoints
- ✅ Client-side automatic token injection via query client

**Security Features**
- All user-scoped endpoints require valid Firebase ID token
- User identity derived from verified token (never from client input)
- Cross-user access prevention - users can only access/modify their own data
- Referral abuse prevention - one code per user
- Protected endpoints include:
  - User profile read/update
  - Premium upgrade
  - Avatar generation and upload
  - Social interactions (like, comment, share)
  - Referral system
  - User avatar listing

**Credit System**
- Free users: 10 credits, limited to 512px resolution
- Premium users: unlimited credits, access to HD sizes (1024px, 2048px)
- Credit deduction on avatar generation
- Referral rewards: 5 credits per successful referral

### AI Integration

**Replicate API Integration**
- Uses Replicate for real AI-powered avatar generation
- Stable Diffusion SDXL model for high-quality photo transformations
- Face-preserving transformations that maintain user's facial features
- Style variations generator for multiple artistic interpretations
- Background removal using rembg model
- Fallback to DiceBear API for custom (non-photo) avatars

**AI Features**
- Photo-to-avatar transformation with facial feature preservation
- Multiple art styles: realistic, anime, cartoon, fantasy, cyberpunk, watercolor, 3D
- Automatic prompt enhancement and optimization
- Background removal and replacement
- Multi-format exports for social media
- Batch variation generation (premium feature)

### Avatar Generation Flow

1. User fills form with customization options
2. Frontend validates via Zod schema
3. Backend checks user credits and premium status
4. System generates descriptive prompt from selections
5. AI service called (currently placeholder)
6. Avatar stored with metadata and URLs
7. User credits decremented (if not premium)
8. Generated avatar returned to client

## External Dependencies

**UI Component Libraries**
- @radix-ui/* - Accessible component primitives (accordion, dialog, select, etc.)
- lucide-react - Icon library for consistent iconography
- cmdk - Command menu component
- embla-carousel-react - Carousel/slider functionality
- next-themes - Theme switching capability

**Form & Validation**
- react-hook-form - Form state management
- @hookform/resolvers - Zod integration for validation
- zod - Schema validation shared across client/server

**Styling**
- tailwindcss - Utility-first CSS framework
- tailwind-merge & clsx - Conditional className utilities
- class-variance-authority - Component variant management
- autoprefixer - CSS vendor prefixing

**Data Fetching**
- @tanstack/react-query - Server state management and caching

**Server**
- express - HTTP server framework
- tsx - TypeScript execution for development

**Build Tools**
- vite - Build tool and dev server
- @vitejs/plugin-react-swc - Fast React refresh with SWC
- typescript - Type checking and compilation

**Routing**
- wouter - Lightweight routing library

**Date Utilities**
- date-fns - Date formatting and manipulation

**Development**
- lovable-tagger - Component tagging for development mode
- eslint & typescript-eslint - Code linting
- @types/express - TypeScript definitions

**Current Integrations**
- ✅ Firebase Authentication (Email/Password + Google Sign-In)
- ✅ Firebase Firestore for user data and settings
- ✅ Firebase Storage for uploaded images
- ✅ Replicate API for AI avatar generation
- ✅ DiceBear API for placeholder/custom avatars
- ✅ Google Gemini AI for prompt enhancement and generation
- ✅ Web Share API for native social sharing

**Implemented Social Features**
- ✅ Social media sharing (Instagram, Twitter, TikTok, Facebook) with platform-optimized exports
- ✅ Batch download with ZIP compression (client-side)
- ✅ AI-powered hashtag generation system
- ✅ Like/comment/share functionality
- ✅ Trending and leaderboard pages
- ✅ Referral tracking and rewards
- ✅ Newsletter subscription system

**Future Enhancement Points**
- Payment processing for premium upgrades (Stripe)
- Animated avatar generation (GIF/MP4)
- Remix feature for duplicating and modifying popular styles
- Direct social media API posting (vs. download + manual upload)
- Email notifications for comments and likes