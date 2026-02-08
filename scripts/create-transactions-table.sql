-- Create Transactions Table for Payment History
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_code BIGINT NOT NULL UNIQUE,
    amount INT NOT NULL,
    plan_tier TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'CANCELLED'
    checkout_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
