# Hướng dẫn Deploy SEO Content Engine lên Vercel + Supabase

Để ứng dụng hoạt động ổn định và **không bị mất dữ liệu bài viết** khi deploy mới hoặc khởi động lại, bạn cần thực hiện theo các bước sau:

---

## Phần 1: Chuẩn bị Supabase (Database)

### Bước 1: Tạo Project trên Supabase
1. Truy cập [supabase.com](https://supabase.com/) và đăng nhập bằng GitHub.
2. Nhấn **"New Project"**.
3. Đặt tên project (ví dụ: `seo-content-engine`).
4. Chọn **Region** gần bạn nhất (ví dụ: Singapore).
5. Đặt **Database Password** (lưu lại để sau này dùng).
6. Nhấn **"Create new project"** và đợi khoảng 2 phút.

### Bước 2: Tạo Database Schema
1. Trong project Supabase, vào tab **"SQL Editor"**.
2. Nhấn **"New query"**.
3. Copy toàn bộ nội dung file `scripts/setup-supabase.sql` trong project của bạn.
4. Paste vào SQL Editor và nhấn **"Run"**.
5. Kiểm tra tab **"Table Editor"** để xác nhận các bảng đã được tạo: `brands`, `keywords`, `research`, `articles`, `batch_jobs`.

### Bước 3: Lấy API Keys
1. Vào tab **"Settings"** -> **"API"**.
2. Copy 2 giá trị sau:
   - `Project URL` (ví dụ: `https://xxx.supabase.co`)
   - `anon public` key (key dài, bắt đầu bằng `eyJ...`)
   - `service_role` key (key bí mật, chỉ dùng cho migration)

---

## Phần 2: Migration Dữ liệu (Nếu bạn đã có dữ liệu cũ)

### Bước 4: Cấu hình Environment Variables cho Migration
1. Mở file `.env` trong project.
2. Thêm các dòng sau:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Bước 5: Chạy Migration Script
```bash
npx tsx scripts/migrate-to-supabase.ts
```

Script này sẽ tự động đọc file `data/database.json` và đưa toàn bộ dữ liệu lên Supabase.

---

## Phần 3: Deploy lên Vercel

### Bước 6: Tạo Project trên Vercel
1. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng GitHub.
2. Nhấn **"Add New..."** -> **"Project"**.
3. Chọn repository `seoaaa` từ danh sách GitHub.
4. Nhấn **"Import"**.

### Bước 7: Cấu hình Environment Variables
Trong phần **"Environment Variables"**, thêm các biến sau:

| Biến | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *(URL từ Supabase)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Anon key từ Supabase)* |
| `GROQ_API_KEY` | *(Khóa của bạn)* |
| `SERP_API_KEY` | *(Khóa của bạn)* |
| `FIRECRAWL_API_KEY` | *(Khóa của bạn)* |
| `NEXT_PUBLIC_APP_URL` | *(Sẽ có sau khi deploy, vd: `https://seoaaa.vercel.app`)* |

### Bước 8: Deploy
1. Nhấn **"Deploy"**.
2. Vercel sẽ tự động build và deploy ứng dụng.
3. Sau khi hoàn tất, bạn sẽ nhận được link truy cập (ví dụ: `https://seoaaa.vercel.app`).

---

## Phần 4: Tự động Deploy khi Git Push

Mỗi lần bạn `git push` code mới lên GitHub, Vercel sẽ tự động:
1. Phát hiện thay đổi.
2. Build lại ứng dụng.
3. Deploy phiên bản mới.

**Dữ liệu của bạn được lưu trên Supabase, hoàn toàn độc lập với code**, nên sẽ không bị mất khi deploy.

---

## Lưu ý quan trọng

### Chi phí
- **Supabase**: Gói Free cho phép:
  - 500MB database storage
  - 50,000 monthly active users
  - 2GB bandwidth
  
- **Vercel**: Gói Free cho phép:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless function execution

### Bảo mật
- **KHÔNG** commit file `.env` lên GitHub.
- Đảm bảo file `.env` đã có trong `.gitignore`.
- Chỉ sử dụng `service_role` key cho migration script, không dùng trong production code.

---

## Troubleshooting

### Lỗi "Cannot find module '@/lib/supabase'"
- Đảm bảo bạn đã cài đặt: `npm install @supabase/supabase-js`

### Lỗi khi migration
- Kiểm tra lại Database Password và API keys.
- Đảm bảo file `data/database.json` tồn tại và có định dạng JSON hợp lệ.

### Lỗi khi deploy trên Vercel
- Kiểm tra lại Environment Variables đã được cấu hình đúng chưa.
- Xem logs trong tab **"Deployments"** -> Click vào deployment -> **"View Function Logs"**.

---

**Chúc bạn deploy thành công! 🚀**
