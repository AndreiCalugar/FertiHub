# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: fertihub (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (under Project URL section)
   - **anon/public key** (under Project API keys section)

## 3. Configure Environment Variables

1. Open the `.env.local` file in the root of your project
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run Database Migrations

After setting up your credentials, you'll need to create the database schema. See the instructions in `/supabase/migrations/README.md` (coming in Phase 1.3).

## Usage

### Client-Side (Browser)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Example: Fetch data
const { data, error } = await supabase
  .from('suppliers')
  .select('*')
```

### Server-Side (Server Components, Route Handlers)

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

// Example: Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## Authentication

The middleware automatically:
- Protects `/dashboard/*` routes (redirects to `/login` if not authenticated)
- Redirects authenticated users away from `/login` and `/signup` to `/dashboard`
- Refreshes user sessions

## Next Steps

1. Create the database schema (Phase 1.3)
2. Set up Row Level Security (RLS) policies
3. Configure email templates in Supabase (optional)

