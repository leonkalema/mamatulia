# Mama Tulia Website Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| CMS | Contentful |
| Deployment | Vercel |

## Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (header, footer, fonts)
│   ├── page.tsx              # Homepage
│   ├── sitemap.ts            # Dynamic XML sitemap
│   ├── robots.ts             # Robots.txt configuration
│   ├── globals.css           # Global styles + Tailwind
│   ├── contact/              # Contact page
│   │   └── page.tsx
│   └── news/                 # News section (migrated WP articles)
│       ├── page.tsx          # News list page
│       └── [slug]/
│           └── page.tsx      # Article detail page
│
├── components/
│   ├── layout/               # Layout components
│   │   ├── header.tsx        # Site header with navigation (fixed, adaptive)
│   │   ├── footer.tsx        # Site footer
│   │   └── index.ts          # Barrel export
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       └── index.ts
│
├── config/
│   └── navigation.ts         # Nav items, social links
│
├── constants/
│   ├── index.ts              # App-wide constants (routes, cache, content types)
│   └── links.ts              # External links (donate, social)
│
├── hooks/
│   ├── use-media-query.ts    # Responsive breakpoint hooks
│   ├── use-scroll.ts         # Scroll position/direction hooks
│   └── index.ts
│
├── lib/
│   ├── contentful/
│   │   └── client.ts         # Contentful SDK client
│   ├── security/
│   │   ├── headers.ts        # Security headers + CSP
│   │   ├── validation.ts     # Input sanitization utilities
│   │   └── index.ts
│   ├── seo/
│   │   └── metadata.ts       # SEO metadata generator
│   ├── fonts.ts              # Google Fonts configuration
│   └── utils.ts              # cn() and utility functions
│
├── services/
│   └── contentful/
│       ├── base.ts           # Generic fetch functions (fetchEntry, fetchEntries)
│       ├── pages.ts          # Page content fetching
│       ├── posts.ts          # Blog post fetching
│       ├── programs.ts       # Program/initiative fetching
│       ├── wp-articles.ts    # Migrated WordPress articles
│       ├── site-settings.ts  # Site settings (contact info, social links)
│       └── index.ts          # Barrel export
│
├── types/
│   ├── index.ts              # Re-exports all types
│   ├── contentful.ts         # CMS content model types
│   └── api.ts                # API response types
│
scripts/
└── wp-to-contentful/         # WordPress migration CLI
    ├── src/
    │   ├── index.ts          # Main migration entry
    │   ├── importer.ts       # Content import logic
    │   ├── upload-images.ts  # Media upload to Contentful
    │   ├── cleanup-duplicates.ts
    │   ├── contentful/       # Contentful management client
    │   └── wp/               # WordPress REST API client
    └── tsconfig.json
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `use-media-query.ts` |
| Components | PascalCase | `Header`, `FeatureCard` |
| Functions | camelCase | `getPost`, `fetchEntries` |
| Types | PascalCase | `Post`, `ApiResponse` |
| Constants | SCREAMING_SNAKE | `CACHE.REVALIDATE_SECONDS` |

## Data Flow

```
Contentful CMS
     ↓
services/contentful/*.ts (fetch + transform)
     ↓
app/[route]/page.tsx (server component)
     ↓
components/*.tsx (render)
```

## Performance Optimizations

1. **Static Generation** - Pages are statically generated at build time
2. **ISR** - `revalidate` set to 60s for content updates
3. **Image Optimization** - AVIF/WebP via `next/image`
4. **Font Optimization** - `next/font` with `display: swap`
5. **CSS Optimization** - `experimental.optimizeCss: true`

## Security

1. **Headers** - X-Frame-Options, X-Content-Type-Options, XSS-Protection
2. **CSP** - Content Security Policy in `lib/security/headers.ts`
3. **Input Validation** - Sanitization utilities in `lib/security/validation.ts`
4. **Environment Variables** - All secrets in `.env.local` (gitignored)

## SEO

1. **Metadata API** - `generateMetadata()` in `lib/seo/metadata.ts`
2. **Sitemap** - Dynamic XML at `/sitemap.xml`
3. **Robots** - Configuration at `/robots.txt`
4. **OpenGraph** - Auto-generated OG images and meta tags
5. **Semantic HTML** - Proper heading hierarchy, landmarks

## Adding New Features

### New Page Route
1. Create `src/app/[route]/page.tsx`
2. Add to `src/config/navigation.ts`
3. Add to `src/app/sitemap.ts`

### New Component
1. Create in `src/components/[category]/[name].tsx`
2. Export from `src/components/[category]/index.ts`

### New Content Type
1. Add type to `src/types/contentful.ts`
2. Add content type ID to `src/constants/index.ts`
3. Create service in `src/services/contentful/[name].ts`
4. Export from `src/services/contentful/index.ts`

## Content Types (Contentful)

| Content Type | Service | Description |
|--------------|---------|-------------|
| `page` | `pages.ts` | Static pages |
| `post` | `posts.ts` | Blog posts |
| `program` | `programs.ts` | Programs/initiatives |
| `wpArticle` | `wp-articles.ts` | Migrated WordPress articles |
| `siteSettings` | `site-settings.ts` | Global site config (contact, social) |
| `wpAuthor` | - | Migrated WP authors |
| `wpCategory` | - | Migrated WP categories |
| `wpTag` | - | Migrated WP tags |

## Migration Scripts

WordPress content migration tools in `scripts/wp-to-contentful/`:

```bash
npm run migrate:wp              # Run full migration
npm run migrate:wp:images        # Upload media to Contentful
npm run migrate:wp:cleanup       # Preview duplicate cleanup
npm run migrate:wp:cleanup:execute  # Execute cleanup
```
