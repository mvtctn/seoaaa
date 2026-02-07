# SEO Content Engine - Implementation Plan

## 🎯 Project Overview
A comprehensive, automated SEO solution that transforms a single keyword into:
- Complete competitive research
- SEO-optimized article with proper formatting
- AI-generated images and thumbnails
- Meta tags and URL slugs
- Batch processing capabilities
- Content rewriting for underperforming URLs

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: CSS with modern design (dark mode, glassmorphism, animations)
- **UI Components**: Custom components with premium aesthetics
- **State Management**: React Context + Zustand for complex state

### Backend
- **API Routes**: Next.js API routes
- **Database**: Better-SQLite3 (serverless-friendly)
- **File Storage**: Local filesystem for generated content

### AI & APIs
- **Research & Planning**: Google Gemini API
- **Content Writing**: Anthropic Claude API
- **Image Generation**: Multiple options (DALL-E, Stable Diffusion, or built-in AI)
- **SERP Data**: SerpAPI or similar
- **Web Scraping**: Firecrawl API or Cheerio

## 📋 Phase 1: Project Setup & Foundation

### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest ./ --typescript --tailwind --app --no-src-dir
```

### 1.2 Install Core Dependencies
```bash
npm install better-sqlite3 @types/better-sqlite3
npm install @anthropic-ai/sdk @google/generative-ai
npm install axios cheerio
npm install zustand
npm install react-markdown react-syntax-highlighter
npm install slugify
```

### 1.3 Project Structure
```
/app
  /api
    /brand         # Brand settings CRUD
    /research      # Competitor research
    /generate      # Content generation
    /images        # Image generation
    /batch         # Batch processing
  /dashboard       # Main dashboard
  /brand-setup     # Brand configuration
  /content         # Content management
  /research        # Research viewer
/lib
  /db              # Database utilities
  /ai              # AI service integrations
  /scraper         # Web scraping utilities
  /seo             # SEO utilities
/components
  /ui              # Reusable UI components
  /dashboard       # Dashboard-specific components
  /forms           # Form components
/public
  /generated       # Generated images
/data
  database.db      # SQLite database
```

## 📋 Phase 2: Database Schema

### Tables

#### brands
- id (PRIMARY KEY)
- name (TEXT)
- core_values (JSON)
- tone_of_voice (JSON)
- article_template (TEXT)
- internal_links (JSON)
- created_at (DATETIME)
- updated_at (DATETIME)

#### keywords
- id (PRIMARY KEY)
- keyword (TEXT)
- brand_id (INTEGER FK)
- status (TEXT: pending, researching, writing, completed, failed)
- created_at (DATETIME)

#### research
- id (PRIMARY KEY)
- keyword_id (INTEGER FK)
- serp_data (JSON)
- competitor_analysis (JSON)
- content_gaps (JSON)
- strategic_positioning (TEXT)
- gemini_brief (TEXT)
- created_at (DATETIME)

#### articles
- id (PRIMARY KEY)
- keyword_id (INTEGER FK)
- research_id (INTEGER FK)
- title (TEXT)
- slug (TEXT UNIQUE)
- meta_title (TEXT)
- meta_description (TEXT)
- content (TEXT - Markdown)
- thumbnail_url (TEXT)
- images (JSON)
- status (TEXT: draft, published)
- created_at (DATETIME)
- updated_at (DATETIME)

#### batch_jobs
- id (PRIMARY KEY)
- brand_id (INTEGER FK)
- keywords (JSON)
- status (TEXT)
- progress (JSON)
- created_at (DATETIME)
- completed_at (DATETIME)

## 📋 Phase 3: Core Features

### 3.1 Brand Setup Module
**Components:**
- BrandSetupForm
  - Core values input
  - Tone of voice selector (professional, casual, technical, friendly, etc.)
  - Article template editor (with variables)
  - Internal linking strategy
  - Sample content for AI training

**API Endpoints:**
- POST /api/brand - Create/Update brand
- GET /api/brand/:id - Get brand details

### 3.2 Research Module
**Workflow:**
1. Input keyword
2. Fetch SERP results (top 10)
3. Scrape competitor content with Firecrawl
4. Send to Gemini for analysis:
   - Content gaps
   - Common themes
   - Missing topics
   - Strategic positioning
   - Recommended outline

**Components:**
- KeywordInput
- CompetitorAnalysisViewer
- ContentGapVisualizer
- ResearchBrief

**API Endpoints:**
- POST /api/research/serp - Fetch SERP data
- POST /api/research/analyze - Analyze competitors with Gemini
- GET /api/research/:id - Get research results

### 3.3 Content Generation Module
**Workflow:**
1. Take research brief from Gemini
2. Combine with brand guidelines
3. Send to Claude for article writing
4. Generate images based on headings/sections
5. Generate SEO metadata
6. Format with internal links

**Components:**
- ContentGenerator
- ArticlePreview (live markdown preview)
- SEOMetadataEditor
- ImageGallery

**API Endpoints:**
- POST /api/generate/article - Generate article with Claude
- POST /api/generate/images - Generate images
- POST /api/generate/metadata - Generate SEO metadata
- PUT /api/articles/:id - Update article

### 3.4 Image Generation Module
**Features:**
- Generate featured image/thumbnail
- Generate in-article images based on sections
- Multiple styles (photorealistic, illustration, diagram)

**API Endpoints:**
- POST /api/images/generate - Generate images
- GET /api/images/:id - Get image

### 3.5 Batch Processing Module
**Features:**
- Upload CSV with multiple keywords
- Queue-based processing
- Progress tracking
- Error handling & retry logic
- Email notifications (optional)

**Components:**
- BatchUploader
- BatchQueueViewer
- ProgressTracker

**API Endpoints:**
- POST /api/batch/create - Create batch job
- GET /api/batch/:id/status - Get batch status
- POST /api/batch/:id/cancel - Cancel batch job

### 3.6 Content Rewrite Module
**Features:**
- Input existing URL
- Scrape current content
- Analyze current rankings
- Generate improved version
- Compare old vs new

**Components:**
- URLInput
- ContentComparator
- RewriteSuggestions

**API Endpoints:**
- POST /api/rewrite/analyze - Analyze existing content
- POST /api/rewrite/generate - Generate improved version

### 3.7 Social Repurposing Module
**Features:**
- Extract key points from article
- Generate LinkedIn post
- Generate Twitter/X thread
- Copy-to-clipboard functionality

**Components:**
- SocialRepurposer
- PlatformSelector
- PostPreview

**API Endpoints:**
- POST /api/repurpose/linkedin - Generate LinkedIn post
- POST /api/repurpose/twitter - Generate Twitter thread

## 📋 Phase 4: UI/UX Design

### Design System
- **Colors**: 
  - Primary: Deep purple (#6366f1)
  - Secondary: Cyan (#06b6d4)
  - Success: Green (#10b981)
  - Danger: Red (#ef4444)
  - Dark theme with glassmorphism effects
  
- **Typography**:
  - Headers: Inter or Outfit
  - Body: System fonts for performance
  
- **Animations**:
  - Smooth transitions (200-300ms)
  - Micro-interactions on buttons
  - Progress indicators
  - Loading skeletons

### Key Pages

#### 1. Dashboard (`/dashboard`)
- Quick stats (articles generated, keywords tracked, etc.)
- Recent articles
- Active batch jobs
- Quick actions (New Article, New Batch, etc.)

#### 2. Brand Setup (`/brand-setup`)
- Step-by-step wizard
- Preview of brand voice
- Sample output based on settings

#### 3. Single Article Generator (`/generate`)
- Keyword input
- Live research progress
- Live content generation
- Preview & edit
- Publish

#### 4. Batch Generator (`/batch`)
- CSV upload
- Keyword list
- Progress dashboard
- Download results

#### 5. Content Library (`/content`)
- All generated articles
- Search & filter
- Bulk actions
- Export capabilities

#### 6. Rewrite Tool (`/rewrite`)
- URL input
- Current content analysis
- Suggested improvements
- Side-by-side comparison

## 📋 Phase 5: AI Integration Details

### Gemini Integration (Research & Planning)
**Prompt Structure:**
```
You are an SEO research analyst. Analyze the following competitor content and provide:
1. Common themes and topics covered
2. Content gaps and missing information
3. Strategic positioning opportunities
4. Recommended article outline with H2/H3 headings
5. Target word count and key sections

