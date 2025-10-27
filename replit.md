# Aura - Premium AI Avatar Studio

## Overview

Aura is a fully functional AI-powered avatar generation platform built with React, TypeScript, and Express. The application allows users to create customized AI-generated avatars with various styles, poses, and effects. It features a modern white-themed glassmorphic UI design with glowing animations and a freemium business model where users get 10 free credits and can upgrade to premium for unlimited generations.

## Recent Changes (October 27, 2025)

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
- 🔄 Using placeholder images (DiceBear API) - ready for AI integration

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
- Client built to `dist/public`, server to `dist`

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
- User: id, name, email, credits, isPremium status, creation timestamp
- Avatar: id, userId, prompt, request parameters, generated URLs, size, premium flag
- AvatarRequest: comprehensive customization options (gender, age, ethnicity, hair, outfit, art style, etc.)

### Authentication & Authorization

**Current State**
- No authentication implemented - uses hardcoded "demo" user
- User identification passed via request body (`userId` field)

**Credit System**
- Free users: 10 credits, limited to 512px resolution
- Premium users: unlimited credits, access to HD sizes (1024px, 2048px)
- Credit deduction on avatar generation

**Future Considerations**
- Ready to integrate session-based or JWT authentication
- User endpoints prepared for multi-user scenarios

### AI Integration

**Placeholder Implementation**
- Currently uses DiceBear API for placeholder avatar generation
- Generates unique SVG avatars based on timestamp seed

**Architecture for Real AI**
- Prompt generation function converts user selections to descriptive text
- Ready to integrate with:
  - OpenAI DALL-E API
  - Replicate (Stable Diffusion)
  - Other image generation services
- Response structure includes multiple URL variants (normal, thumbnail, stylized)

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

**Future Integration Points**
- Database ORM (Drizzle recommended based on project structure)
- PostgreSQL or similar relational database
- AI image generation API (OpenAI, Replicate, etc.)
- Authentication provider (Auth0, Clerk, or custom JWT)
- Cloud storage for avatar images (AWS S3, Cloudinary)
- Payment processing for premium upgrades (Stripe)