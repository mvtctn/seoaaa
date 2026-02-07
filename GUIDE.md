# Hướng Dẫn Sử Dụng SEO Content Engine

## 🚀 Bắt Đầu

### 1. Cài Đặt Ban Đầu

Server development đã chạy tại `http://localhost:3000`

### 2. Cấu Hình API Keys

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Thêm các API keys vào file `.env`:
```env
# AI APIs
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# SERP & Web Scraping
SERP_API_KEY=your_serpapi_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### 3. Lấy API Keys

#### Google Gemini API
1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập với Google account
3. Click "Get API Key"
4. Copy API key vào `.env`

#### Anthropic Claude API
1. Truy cập [Anthropic Console](https://console.anthropic.com/)
2. Đăng ký tài khoản
3. Tạo API key trong Settings
4. Copy vào `.env`

#### SerpAPI
1. Truy cập [SerpAPI](https://serpapi.com/)
2. Đăng ký free tier (100 searches/month)
3. Copy API key từ dashboard
4. Paste vào `.env`

#### Firecrawl (Optional)
1. Truy cập [Firecrawl](https://firecrawl.dev/)
2. Đăng ký tài khoản
3. Copy API key
4. Nếu không có, hệ thống sẽ dùng Cheerio (fallback)

## 📖 Sử Dụng

### Bước 1: Thiết Lập Thương Hiệu

1. Truy cập `/dashboard/brand`
2. Điền thông tin:
   - **Tên thương hiệu**: Tên công ty/blog của bạn
   - **Giá trị cốt lõi**: Những giá trị bạn muốn truyền tải (VD: chuyên nghiệp, sáng tạo, đáng tin cậy)
   - **Giọng điệu**: Chọn tone phù hợp (VD: chuyên nghiệp, thân thiện, kỹ thuật)
   - **Mẫu bài viết**: Cấu trúc bài viết bạn muốn (optional)
   - **Internal Links**: Danh sách các link nội bộ để thêm vào bài (optional)

3. Lưu cài đặt

### Bước 2: Tạo Bài Viết Đơn

1. Truy cập `/dashboard/generate`
2. Nhập từ khóa mục tiêu (VD: "cách làm SEO hiệu quả")
3. Click "Bắt Đầu Nghiên Cứu"

**Quy trình tự động:**
- 🔍 Tìm kiếm top 10 kết quả SERP
- 📄 Thu thập nội dung từ các đối thủ
- 🧠 Gemini phân tích và tạo brief chiến lược
- ✍️ Claude viết bài theo brief và brand guidelines
- 🎨 Tạo hình ảnh thumbnail và in-article
- 📊 Tạo meta title, description, và URL slug

4. Xem preview bài viết
5. Chỉnh sửa nếu cần
6. Xuất bản hoặc download

### Bước 3: Xử Lý Hàng Loạt

1. Truy cập `/dashboard/batch`
2. Upload file CSV với danh sách keywords hoặc nhập thủ công:
```
cách làm SEO
digital marketing 2026
content marketing strategy
```
3. Chọn brand settings
4. Click "Bắt Đầu Batch"
5. Theo dõi tiến trình real-time
6. Download tất cả bài viết khi hoàn thành

### Bước 4: Viết Lại Nội Dung

1. Truy cập `/dashboard/rewrite`
2. Nhập URL bài viết hiện tại
3. Hệ thống sẽ:
   - Thu thập nội dung hiện tại
   - Phân tích điểm yếu
   - Đề xuất cải thiện
   - Viết lại nội dung tốt hơn
4. So sánh old vs new
5. Chấp nhận thay đổi

### Bước 5: Tái Sử Dụng Nội Dung

Sau khi có bài viết, bạn có thể:

#### LinkedIn Post
- Click "Tạo LinkedIn Post"
- Tự động tạo post 150-300 từ với:
  - Hook hấp dẫn
  - 3-5 điểm chính
  - Call-to-action
  - Hashtags

#### Twitter/X Thread
- Click "Tạo Twitter Thread"
- Tự động tạo 5-10 tweets:
  - Hook tweet
  - Insights tweets
  - CTA tweet
  - Mỗi tweet < 280 ký tự

## 🎨 Tùy Chỉnh

### Thay Đổi Tone of Voice

Trong Brand Settings, bạn có thể chọn:
- **Professional**: Trang trọng, chuyên nghiệp
- **Friendly**: Thân thiện, gần gũi
- **Technical**: Chuyên sâu, kỹ thuật
- **Casual**: Thoải mái, đời thường
- **Authoritative**: Quyền uy, chuyên gia

### Article Template

Tạo template với variables:
```markdown
# {{title}}

