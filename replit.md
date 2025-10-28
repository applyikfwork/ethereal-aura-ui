# Aura - Premium AI Avatar Studio

## Overview
Aura is an AI-powered avatar generation platform built with React, TypeScript, and Express. It enables users to create customized AI-generated avatars with various styles, poses, and effects, featuring a modern white-themed glassmorphic UI. The platform operates on a freemium model, offering 10 free credits and a premium upgrade for unlimited generations. Key capabilities include generating avatars from scratch or transforming user photos, multi-style variations, background removal, multi-format export, and social engagement features like sharing, likes, comments, and a referral system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Build Tool**: React 18 with TypeScript, Vite for fast development and bundling, and Wouter for lightweight client-side routing.
- **UI Component Library**: Radix UI primitives and shadcn/ui for accessible and consistent design, styled with Tailwind CSS for utility-first styling. Features custom glassmorphic and neumorphic aesthetics with HSL-based color system.
- **State Management**: TanStack Query for server state management and data fetching; React Hook Form with Zod for form handling and validation.

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for HTTP server and RESTful API endpoints.
- **Development Setup**: Vite middleware mode for SSR in development, hot module replacement, and `tsx watch` for server-side TypeScript execution.
- **Production Build**: Separate builds for client (Vite) and server (TypeScript), deployed via Vercel using serverless functions.

### Data Storage
- **Current Implementation**: In-memory storage (`MemStorage`) for development, with a default demo user. Data resets on server restart.
- **Storage Interface Design**: Abstract `IStorage` interface designed for future integration with persistent databases like PostgreSQL/Drizzle ORM.
- **Data Models**: Comprehensive models for User, Avatar, Comment, Referral, AvatarRequest (detailing customization options), and PlatformStats.

### Authentication & Authorization
- **Implementation**: Firebase Authentication (Email/Password, Google Sign-In) with server-side ID token verification using Firebase Admin SDK.
- **Security**: Authentication middleware protects all user-scoped endpoints, ensuring user identity verification and preventing cross-user access or identity spoofing.
- **Credit System**: Freemium model with 10 free credits (limited resolution) and unlimited premium credits (HD resolution). Credits are deducted per avatar generation.

### AI Integration
- **Core AI**: Replicate API for AI avatar generation, utilizing SDXL for high-quality photo transformations and style variations, and rembg for background removal. DiceBear API serves as a fallback for custom (non-photo) avatars.
- **AI Features**: Photo-to-avatar transformation, multiple art styles, automatic prompt enhancement via Google Gemini AI, background removal/replacement, multi-format exports, and batch variation generation.
- **Avatar Generation Flow**: User input -> Frontend validation -> Backend credit check -> Prompt generation -> AI service call -> Avatar storage -> Credit deduction -> Avatar return to client.

## External Dependencies

### UI Component Libraries
- `@radix-ui/*`
- `lucide-react`
- `cmdk`
- `embla-carousel-react`

### Form & Validation
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

### Styling
- `tailwindcss`
- `tailwind-merge`, `clsx`, `class-variance-authority`
- `autoprefixer`

### Data Fetching
- `@tanstack/react-query`

### Server
- `express`
- `tsx`

### Build Tools
- `vite`
- `@vitejs/plugin-react-swc`
- `typescript`

### Routing
- `wouter`

### Date Utilities
- `date-fns`

### Current Integrations
- **Authentication**: Firebase Authentication
- **Database/Storage**: Firebase Firestore (for user data), Firebase Storage (for uploaded images)
- **AI Services**: Replicate API, DiceBear API, Google Gemini AI
- **Web APIs**: Web Share API

### Implemented Social Features
- Social media sharing (Instagram, Twitter, TikTok, Facebook)
- Batch download (client-side ZIP compression)
- AI-powered hashtag generation
- Like/comment/share functionality
- Trending and leaderboard pages
- Referral tracking and rewards
- Newsletter subscription system