-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- 'Free', 'Premium', 'Enterprise'
    tier_key TEXT NOT NULL UNIQUE, -- 'free', 'premium', 'enterprise' (used in code logic)
    price DECIMAL(15, 0) NOT NULL DEFAULT 0, -- VND usually has no decimals, but good to have safety
    currency TEXT DEFAULT 'VND',
    credits INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]', -- List of feature strings
    description TEXT, -- Description for the card
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can read active plans" ON subscription_plans;
CREATE POLICY "Public can read active plans" ON subscription_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can do everything" ON subscription_plans;
CREATE POLICY "Admins can do everything" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);

-- Seed initial data (Upsert based on tier_key)
INSERT INTO subscription_plans (name, tier_key, price, credits, features, description, is_popular)
VALUES 
(
    'Free', 
    'free', 
    0, 
    5000, 
    '["5,000 Credits", "Sáng tạo nội dung cơ bản", "Hỗ trợ cộng đồng", "1 User"]', 
    'Khởi đầu hành trình SEO của bạn',
    false
),
(
    'Premium', 
    'premium', 
    990000, 
    990000, 
    '["990,000 Seodong", "Truy cập tất cả tính năng AI", "Nghiên cứu từ khóa chuyên sâu", "Hỗ trợ ưu tiên", "Phân tích đối thủ", "3 Users"]', 
    'Professional & Freelancer',
    true
),
(
    'Enterprise', 
    'enterprise', 
    2990000, 
    2990000, 
    '["2,990,000 Seodong", "API Access", "Custom AI Models", "Account Manager riêng", "Đào tạo 1-1", "Không giới hạn Users"]', 
    'Agencies & Doanh nghiệp',
    false
)
ON CONFLICT (tier_key) DO UPDATE 
SET 
    price = EXCLUDED.price,
    credits = EXCLUDED.credits,
    features = EXCLUDED.features,
    description = EXCLUDED.description,
    is_popular = EXCLUDED.is_popular,
    updated_at = CURRENT_TIMESTAMP;
