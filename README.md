# Sagar Panda — Next.js site (Portfolio Revision 4)

Next.js App Router + TypeScript + Tailwind CSS personal site migrated from the Hugo source.

## Content

Blog and project content is Markdown (`.md`). MDX is intentionally not used.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production/static build

```bash
npm run build
```

The project uses Next.js static export for GitHub Pages.

## Blog

- 6 posts per page
- `/blogs/` is page 1
- `/blogs/page/2/`, etc. for later pages
- Clickable tags at `/tags/<tag>/`
- Previous/next navigation
- Related posts
- Table of contents
- Author byline

## Portfolio revision

This is the fourth revision of the Sagar Panda portfolio, migrated to Next.js with Markdown-based blog content and static export for GitHub Pages.

## Search

The site search index is generated automatically before each production build. It searches blog posts only, including titles, descriptions, content, tags, and categories. Homepage section shortcuts remain available in the search modal.