Brand Context: {brand_values}
Target Keyword: {keyword}
Competitor Content: {scraped_content}
```

### Claude Integration (Content Writing)
**Prompt Structure:**
```
You are a professional SEO content writer. Write a comprehensive article following these guidelines:

Brand Voice: {tone_of_voice}
Core Values: {core_values}
Research Brief: {gemini_brief}
Article Template: {template}
Internal Links: {links_to_include}

Write in {language}, maintain {tone}, and ensure the content is:
- SEO-optimized with natural keyword usage
- Well-structured with clear headings
- Engaging and valuable for readers
- Includes relevant internal links
- Formatted in Markdown
```

### Image Generation
**Prompts for different image types:**
- Featured Image: "Professional blog header for article about {topic}, modern and engaging"
- Section Images: "Illustration showing {section_topic}, clean and informative"
- Infographics: "Simple infographic explaining {concept}"

## 📋 Phase 6: Testing & Optimization

### Testing Checklist
- [ ] Brand setup saves correctly
- [ ] SERP API returns results
- [ ] Firecrawl scrapes content
- [ ] Gemini generates research brief
- [ ] Claude generates article
- [ ] Images generate successfully
- [ ] SEO metadata is accurate
- [ ] Batch processing works
- [ ] Error handling is robust
- [ ] UI is responsive
- [ ] Dark mode works correctly

### Performance Optimization
- Implement caching for SERP results
- Queue system for batch jobs
- Rate limiting for API calls
- Lazy loading for images
- Database indexing

## 📋 Phase 7: Deployment

### Environment Variables Needed
```env
# AI APIs
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
IMAGE_GENERATION_API_KEY=

# SERP & Scraping
SERP_API_KEY=
FIRECRAWL_API_KEY=

# Database
DATABASE_PATH=./data/database.db

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deployment Checklist
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] File permissions correct
- [ ] API keys valid
- [ ] Error monitoring setup

## 🎯 Success Metrics
- Time to generate single article: < 5 minutes
- Batch processing: 10+ articles per hour
- Image generation success rate: > 95%
- API uptime: > 99%
- User satisfaction: Premium UI/UX experience

## 🚀 Future Enhancements
- WordPress integration
- Webflow integration
- Automatic publishing
- Rank tracking
- A/B testing for metadata
- Multi-language support
- Team collaboration features
- API for external integrations
