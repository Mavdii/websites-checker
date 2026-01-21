# 🔍 Cruel Stack - Website Analysis Platform

> Professional website analysis and technical forensics platform built with Next.js 16, TypeScript, and modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## ✨ Features

### 🎯 Core Analysis Capabilities

- **🌐 Website Crawling** - Intelligent web crawler with link extraction and categorization
- **🔍 URL Validation** - Comprehensive URL validation with security checks
- **🏗️ Architecture Detection** - Identifies routing strategies (SPA, MPA, SSR, CSR)
- **⚡ Technology Stack Detection** - Discovers frameworks, libraries, and tools used
- **📊 Performance Metrics** - Response time, resource analysis, and optimization insights
- **🔐 Security Analysis** - Basic security checks and vulnerability detection
- **📈 Comprehensive Reports** - Detailed analysis reports with actionable insights

### 🎨 User Experience

- **🌙 Dark Theme** - Professional cybersecurity-inspired design
- **⚡ Real-time Analysis** - Live progress updates during analysis
- **📱 Responsive Design** - Works seamlessly on all devices
- **🎭 Smooth Animations** - Polished UI with Framer Motion
- **🚀 Fast Performance** - Built with Next.js 16 and Turbopack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Redis (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mavdii/websites-checker.git
cd websites-checker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Web Interface

1. Navigate to `http://localhost:3000`
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Analyze Website"
4. View comprehensive analysis report

### API Endpoint

```bash
# Start analysis
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16.1.4, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Analysis**: Cheerio, Playwright (planned)
- **Caching**: Redis (optional)
- **Database**: Prisma + PostgreSQL (optional)
- **Testing**: Jest, Playwright, fast-check

### Project Structure

```
cruel-stack/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── analysis/         # Analysis endpoint
│   ├── components/           # React components
│   ├── page.tsx              # Home page
│   └── layout.tsx            # Root layout
├── lib/                      # Core libraries
│   ├── analysis/             # Analysis engine
│   │   ├── orchestrator.ts   # Module orchestration
│   │   ├── context.ts        # Analysis context
│   │   ├── cache.ts          # Cache manager
│   │   └── modules/          # Analysis modules
│   │       └── crawler/      # Web crawler
│   ├── validation/           # URL validation
│   └── report/               # Report generation
├── __tests__/                # Test suites
└── public/                   # Static assets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database (optional)
DATABASE_URL="postgresql://user:password@localhost:5432/cruelstack"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
```

## 📊 Analysis Modules

### Current Modules

- ✅ **Crawler Module** - Web page fetching and link extraction
- ✅ **URL Validator** - Comprehensive URL validation
- ✅ **Report Generator** - Analysis report generation

### Planned Modules

- ⏳ **Performance Module** - Lighthouse integration, Core Web Vitals
- ⏳ **Security Module** - Security headers, vulnerability scanning
- ⏳ **SEO Module** - Meta tags, structured data, sitemap analysis
- ⏳ **Accessibility Module** - WCAG compliance, axe-core integration
- ⏳ **Technology Detection** - Advanced framework and library detection

## 🎨 Design System

### Color Palette

- **Primary**: Electric Cyan (#22d3ee)
- **Secondary**: Terminal Green (#10b981)
- **Accent**: Amber (#f59e0b)
- **Background**: Dark (#0a0a0f)
- **Foreground**: Light Gray (#e4e4e7)

### Typography

- **Sans**: System UI fonts
- **Mono**: JetBrains Mono, Fira Code, Cascadia Code

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:e2e         # E2E tests

# Database (optional)
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Umar** - [GitHub](https://github.com/Mavdii)



For support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies by Umar**

⭐ Star this repo if you find it useful!
