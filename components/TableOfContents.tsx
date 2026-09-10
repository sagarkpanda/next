export type Heading = {
  id: string;
  text: string;
  level: number;
};

function cleanHeadingText(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function slugify(value: string) {
  return cleanHeadingText(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();

  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);

    if (!match) continue;

    const level = match[1].length;
    const text = cleanHeadingText(match[2]);

    if (!text) continue;

    const baseId = slugify(text) || "section";

    const count = slugCounts.get(baseId) ?? 0;
    slugCounts.set(baseId, count + 1);

    const id = count === 0 ? baseId : `${baseId}-${count}`;

    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}

export default function TableOfContents({
  headings,
}: {
  headings: Heading[];
}) {
  if (!headings.length) return null;

  return (
    <details className="toc">
      <summary className="toc-toggle">
        <span className="toc-toggle-left">
          <span className="toc-terminal">$</span>
          <span>table of contents</span>
        </span>

        <span className="toc-arrow" aria-hidden="true">
          ▶
        </span>
      </summary>

      <nav aria-label="Table of contents">
        <div className="toc-list">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={heading.level === 3 ? "toc-sub" : ""}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </nav>
    </details>
  );
}