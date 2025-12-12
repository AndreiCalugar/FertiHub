# Vercel Deployment Checklist

## ✅ Required Environment Variables

Make sure ALL of these are set in your Vercel project settings:

### Supabase (Required - App won't work without these)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### SendGrid (Optional - Email features won't work without these)
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Cron Jobs (Optional - Automated reminders won't work without this)
```
CRON_SECRET=your-random-secret-string
```

## 🔍 How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project after adding variables

## 🐛 Common 500 Error Causes

### 1. Missing Supabase Variables
**Error:** Cannot read properties of undefined
**Solution:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Database Not Migrated
**Error:** Relation "user_profiles" does not exist
**Solution:** Run migrations in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 3. Build-time vs Runtime Variables
**Error:** Variables are undefined during build
**Solution:** 
- Variables starting with `NEXT_PUBLIC_` are available at build time
- Other variables are only available at runtime (server-side)

### 4. Middleware Error
**Error:** Middleware failing on protected routes
**Solution:** Ensure Supabase credentials are correct

## 📊 How to Debug 500 Errors in Vercel

### Step 1: Check Function Logs
1. Go to **Deployments** → Select failed deployment
2. Click **Functions** tab
3. Look for any function with errors
4. Click on it to see the full stack trace

### Step 2: Check Build Logs
1. In the deployment page
2. Look at the **Build Logs** tab
3. Search for "Error" or "Failed"

### Step 3: Check Runtime Logs
1. Go to your project
2. Click **Logs** in the left sidebar
3. Filter by **Errors only**
4. Look for the route that's failing

## 🔧 Quick Fix Steps

### If you see "Missing environment variable"
```bash
# Add the missing variable in Vercel Dashboard
# Then trigger a new deployment
```

### If database tables don't exist
1. Go to Supabase Dashboard → SQL Editor
2. Run all migrations from `/supabase/migrations/`
3. Verify tables exist:
   ```sql
   SELECT * FROM user_profiles LIMIT 1;
   ```

### If authentication fails
1. Check Supabase URL is correct (no trailing slash)
2. Check anon key matches your Supabase project
3. Verify Site URL in Supabase Auth settings:
   - Go to **Authentication** → **URL Configuration**
   - Add your Vercel domain: `https://your-app.vercel.app`

## 📝 Next Steps

1. [ ] Verify all environment variables are set in Vercel
2. [ ] Check Function logs for specific error messages
3. [ ] Verify database migrations have been run in Supabase
4. [ ] Check Supabase Auth URL configuration
5. [ ] Test a fresh deployment after fixes

## 🆘 If Still Having Issues

Please provide:
1. Full error from Vercel **Functions** tab
2. Screenshot of your Vercel **Environment Variables**
3. Database error from Supabase (if any)

