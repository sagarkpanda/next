import Link from "next/link";

type Heading = { depth: number; text: string; id: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export function extractHeadings(source: string): Heading[] {
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  const withoutCode = source.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "");
  for (const line of withoutCode.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "").trim();
    let id = slugify(text);
    const count = used.get(id) ?? 0;
    used.set(id, count + 1);
    if (count) id = `${id}-${count}`;
    headings.push({ depth: match[1].length, text, id });
  }
  return headings;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  if (!headings.length) return null;
  return (
    <aside className="toc" aria-label="Table of contents">
      <div className="toc-title">contents</div>
      <nav className="toc-list">
        {headings.map((heading) => (
          <Link key={heading.id} href={`#${heading.id}`} className={heading.depth === 3 ? "toc-sub" : ""}>
            {heading.text}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
