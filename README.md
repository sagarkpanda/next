# Sagar Panda — Next.js site

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
