-- 1. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_tier TEXT DEFAULT 'trial' CHECK (plan_tier IN ('trial', 'eco', 'business')),
    status TEXT DEFAULT 'active', -- active, cancelled, expired
    credits_used INTEGER DEFAULT 0,
    credits_limit INTEGER DEFAULT 10000, -- Trial: 10k, Eco: 100k, Business: 500k
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id to all resource tables
ALTER TABLE brands ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE research ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE articles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE batch_jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Settings tables (composite key approach or just add user_id)
-- For backward compatibility, we might keep global settings but let's make them user-specific now.
-- We might need to migrate existing settings or just start fresh for users.
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 3. Update RLS Policies to ensure isolation
-- First, drop the old "Allow All Access" policies if they exist
DROP POLICY IF EXISTS "Allow All Access" ON brands;
DROP POLICY IF EXISTS "Allow All Access" ON keywords;
DROP POLICY IF EXISTS "Allow All Access" ON research;
DROP POLICY IF EXISTS "Allow All Access" ON articles;
DROP POLICY IF EXISTS "Allow All Access" ON batch_jobs;
DROP POLICY IF EXISTS "Allow All Access" ON ai_usage_logs;
DROP POLICY IF EXISTS "Allow All Access" ON app_settings;
DROP POLICY IF EXISTS "Allow All Access" ON ai_settings;

-- Create new isolated policies
-- Brands
CREATE POLICY "Users can only view own brands" ON brands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own brands" ON brands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update own brands" ON brands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete own brands" ON brands FOR DELETE USING (auth.uid() = user_id);

-- Keywords
CREATE POLICY "Users can only view own keywords" ON keywords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own keywords" ON keywords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update own keywords" ON keywords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete own keywords" ON keywords FOR DELETE USING (auth.uid() = user_id);

-- Research
CREATE POLICY "Users can only view own research" ON research FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own research" ON research FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update own research" ON research FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete own research" ON research FOR DELETE USING (auth.uid() = user_id);

-- Articles
CREATE POLICY "Users can only view own articles" ON articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own articles" ON articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update own articles" ON articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete own articles" ON articles FOR DELETE USING (auth.uid() = user_id);

-- Batch Jobs
CREATE POLICY "Users can only view own batch_jobs" ON batch_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own batch_jobs" ON batch_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update own batch_jobs" ON batch_jobs FOR UPDATE USING (auth.uid() = user_id);

-- AI Usage Logs
CREATE POLICY "Users can only view own logs" ON ai_usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert own logs" ON ai_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users can only view own app_settings" ON app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert/update own app_settings" ON app_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only view own ai_settings" ON ai_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert/update own ai_settings" ON ai_settings FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Only service role (admin) should update subscriptions usually, but for trial creation:
CREATE POLICY "Users can insert own subscription" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

