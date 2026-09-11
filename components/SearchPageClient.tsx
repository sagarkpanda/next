"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  categories: string[];
  route: string;
  kind: string;
  date?: string;
};

type SearchMatch = {
  before: string;
  match: string;
  after: string;
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [items, setItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  const query = q.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [];

    return items
      .filter((item) => item.kind === "Blog")
      .filter((item) => {
        const searchableContent = cleanSearchContent(item.content);

        const haystack = [
          item.title,
          item.description,
          searchableContent,
          ...item.tags,
          ...item.categories,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });
  }, [items, query]);

  return (
    <main className="shell page-shell">
      <section className="page-header">
        <div className="eyebrow">
          $ search {query ? `"${q}"` : ""}
        </div>

        <h1>Search</h1>

        <form className="page-search" action="/search/">
          <div className="search-input-wrap">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search blog posts..."
              autoFocus
            />

            {q && (
              <Link
                href="/search/"
                className="search-clear"
                aria-label="Clear search"
                title="Clear search"
              >
                <XIcon />
              </Link>
            )}
          </div>

          <button className="button primary" type="submit">
            search →
          </button>
        </form>
      </section>

      {query ? (
        <section className="search-results">
          <p className="section-lead">
            {matches.length} result
            {matches.length === 1 ? "" : "s"} for{" "}
            <strong>{q}</strong>.
          </p>

          {matches.map((item) => {
            const match = findContentMatch(item.content, q);

            return (
              <Link
                className="search-result"
                key={`${item.kind}-${item.route}`}
                href={item.route}
              >
                <span className="search-result-kind">BLOG</span>

                <div>
                  <h2>{item.title}</h2>

                  {match ? (
                    <p className="search-result-preview">
                      {match.before}
                      <mark>{match.match}</mark>
                      {match.after}
                    </p>
                  ) : (
                    <p>{item.description}</p>
                  )}

                  <div className="search-result-meta">
                    {formatDate(item.date)}
                    <span>blogs</span>

                    {item.categories.slice(0, 1).map((category) => (
                      <span key={category}>{category}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}

          {!matches.length && (
            <p className="empty-state">
              No matching blog posts.
            </p>
          )}
        </section>
      ) : (
        <p className="empty-state">
          Search across Sagar&apos;s blog posts.
        </p>
      )}
    </main>
  );
}

function cleanSearchContent(content: string) {
  return content
    // Remove fenced code blocks.
    .replace(/```[\s\S]*?```/g, " ")

    // Remove Hugo figure shortcodes.
    .replace(
      /\{\{<\s*figure\b[\s\S]*?>\}\}/gi,
      " "
    )

    // Remove Markdown images.
    .replace(
      /!\[[^\]]*\]\(\s*(?:<[^>]*>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g,
      " "
    )

    // Remove reference-style Markdown images.
    .replace(
      /!\[[^\]]*\]\[[^\]]*\]/g,
      " "
    )

    // Remove raw HTML images.
    .replace(
      /<img\b[^>]*>/gi,
      " "
    )

    // Remove figure tags.
    .replace(
      /<\/?figure\b[^>]*>/gi,
      " "
    )

    // Keep visible Markdown link text.
    .replace(
      /\[([^\]]+)\]\(\s*<?[^)\s>]+>?(?:\s+["'][^"']*["'])?\s*\)/g,
      "$1"
    )

    // Reference-style links.
    .replace(
      /\[([^\]]+)\]\[[^\]]*\]/g,
      "$1"
    )

    // Remove raw HTML tags.
    .replace(
      /<[^>]+>/g,
      " "
    )

    // Remove Markdown formatting.
    .replace(
      /[#>*_`~]/g,
      " "
    )

    // Normalize whitespace.
    .replace(/\s+/g, " ")
    .trim();
}

function findContentMatch(
  content: string,
  searchTerm: string
): SearchMatch | null {
  const cleanedContent = cleanSearchContent(content);
  const term = searchTerm.trim();

  if (!cleanedContent || !term) {
    return null;
  }

  const lowerContent = cleanedContent.toLowerCase();
  const lowerTerm = term.toLowerCase();

  const matchIndex = lowerContent.indexOf(lowerTerm);

  if (matchIndex === -1) {
    return null;
  }

  const sentenceStart = findSentenceStart(
    cleanedContent,
    matchIndex
  );

  const sentenceEnd = findSentenceEnd(
    cleanedContent,
    matchIndex + term.length
  );

  const sentence = cleanedContent
    .slice(sentenceStart, sentenceEnd)
    .trim();

  if (!sentence) {
    return null;
  }

  const localMatchIndex = sentence
    .toLowerCase()
    .indexOf(lowerTerm);

  if (localMatchIndex === -1) {
    return null;
  }

  let before = sentence.slice(
    0,
    localMatchIndex
  );

  const match = sentence.slice(
    localMatchIndex,
    localMatchIndex + term.length
  );

  let after = sentence.slice(
    localMatchIndex + term.length
  );

  const maxBefore = 70;
  const maxAfter = 90;

  if (before.length > maxBefore) {
    before = `…${before
      .slice(-maxBefore)
      .trim()}`;
  } else if (sentenceStart > 0) {
    before = `…${before.trim()}`;
  }

  if (after.length > maxAfter) {
    after = `${after
      .slice(0, maxAfter)
      .trim()}…`;
  } else if (sentenceEnd < cleanedContent.length) {
    after = `${after.trim()} …`;
  }

  return {
    before,
    match,
    after,
  };
}

function findSentenceStart(
  text: string,
  index: number
) {
  for (let i = index - 1; i >= 0; i--) {
    const char = text[i];

    if (
      char === "." ||
      char === "!" ||
      char === "?"
    ) {
      return i + 1;
    }
  }

  return 0;
}

function findSentenceEnd(
  text: string,
  index: number
) {
  for (let i = index; i < text.length; i++) {
    const char = text[i];

    if (
      char === "." ||
      char === "!" ||
      char === "?"
    ) {
      return i + 1;
    }
  }

  return text.length;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}