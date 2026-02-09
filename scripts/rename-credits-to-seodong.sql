-- 1. Rename columns in subscription_plans
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='credits') THEN
        ALTER TABLE subscription_plans RENAME COLUMN credits TO seodong;
    END IF;
END $$;

-- 2. Rename columns in user_subscriptions
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_subscriptions' AND column_name='credits_used') THEN
        ALTER TABLE user_subscriptions RENAME COLUMN credits_used TO seodong_used;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_subscriptions' AND column_name='credits_limit') THEN
        ALTER TABLE user_subscriptions RENAME COLUMN credits_limit TO seodong_limit;
    END IF;
END $$;

-- 3. Update features and description in subscription_plans (Safe version)
UPDATE subscription_plans 
SET features = REPLACE(features::text, 'Credits', 'Seodong')::jsonb
WHERE features::text LIKE '%Credits%';

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='description') THEN
        UPDATE subscription_plans 
        SET description = REPLACE(description, 'Credits', 'Seodong')
        WHERE description LIKE '%Credits%';
    END IF;
END $$;

-- 4. Sync Seodong with Price (1 Seodong = 1 VND)
UPDATE subscription_plans 
SET seodong = price
WHERE tier_key IN ('premium', 'enterprise');
