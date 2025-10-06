# Health In Cloud

Orthophonic and neuropsychological rehabilitation platform for the Nantes MPR department.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Auth**: Better Auth
- **Database**: Prisma + Neon PostgreSQL
- **i18n**: next-intl (FR/EN)
- **Testing**: Vitest + Playwright

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # Locale-specific routes
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components
├── lib/                   # Shared utilities
├── locales/               # Translation files
├── prisma/                # Database schema
├── e2e/                   # Playwright tests
└── __tests__/             # Vitest unit tests
```

## Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm test             # Vitest watch mode
npm run test:run     # Vitest single pass
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright UI mode
```

## Documentation

See [.specs/](.specs/) for detailed specifications:
- [Product Spec](.specs/PRODUCT_SPEC.md)
- [Technical Spec](.specs/TECHNICAL_SPEC.md)
- [Testing Guide](.specs/TESTS_GUIDE.md)
- [Delivery Workflow](.specs/DELIVERY_WORKFLOW.md)

## Development

This project follows the conventions outlined in [CLAUDE.md](CLAUDE.md) for AI-assisted development.

For slash commands:
- `/specs` - Review specifications
- `/audit` - Update quality scorecard
