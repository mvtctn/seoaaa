# 🚨 Critical Database Migration Required

You are encountering errors because your Supabase database schema is missing the new `user_id` columns required for the multi-user update.

**Error:** `Could not find the 'user_id' column of 'keywords' in the schema cache`

## How to Fix (Immediate Action Required)

1. **Go to your Supabase Dashboard** for this project.
2. Navigate to the **SQL Editor** (finding the icon on the left sidebar).
3. Click **"New Query"**.
4. **Copy and Paste** the entire content of the file `scripts/upgrade-subscription.sql` into the SQL Editor.
   - You can find this file in your project at `d:\VibeCoding\Project\SeoAAA\scripts\upgrade-subscription.sql`.
5. Click **"RUN"**.

## What this script does:
- Adds `user_id` column to `keywords`, `articles`, `brands`, `research`, etc.
- Creates the `user_subscriptions` table.
- Enables Row Level Security (RLS) to ensure users only see their own data.

## After Running the Script:
1. **Restart your Next.js server** (`Ctrl+C` then `npm run dev`) to ensure the application reconnects with the fresh schema.
2. Try creating a research or article again.

If you still see "schema cache" errors, go to **Project Settings > API** in Supabase and click **"Reload Schema Cache"** (if available) or simply wait a few minutes as Supabase refreshes its cache automatically.
