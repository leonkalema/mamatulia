# Mama Tulia Ministries Website

Next.js 15 + Tailwind CSS + shadcn/ui + Contentful CMS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **CMS**: Contentful (headless)
- **Fonts**: Inter (body) + Playfair Display (headings)
- **Deployment**: Vercel (recommended)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp env.template .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Dynamic XML sitemap
│   └── robots.ts           # Robots.txt config
├── components/
│   ├── layout/             # Header, Footer
│   └── ui/                 # shadcn/ui components
├── config/
│   └── navigation.ts       # Nav items, social links
├── lib/
│   ├── contentful/         # CMS client
│   ├── seo/                # Metadata utilities
│   ├── fonts.ts            # Google Fonts config
│   └── utils.ts            # cn() helper
└── types/                  # TypeScript types
```

## Environment Variables

See `env.template` for required variables:
- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## SEO Features

- Dynamic metadata generation
- XML sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- OpenGraph + Twitter cards
- Semantic HTML structure

## Performance

- Static generation (SSG) by default
- Image optimization (AVIF/WebP)
- Font optimization with `next/font`
- CSS optimization enabled
- Security headers configured
