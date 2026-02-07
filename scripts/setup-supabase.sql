-- Create Brands table
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    core_values JSONB, -- list of strings
    tone_of_voice JSONB, -- {description, tone, style...}
    article_template TEXT,
    internal_links JSONB, -- list of {title, url, keyword}
    is_default BOOLEAN DEFAULT false,
    wp_url TEXT,
    wp_username TEXT,
    wp_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Keywords table
CREATE TABLE keywords (
    id BIGSERIAL PRIMARY KEY,
    keyword TEXT NOT NULL,
    brand_id BIGINT REFERENCES brands(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Research table
CREATE TABLE research (
    id BIGSERIAL PRIMARY KEY,
    keyword_id BIGINT REFERENCES keywords(id) ON DELETE CASCADE,
    serp_data JSONB,
    competitor_analysis TEXT,
    content_gaps TEXT,
    strategic_positioning TEXT,
    gemini_brief JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Articles table
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    keyword_id BIGINT REFERENCES keywords(id) ON DELETE SET NULL,
    research_id BIGINT REFERENCES research(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    content TEXT,
    thumbnail_url TEXT,
    images JSONB, -- [{url, alt}] or string search keywords
    status TEXT DEFAULT 'draft',
    brand_id BIGINT REFERENCES brands(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Batch Jobs table
CREATE TABLE batch_jobs (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT REFERENCES brands(id),
    keywords JSONB, -- list of strings
    status TEXT DEFAULT 'pending',
    progress JSONB, -- {total, completed, current}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) - Basic disable for internal tool, or set public
-- For simplicity in a private/internal tool, we can just disable RLS or allow all logged in users.
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all access for now (Development/Internal use)
-- Note: In production, you'd want proper Auth policies.
CREATE POLICY "Allow All Access" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access" ON keywords FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access" ON research FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access" ON batch_jobs FOR ALL USING (true) WITH CHECK (true);

-- Settings Policy
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Access" ON app_settings FOR ALL USING (true) WITH CHECK (true);
