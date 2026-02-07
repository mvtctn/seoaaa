# 🚨 IMPORTANT: Post-Migration Sequence Fix

Sau khi chạy migration từ JSON sang Supabase (`scripts/migrate-to-supabase.ts`), bạn **BẮT BUỘC** phải chạy lệnh SQL sau trên Supabase Dashboard để reset ID sequences. Nếu không, việc tạo mới Keywords/Research/Articles sẽ bị lỗi `duplicate key value violates unique constraint`.

## SQL Sequence Fix Script

Copy và paste vào **Supabase SQL Editor** -> Run:

```sql
-- Reset sequence Keywords
SELECT setval('keywords_id_seq', (SELECT MAX(id) FROM keywords));

-- Reset sequence Research
SELECT setval('research_id_seq', (SELECT MAX(id) FROM research));

-- Reset sequence Articles
SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles));

-- Reset sequence Brands
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));

-- Reset sequence Batch Jobs
SELECT setval('batch_jobs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM batch_jobs));
```

## Giải thích
Khi `upsert` dữ liệu cũ (có ID sẵn, ví dụ ID=16), Postgres sequence `nextval` vẫn bắt đầu từ 1. Lần insert tiếp theo sẽ tạo ID=1 -> Conflict. Lệnh trên set sequence nhảy cóc lên > Max ID hiện tại.
