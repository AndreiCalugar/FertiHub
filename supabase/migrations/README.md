# Database Migrations

This directory contains SQL migration files for setting up the FertiHub database schema.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for MVP)

1. Log in to your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `20240101000000_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Verify success - you should see "Success. No rows returned"

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Link your project (one-time setup)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Verifying Your Schema

After running the migration, verify the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see the following tables:
   - `user_profiles`
   - `suppliers`
   - `product_categories` (with 10 pre-populated categories)
   - `inquiries`
   - `inquiry_suppliers`
   - `quotes`
   - `notifications`

## Database Schema Overview

### Core Tables

- **user_profiles**: Extended user information (organization, role, location)
- **suppliers**: Supplier contacts managed by each user
- **product_categories**: Pre-defined IVF product categories
- **inquiries**: Quote requests created by users
- **inquiry_suppliers**: Junction table tracking which suppliers were contacted per inquiry
- **quotes**: Supplier quotes (manually entered in MVP, AI-extracted in future)
- **notifications**: In-app notifications for users

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Profiles, inquiries, quotes are user-scoped
- Suppliers are user-specific (each user maintains their own list)
- Product categories are globally readable

### Automatic Features

- **Auto-timestamps**: `created_at` and `updated_at` are automatically managed
- **Status updates**: When quotes are added, inquiry status automatically updates to 'partial' or 'completed'
- **Response tracking**: `response_received` flag automatically updates when quotes are submitted
- **Performance indexes**: Database queries are optimized with strategic indexes

## Next Steps

After running migrations:
1. Test database access from the application
2. Create a test user and profile
3. Add sample suppliers and categories
4. Verify RLS policies are working correctly