## Giới Thiệu
{{intro}}

## {{main_content}}

## Kết Luận
{{conclusion}}

---
**Về {{brand_name}}:**
{{about_us}}
```

### Internal Links

Format:
```json
[
  {
    "text": "Hướng dẫn SEO",
    "url": "/huong-dan-seo",
    "keywords": ["seo", "tối ưu hóa"]
  },
  {
    "text": "Content Marketing",
    "url": "/content-marketing",
    "keywords": ["nội dung", "marketing"]
  }
]
```

## 🔧 Troubleshooting

### Database Error
```bash
# Xóa và tạo lại database
rm -rf data/database.db
npm run dev
```

### API Rate Limits
- SerpAPI free tier: 100 searches/month
- Gemini: Có giới hạn requests/minute
- Claude: Check pricing tier của bạn

Giải pháp:
- Nâng cấp API tier
- Chạy batch nhỏ hơn
- Thêm delay giữa các requests

### Better-SQLite3 Installation Error (Windows)
Nếu gặp lỗi khi cài better-sqlite3:
```bash
npm install --global --production windows-build-tools
npm install better-sqlite3 --build-from-source
```

## 📊 Best Practices

### 1. Nghiên Cứu Từ Khóa Trước
- Tìm keywords có search volume tốt
- Kiểm tra độ cạnh tranh
- Chọn long-tail keywords cho cơ hội cao hơn

### 2. Review Trước Khi Publish
- Luôn đọc qua bài AI tạo
- Thêm góc nhìn độc đáo của bạn
- Verify facts và số liệu
- Thêm examples thực tế

### 3. Tối Ưu Hình Ảnh
- Compress images trước khi upload
- Thêm alt text
- Sử dụng descriptive filenames

### 4. Internal Linking
- Link đến 3-5 bài viết liên quan
- Sử dụng anchor text tự nhiên
- Tạo content clusters

### 5. Update Định Kỳ
- Review và update nội dung cũ
- Thêm thông tin mới
- Cập nhật statistics
- Refresh meta descriptions

## 🎯 Tips & Tricks

### Tăng Chất Lượng Content
1. **Thêm Brand Context chi tiết**: Càng nhiều thông tin về brand, AI càng viết đúng tone
2. **Sử dụng Examples**: Trong brand settings, thêm ví dụ về writing style bạn muốn
3. **Review và Edit**: AI là starting point, bạn là người hoàn thiện
4. **Add Personal Touch**: Thêm kinh nghiệm cá nhân, case studies thực tế

### Tối Ưu Workflow
1. **Setup Brand Một Lần**: Đầu tư thời gian setup brand settings kỹ càng
2. **Batch Processing**: Tạo nhiều bài cùng lúc để tiết kiệm thời gian
3. **Template System**: Tạo templates cho các loại bài khác nhau
4. **Content Calendar**: Plan trước keywords cho cả tháng

### SEO Advanced
1. **Topic Clusters**: Tạo pillar content + supporting articles
2. **Long-form Content**: Aim for 2000+ words cho competitive keywords
3. **Featured Snippets**: Optimize cho question-based keywords
4. **Schema Markup**: Thêm structured data (tự động hóa trong tương lai)

## 📈 Monitoring & Analytics

Sau khi publish:
1. Add to Google Search Console
2. Track rankings weekly
3. Monitor organic traffic
4. Update underperforming content
5. Build backlinks to top articles

## 🚀 Next Steps

1. Tạo brand settings
2. Test với 1-2 keywords
3. Review và adjust tone/template
4. Scale lên batch processing
5. Build content library
6. Monitor results
7. Optimize and iterate

## 💡 Support

Nếu gặp vấn đề:
1. Check `.env` có đầy đủ API keys
2. Verify API quotas còn
3. Check database permissions
4. Review error logs trong terminal

Happy content creating! 🎉
