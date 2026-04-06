# Gazette - CSV to Magazine Generator

Transform your CSV data into beautiful, magazine-style PDF reports with AI-generated insights.

## Features

- **Bento Box UI**: Modern, card-based interface for intuitive data interaction
- **Multiple CSV Upload**: Process up to 10 CSV files simultaneously
- **AI-Powered Analysis**: Leverages Gemini 2.5 Pro for instant, accurate insights
- **Magazine-Quality PDFs**: Professional layouts with editorial-style narrative
- **Production-Grade**: Optimized for speed, accuracy, and enterprise use

## Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **PDF Generation**: Puppeteer (server-side rendering)
- **AI**: OpenRouter API with Gemini 2.5 Pro
- **CSV Parsing**: PapaParse

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your OpenRouter API key

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Usage

1. **Upload CSV Files**: Drag and drop or click to select up to 10 CSV files
2. **AI Processing**: The system automatically analyzes your data
3. **Generate PDF**: Click "Generate PDF" to create your magazine report
4. **Download**: Your professional report downloads automatically

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CSV Upload    │────▶│  Data Analysis  │────▶│   AI (Gemini)   │
│  (Client Side)  │     │ (PapaParse)     │     │ (OpenRouter)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Magazine Gen   │
                                               │  (Narrative)    │
                                               └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PDF Download   │◀────│  PDF Generation │◀────│  HTML Template  │
│   (Browser)     │     │  (Puppeteer)    │     │  (Styled)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## API Routes

- `POST /api/generate-pdf`: Accepts CSV datasets, returns generated PDF

## License

MIT
