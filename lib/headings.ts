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

  for (const line of markdown.split("\n")) {
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
