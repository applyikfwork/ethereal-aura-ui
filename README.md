# ✨ Aura - AI Avatar Creator

> **Your Digital Soul, Brought to Life.**

A premium AI-powered avatar creation platform with stunning glassmorphic UI, powered by Google Gemini AI and Supabase.

![Aura Avatar Creator](https://img.shields.io/badge/Status-Functional-success) ![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Gemini%20%7C%20Supabase-blue)

## 🌟 Features

### 🎨 Avatar Studio
- **Comprehensive Customization**: Gender, age, skin tone, hair style & color, outfits, backgrounds
- **Multiple Art Styles**: Realistic, Anime, Fantasy, Cartoon, Cyberpunk
- **Magical Aura Effects**: Subtle, Strong, Holographic glow effects
- **AI-Powered Generation**: Creates 4 unique variations using Google Gemini 2.0
- **High Resolution**: 512px, 1024px, 2048px (Premium)

### 👤 User Features
- **Authentication**: Google OAuth via Supabase Auth
- **Credit System**: 3 free avatars per day, unlimited with Premium
- **Personal Gallery**: Save and manage your avatar collection
- **Community Gallery**: Browse and discover public avatars
- **Premium Membership**: Aura+ with unlimited generation

## 🚀 Getting Started

The application is already running! Simply:

1. **Sign In**: Click "Sign In" in the top-right and authenticate with Google
2. **Create Avatar**: Navigate to "Studio" and customize your avatar settings
3. **Generate**: Click "Generate Avatar" to create 4 unique variations
4. **Download**: Save your favorite avatars
5. **Explore**: Check out the Gallery to see what others have created

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **AI**: Google Gemini 2.0 Flash (Image Generation)
- **Auth & Database**: Supabase
- **State Management**: TanStack Query
- **Routing**: Wouter

## 📁 Project Structure

```
├── client/src/          # Frontend React application
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui component library
│   │   ├── Hero.tsx    # Landing page hero section
│   │   ├── Features.tsx
│   │   ├── Showcase.tsx
│   │   ├── CTA.tsx
│   │   └── Navbar.tsx  # Navigation bar
│   ├── pages/          # Application pages
│   │   ├── Index.tsx   # Home/Landing page
│   │   ├── Studio.tsx  # Avatar creation studio
│   │   ├── Gallery.tsx # Public avatar gallery
│   │   ├── Profile.tsx # User dashboard
│   │   └── Premium.tsx # Premium membership page
│   ├── contexts/       # React contexts
│   │   └── AuthContext.tsx
│   └── lib/            # Utilities
│       ├── supabase.ts
│       └── queryClient.ts
├── server/             # Backend Express server
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API endpoints
│   ├── gemini.ts      # Gemini AI integration
│   ├── storage.ts     # Data persistence layer
│   └── supabase.ts    # Supabase server client
└── shared/            # Shared types
    └── schema.ts      # Data schemas & validation
```

## 🎨 Design System

The app features a modern **white-glass aesthetic** with neon glow accents:

- **Colors**: Lavender (#B8A4D7), Sky Blue (#A0E8FF), Pink (#FFC6E7)
- **Effects**: Glassmorphism, neumorphism, smooth animations
- **Typography**: Light font weights with gradient text overlays
- **Responsive**: Mobile-first design that works beautifully on all devices

## 🔧 API Endpoints

### User Management
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `PATCH /api/users/:id/credits` - Update credits
- `PATCH /api/users/:id/premium` - Update premium status

### Avatar Operations
- `POST /api/avatars/generate` - Generate 4 avatar variations
- `GET /api/avatars/:id` - Get avatar by ID
- `GET /api/users/:userId/avatars` - Get user's avatars
- `GET /api/avatars/public/gallery` - Get public avatars
- `PATCH /api/avatars/:id/public` - Toggle avatar visibility
- `DELETE /api/avatars/:id` - Delete avatar

## ⚙️ Environment Variables

The following environment variables are configured in Replit Secrets:

```
GEMINI_API_KEY          # Google AI Studio API key
SUPABASE_URL            # Supabase project URL
SUPABASE_ANON_KEY       # Supabase anonymous key
SUPABASE_SERVICE_KEY    # Supabase service role key
```

## 💎 Premium (Aura+) - $20/month

- ♾️ **Unlimited** avatar generation
- 🖼️ **2048px** ultra high-resolution
- ✨ **Exclusive** stylized glow effects
- ⚡ **2x faster** generation speed
- 🚫 **No watermarks** on downloads
- 🎯 **Early access** to new features

## 📝 Current Status

### ✅ Fully Functional
- Complete UI/UX for all pages
- Gemini AI avatar generation working
- Google OAuth authentication
- Credit tracking system
- All API endpoints operational
- Responsive design with animations

### ⚠️ Notes for Production
The app currently uses **in-memory storage** for demonstration purposes. For production deployment:

1. **Add Database Persistence**: Migrate from in-memory to Supabase PostgreSQL
2. **Add Image Storage**: Store generated avatars in Supabase Storage or CDN
3. **Add Payment Integration**: Implement Stripe for Premium subscriptions
4. **Add Email Auth**: Extend beyond Google OAuth for broader access

See `replit.md` for detailed migration instructions.

## 🚢 Deployment

Ready to deploy? Click the **"Publish"** button in Replit to deploy your app to production with a live URL!

## 📚 Documentation

- Full project documentation: See `replit.md`
- API reference: Check `/server/routes.ts`
- Component library: Browse `/client/src/components`

---

**Built with ✨ on Replit using Google Gemini AI and Supabase**
