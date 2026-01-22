# Quick Start Guide - Supabase Integration

## 🚀 Get Your App Running with Supabase in 5 Steps

### Step 1: Create Your Supabase Project (2 minutes)
1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Fill in project details:
   - Name: `Smart Scribes`
   - Database Password: (remember this!)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for the project to be ready (~2 minutes)

### Step 2: Run the SQL Schema (1 minute)
1. In your Supabase project, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Open the file `supabase_schema.sql` from this project
4. Copy ALL the content and paste into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" message

### Step 3: Get Your API Keys (30 seconds)
1. In Supabase dashboard, go to Settings (gear icon) → API
2. Find "Project URL" and copy it
3. Find "Project API keys" → "anon" "public" key
4. Copy the anon key (starts with `eyJ...`)

### Step 4: Configure Environment Variables (30 seconds)
1. In the root of this project, create a file named `.env.local`
2. Add these lines:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
   ```
3. Replace the placeholders with your actual values from Step 3

### Step 5: Run the Application (30 seconds)
```bash
npm run dev
```

Open http://localhost:3000 and you're ready! 🎉

## ✅ Verify It's Working

1. **For Students**: 
   - Click "I'm a Student"
   - Select an institute
   - Fill in details and continue
   - You should see courses from the database

2. **For Professors**:
   - Click "I'm a Professor"
   - Select an institute
   - Fill in your email and continue
   - You should see your dashboard with courses

## 📊 View Your Data

To see the data in your database:
1. Go to Supabase dashboard
2. Click "Table Editor" (left sidebar)
3. Click on any table name to view its data

## 🐛 Troubleshooting

### "Invalid API key" error
**Solution**: Check your `.env.local` file has the correct values and restart the dev server.

### "Table does not exist" error  
**Solution**: Make sure you ran the SQL schema (Step 2). Check the SQL Editor history to verify.

### No courses showing
**Solution**: The SQL schema includes sample data. Check "Table Editor" to see if data exists in the `courses` table.

### Still having issues?
- Check browser console for error messages (F12 → Console)
- Verify your `.env.local` file exists and has correct values
- Make sure you restarted `npm run dev` after creating `.env.local`
- See `README_SUPABASE_SETUP.md` for detailed instructions

## 📝 Next Steps

Once everything is working:
1. Read `SUPABASE_MIGRATION_SUMMARY.md` to understand what changed
2. Check `README_SUPABASE_SETUP.md` for advanced configuration
3. Explore adding Row Level Security (RLS) for production
4. Implement authentication using Supabase Auth
5. Add file uploads using Supabase Storage

## 🎓 Key Files Reference

- `supabase_schema.sql` - Database schema (run this in Supabase SQL Editor)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/api.ts` - API functions for database operations
- `.env.local` - Your environment variables (create this file!)
- `README_SUPABASE_SETUP.md` - Detailed setup guide
- `SUPABASE_MIGRATION_SUMMARY.md` - Technical details of the migration
