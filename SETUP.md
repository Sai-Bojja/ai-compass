# Aideas.ai - Development Setup Guide

## Prerequisites

- **Node.js** 18+ and npm (or bun)
- **Supabase Account** - [Sign up for free](https://supabase.com)
- **Supabase CLI** (optional but recommended) - [Installation guide](https://supabase.com/docs/guides/cli)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-git-url>
cd ai-compass

# Install dependencies
npm install
```

---

## 2. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and set project name (e.g., "ai-compass-dev")
4. Set database password (save this!)
5. Choose region closest to you
6. Wait for project to finish setting up (~2 minutes)

---

## 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

1. **Get Project ID and URL:**
   - Dashboard → Settings → API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Extract project ID from URL → `VITE_SUPABASE_PROJECT_ID`

2. **Get Anon Key:**
   - Dashboard → Settings → API
   - Copy "anon public" key → `VITE_SUPABASE_PUBLISHABLE_KEY`

3. **Get Service Role Key (for seeding):**
   - Dashboard → Settings → API
   - Reveal "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Never commit this key!**

---

## 4. Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your project
supabase link --project-ref <your-project-id>

# Push migrations
supabase db push
```

### Option B: Using SQL Editor

1. Go to Dashboard → SQL Editor
2. Open `supabase/migrations/20260126154607_feac8c83-745a-4023-ab51-1125ab535154.sql`
3. Copy and paste the entire file
4. Click "Run"
5. Repeat for `20260126154616_edcbb9a9-7160-43b2-98b6-7cb7541ca388.sql`

---

## 5. Seed the Database

### Option A: Using the seed script

```bash
npm run seed
```

### Option B: Using SQL Editor

1. Dashboard → SQL Editor
2. Copy `supabase/seed.sql` contents
3. Paste and Run

You should see:
- ✅ 7 categories
- ✅ 16 AI tools
- ✅ AI scores
- ✅ Community scores

---

## 6. Create Admin User (Optional)

1. Go to Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email/password
4. Copy the User ID
5. Go to Dashboard → SQL Editor
6. Run:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<paste-user-id-here>', 'admin');
   ```

---

## 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

You should see:
- ✅ Home page with top 5 ranked tools
- ✅ Tools directory at `/tools`
- ✅ Tool detail pages working
- ✅ Community page (empty until you create questions)

---

## 8. Verify Everything Works

### Check the Home Page
- You should see "GitHub Copilot", "ChatGPT", "Cursor", etc.
- Click on a tool → should show details, scores, features

### Check the Tools Directory
- Filter by category
- Search for "ChatGPT"
- Sort by different scores

### Check the Chat
- Click "Ask the AI" → `/chat`
- ⚠️ This will NOT work yet (requires OpenAI API key - Phase 2)

---

## Troubleshooting

### "No tools found"
- **Issue**: Database not seeded
- **Fix**: Run `npm run seed` or manually execute `seed.sql`

### "User not authenticated" errors
- **Issue**: RLS policies blocking anonymous access
- **Fix**: Migrations should have public read policies. Re-run migrations.

### Seed script fails
- **Issue**: Missing `SUPABASE_SERVICE_ROLE_KEY`
- **Fix**: Add service role key to `.env` from Dashboard → Settings → API

### TypeScript errors
- **Issue**: Generated types out of sync
- **Fix**: Run `npm run types:generate` (requires Supabase CLI)

---

## Next Steps

- **Phase 2**: Implement OpenAI chat integration
- **Phase 3**: Add ranking agent and community scoring
- **Phase 4**: Add tests and documentation

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Database
npm run seed                   # Seed database
npm run seed:reset             # Reset and re-seed (⚠️ deletes data!)
npm run types:generate         # Regenerate TypeScript types

# Testing (Phase 4)
npm test                       # Run tests
npm run test:watch             # Watch mode
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_PROJECT_ID` | Yes | Your Supabase project ID |
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Anon/public key for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | Service role key for seeding |
| `OPENAI_API_KEY` | Phase 2 | For AI chat feature |

---

For more information on the architecture, see `system_analysis.md` in the artifacts directory.
