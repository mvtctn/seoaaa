-- 1. Update the plan_tier constraint and default value
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_tier_check;

-- Existing data migration (if any)
UPDATE user_subscriptions SET plan_tier = 'free' WHERE plan_tier = 'trial';
UPDATE user_subscriptions SET plan_tier = 'premium' WHERE plan_tier = 'eco';
UPDATE user_subscriptions SET plan_tier = 'enterprise' WHERE plan_tier = 'business';

ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_tier_check 
CHECK (plan_tier IN ('free', 'premium', 'enterprise'));

ALTER TABLE user_subscriptions ALTER COLUMN plan_tier SET DEFAULT 'free';

-- Update credit limits for new tiers
-- Free: 5,000 (enough for ~1 full article with images)
-- Premium: 150,000 (roughly 30-50 articles)
-- Enterprise: 1,000,000 (unlimited for large teams)

UPDATE user_subscriptions SET credits_limit = 5000 WHERE plan_tier = 'free';
UPDATE user_subscriptions SET credits_limit = 150000 WHERE plan_tier = 'premium';
UPDATE user_subscriptions SET credits_limit = 1000000 WHERE plan_tier = 'enterprise';
