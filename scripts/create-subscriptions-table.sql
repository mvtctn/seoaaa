-- Create user_subscriptions table if not exists (including for tracking payments/plans)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    plan_tier TEXT CHECK (plan_tier IN ('free', 'premium', 'enterprise')) DEFAULT 'free',
    status TEXT DEFAULT 'active',
    credits_used INTEGER DEFAULT 0,
    credits_limit INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Allow All Access" ON user_subscriptions;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Simpler manual policy for now:
CREATE POLICY "Allow All Access" ON user_subscriptions FOR ALL USING (true) WITH CHECK (true);
