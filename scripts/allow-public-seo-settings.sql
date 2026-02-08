-- Migration to allow public reading of SEO settings
-- This allows GA and SC tags to be fetched even for non-logged in users

-- 1. Ensure the app_settings table can be read by anyone for specific PUBLIC keys
-- or just allow all select if appropriate. 
-- Since app_settings contains SMTP, it should NOT be fully public.

DROP POLICY IF EXISTS "Allow public read for SEO config" ON app_settings;
CREATE POLICY "Allow public read for SEO config" 
ON app_settings 
FOR SELECT 
USING (key = 'seo_config');

-- 2. If you want to allow global settings (user_id IS NULL) to be read by all:
DROP POLICY IF EXISTS "Allow public read for global settings" ON app_settings;
CREATE POLICY "Allow public read for global settings" 
ON app_settings 
FOR SELECT 
USING (user_id IS NULL);
