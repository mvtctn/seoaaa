# SEO Content Engine

Complete automated SEO solution - from keyword research to published articles with AI-generated images.

## 🚀 Features

- **Automated Research**: SERP API + Firecrawl analyze top 10 competitors
- **AI Content Generation**: Gemini for strategy, Claude for writing
- **Auto Image Generation**: Thumbnails and in-article images
- **SEO Optimization**: Meta tags, URL slugs, internal links
- **Batch Processing**: Generate multiple articles simultaneously
- **Content Rewriting**: Improve underperforming content
- **Social Repurposing**: Convert articles to LinkedIn/Twitter posts
- **Brand Management**: Save tone, values, and templates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Modern CSS with dark theme
- **Database**: SQLite (Better-SQLite3)
- **AI Models**: 
  - Google Gemini API (research & planning)
  - Anthropic Claude API (content writing)
  - Image generation API
- **Data Collection**: SERP API + Firecrawl

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env

# Run development server
npm run dev
```

## 🔑 Required API Keys

- `GEMINI_API_KEY` - Google Gemini API
- `ANTHROPIC_API_KEY` - Anthropic Claude API
- `SERP_API_KEY` - SerpAPI or similar
- `FIRECRAWL_API_KEY` - Firecrawl API

## 📖 Usage

1. **Brand Setup**: Configure your brand voice, values, and article template
2. **Enter Keyword**: Input your target keyword
3. **AI Research**: System analyzes competitors automatically
4. **Generate Content**: Receive complete article with images and metadata
5. **Publish**: Export or integrate with your CMS

## 🎯 Workflow

```
Keyword Input
    ↓
SERP Analysis (Top 10 Results)
    ↓
Content Scraping (Firecrawl)
    ↓
AI Research (Gemini) → Strategic Brief
    ↓
AI Writing (Claude) → Full Article
    ↓
Image Generation → Thumbnails & Graphics
    ↓
SEO Metadata → Title, Description, Slug
    ↓
Complete Article Package
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
