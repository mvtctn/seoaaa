# HỆ THỐNG SEO CONTENT ENGINE (Groq AI Powered)

## 📌 TỔNG QUAN DỰ ÁN
Xây dựng hệ thống tự động hóa quy trình viết bài SEO chất lượng cao, từ nghiên cứu từ khóa, phân tích đối thủ đến tạo nội dung và hình ảnh, sử dụng sức mạnh của **Groq AI (Llama 3.3)** và **Pollinations AI**.

---

## 🚀 TRẠNG THÁI HIỆN TẠI (Đã hoàn thành - Cập nhật 07/02/2026)

### 🎨 Giao diện & Trải nghiệm (UI/UX)
- [x] **Modern Landing Page**: Thiết kế theo phong cách Together.ai với Dark Theme, hiệu ứng Glassmorphism và Gradient.
- [x] **Auth Modal (Premium)**: Thay thế các trang đăng nhập/đăng ký bằng **Sidepanel Modal lướt từ bên phải**, tối ưu UX.
- [x] **Reusable Components**: Tách biệt LandingNavbar và LandingFooter để quản lý tập trung và nhất quán.

### 🤖 Trí tuệ nhân tạo (AI Engine)
- [x] **Tích hợp Groq AI (Llama 3.3)**: Tốc độ tạo nội dung siêu nhanh, thay thế hoàn toàn Gemini/DeepSeek.
- [x] **Dynamic Brand Selection**: AI tự động nhận diện **Default Brand** (dấu sao vàng) để viết bài theo đúng tone of voice, giá trị cốt lõi và chèn link nội bộ chính xác.
- [x] **Nghiên cứu từ khóa & Đối thủ**: Phân tích Top 5 đối thủ trên Google, tìm content gap để tối ưu bài viết.
- [x] **Hệ thống Schema Markup**: Tự động sinh mã SEO JSON-LD (Article, FAQ, Breadcrumb).

### ✍️ Quản lý Nội dung (CMS)
- [x] **Thư viện Bài viết (Article Library)**: Giao diện quản lý chuyên nghiệp, hỗ trợ tìm kiếm và lọc.
- [x] **Trình Soạn thảo Markdown**: Tích hợp MdEditor với tính năng Preview trực quan.
- [x] **Full CRUD Operations**: Hoàn thiện các tính năng Xem, Tạo, Chỉnh sửa và **Xóa bài viết**.
- [x] **Multi-Tenancy & Subscriptions**: Hệ thống phân quyền người dùng, gói đăng ký (Trial, Eco, Business) và giới hạn tín dụng.
- [x] **Data Isolation**: Bảo mật dữ liệu người dùng tuyệt đối thông qua **Supabase Row Level Security (RLS)**.

### 🛠️ Quản trị & Hạ tầng (Backend)
- [x] **Supabase Integration**: Chuyển đổi từ JSON DB sang **Supabase (PostgreSQL)** giúp xử lý dữ liệu lớn và ổn định.
- [x] **System Settings**: Trang quản lý cấu hình hệ thống (SMTP Server, Admin Notification Email).
- [x] **Email Test Connection**: Tính năng kiểm tra kết nối SMTP trực tiếp để đảm bảo thông báo email hoạt động.

### 🎨 Hệ thống Hình ảnh AI (Cải tiến)
- [x] **AI Image Generator Tool**: Công cụ tạo ảnh tích hợp ngay trong trang chi tiết bài viết.
- [x] **One-click Image Actions**: Chèn ảnh vào bài (Markdown) hoặc đặt làm Thumbnail chỉ với 1 click.

---

## � ĐỀ XUẤT CÁC TÍNH NĂNG CAO CẤP (PREMIUM SOLUTIONS)

### 1. 🌐 Topic Cluster Architect (Kiến trúc sư cụm chủ đề)
*   **Giải pháp**: Tự động nghiên cứu keyword hạt giống và vẽ ra bản đồ "Trình tự nội dung" (Content Silo).
*   **Giá trị**: Tạo ra bộ 20-30 bài viết liên quan chặt chẽ để chiếm lĩnh toàn bộ một ngách (niche authority) thay vì chỉ viết bài lẻ tẻ.

### 2. 🧠 Semantic SEO & Entity Analysis
*   **Giải pháp**: Phân tích các thực thể (Entities) và từ khóa ngữ nghĩa (LSI) mà Google đánh giá cao.
*   **Giá trị**: Đảm bảo bài viết có độ sâu kiến thức vượt qua đối thủ (Knowledge Depth), tăng khả năng lọt vào Featured Snippets.

### 3. 🎙️ Brand Voice Cloner (Sao chép giọng điệu thương hiệu)
*   **Giải pháp**: Cho phép người dùng tải lên 5-10 bài viết mẫu. AI sẽ học cách dùng từ, cấu trúc câu và phong cách riêng của Brand đó.
*   **Giá trị**: Bài viết AI tạo ra sẽ mang bản sắc riêng, không còn cảm giác "vô hồn" của máy móc.

### 4. ⚡ Auto-Posting & Indexing Engine
*   **Giải pháp**: 
    *   Tự động đăng bài lên WordPress/Shopify với 1 nút bấm.
    *   Tích hợp **Google Search Console API** để yêu cầu index bài viết ngay lập tức sau khi xuất bản.
*   **Giá trị**: Tiết kiệm tối đa thời gian vận hành thu công.

### 5. 📊 Real-time SEO Auditor (Chấm điểm SEO thời gian thực)
*   **Giải pháp**: Một thang điểm từ 0-100 (Power Score) cập nhật liên tục khi người dùng viết bài, so sánh trực tiếp với độ dài và mật độ từ khóa của đối thủ đang đứng Top 1.

---

## 🛠 CÔNG NGHỆ SỬ DỤNG
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS.
- **AI Core**: Groq Cloud (Model: llama-3.3-70b-versatile).
- **Database**: **Supabase (Main)** / JSON File System (Fallback).
- **Email**: Nodemailer + SMTP Config.
- **Image Gen**: Pollinations.ai (Turbo AI-Optimized).

---
*Cập nhật lần cuối: 2026-02-08 09:15:00*

## ⚠️ LƯU Ý QUAN TRỌNG
Nếu gặp lỗi `Could not find the 'user_id' column...` hoặc bài viết mới tạo không hiển thị, vui lòng chạy script migration SQL trong file `MIGRATION_GUIDE.md` để cập nhật cấu trúc Database.

## ⚠️ ACTION REQUIRED: RESTART SERVER
Please restart the development server (`npm run dev`) to apply changes to `next.config.js` for fixing image loading issues.
