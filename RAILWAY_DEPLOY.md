# Hướng dẫn Deploy SEO Content Engine lên Railway.app

Để ứng dụng hoạt động ổn định và **không bị mất dữ liệu bài viết** khi deploy mới hoặc khởi động lại, bạn cần thực hiện theo các bước sau:

## Bước 1: Chuẩn bị trên GitHub
1. Đảm bảo bạn đã push code mới nhất lên GitHub (Bao gồm cả folder `data/database.json` nếu bạn muốn giữ dữ liệu hiện tại).

## Bước 2: Tạo Project trên Railway
1. Truy cập [Railway.app](https://railway.app/) và đăng nhập bằng GitHub.
2. Nhấn **"New Project"** -> **"Deploy from GitHub repo"**.
3. Chọn project `seoaaa`.

## Bước 3: Cấu hình Lưu trữ Vĩnh viễn (Persistent Storage)
*Mặc định Railway sẽ reset file mỗi khi deploy. Ta cần tạo một "Volume" để lưu file JSON.*

1. Trong giao diện project trên Railway, nhấn **"New"** -> **"Volume"**.
2. Đặt tên Volume là `data` (hoặc tùy ý).
3. Mount Volume này vào đường dẫn: `/app/data`

## Bước 4: Cấu hình Biến Môi trường (Environment Variables)
Vào tab **"Variables"** của dịch vụ và thêm các biến sau:

| Biến | Giá trị |
| --- | --- |
| `DATABASE_PATH` | `/app/data/database.json` |
| `GROQ_API_KEY` | *(Khóa của bạn)* |
| `SERP_API_KEY` | *(Khóa của bạn)* |
| `FIRECRAWL_API_KEY` | *(Khóa của bạn)* |
| `NEXT_PUBLIC_APP_URL` | *(Link web sau khi Railway cấp, vd: `https://xxx.up.railway.app`)* |

## Bước 5: Cấu hình tự động "Seed" dữ liệu
Hệ thống đã được cập nhật code để tự động kiểm tra:
- Nếu file `/app/data/database.json` chưa tồn tại trong Volume, nó sẽ tự động copy file từ repo GitHub vào Volume để bạn không bị mất dữ liệu cũ.

## Bước 6: Deploy & Enjoy
Railway sẽ tự động build và chạy ứng dụng. Bạn có thể vào tab **"Settings"** -> **"Public Networking"** -> **"Generate Domain"** để lấy link truy cập web.

---
**Lưu ý:** Railway có gói dùng thử (Trial credits). Sau khi hết trial, bạn có thể cần nâng cấp lên gói Hobby ($5/tháng) để duy trì Volume vĩnh viễn.
