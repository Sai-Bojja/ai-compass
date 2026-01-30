# Aideas.ai - AI Tool Intelligence Platform

> **Production-grade AI tool discovery platform** powered by hybrid AI + community ranking.

## Overview

Aideas.ai helps users discover, compare, and choose the best AI tools through:
- **AI-powered scoring**: Tools evaluated by AI agents analyzing features, documentation, and capabilities
- **Community validation**: Rankings adapt based on real user feedback and discussions
- **Intelligent search**: Chat with AI assistant for personalized recommendations
- **Rich metadata**: Comprehensive tool profiles with scores, features, and pricing

---

## Quick Start

### For Development

See [**SETUP.md**](./SETUP.md) for complete setup instructions.

**TL;DR:**
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run migrations (via Supabase CLI or Dashboard)
supabase db push

# 4. Seed database
npm run seed

# 5. Start dev server
npm run dev
```

---

## Project Structure

This project is built with modern web technologies for production use:

- **Frontend**: Vite + React 18 + TypeScript
- **UI**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Backend**: Supabase (Postgres + Auth + Edge Functions)
- **State**: TanStack Query for server state
- **Routing**: React Router v6

---

## Key Features

✅ **Tool Discovery**: Browse 15+ AI tools across 7 categories  
✅ **Smart Ranking**: Hybrid scoring (60% AI analysis, 40% community)  
✅ **Community Q&A**: Ask questions, share experiences  
✅ **AI Chat**: Get personalized tool recommendations (Phase 2)  
✅ **RLS Security**: Database-level security with Row Level Security  

---

## Documentation

- [**SETUP.md**](./SETUP.md) - Development setup guide
- [**system_analysis.md**](./artifacts/) - Architecture deep dive
- [**implementation_plan.md**](./artifacts/) - Roadmap and phases

---

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
npm test                 # Run tests (Phase 4)

# Database
npm run seed             # Seed database with sample data
npm run types:generate   # Regenerate TypeScript types from DB
```

---

## Environment Variables

Required for development:
```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For seeding
```

See `.env.example` for complete reference.

---

## Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting:
```bash
npm run build
# Deploy the dist/ folder
```

### Backend
Supabase handles backend infrastructure:
- Database: Postgres with RLS
- Auth: Built-in authentication
- Edge Functions: Deno runtime (for AI chat)

---
