-- Run this in Supabase SQL Editor to fix ID sequences
-- This ensures that new inserts will generating IDs higher than the migrated data

-- 1. Keywords
SELECT setval('keywords_id_seq', (SELECT MAX(id) FROM keywords));

-- 2. Research
SELECT setval('research_id_seq', (SELECT MAX(id) FROM research));

-- 3. Articles
SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles));

-- 4. Brands
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));

-- 5. Batch Jobs
SELECT setval('batch_jobs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM batch_jobs));
