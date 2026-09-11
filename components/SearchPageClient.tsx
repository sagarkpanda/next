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
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";

  const [items, setItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    fetch("/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setItems([]);
      });
  }, []);

  const query = q.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [];

    return items
      .filter((item) => item.kind === "Blog")
      .map((item) => {
        const cleanContent = cleanSearchContent(item.content);

        const haystack = [
          item.title,
          item.description,
          cleanContent,
          ...item.tags,
          ...item.categories,
        ]
          .join(" ")
          .toLowerCase();

        return {
          ...item,
          cleanContent,
          haystack,
        };
      })
      .filter((item) => item.haystack.includes(query));
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

          <button
            className="button primary"
            type="submit"
          >
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
            const preview =
              findContentMatch(item.cleanContent, query) ||
              item.description;

            return (
              <Link
                className="search-result"
                key={`${item.kind}-${item.route}`}
                href={item.route}
              >
                <span className="search-result-kind">
                  BLOG
                </span>

                <div>
                  <h2>{item.title}</h2>

                  {preview && (
                    <p className="search-result-preview">
                      {highlightMatch(
                        preview,
                        query
                      )}
                    </p>
                  )}
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
    .replace(/\{\{<\s*figure[\s\S]*?>\}\}/gi, " ")

    // Remove Markdown images.
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")

    // Remove reference-style Markdown images.
    .replace(/!\[[^\]]*\]\s*\[[^\]]*\]/g, " ")

    // Remove raw HTML images.
    .replace(/<img\b[^>]*>/gi, " ")

    // Remove figure HTML.
    .replace(/<\/?figure\b[^>]*>/gi, " ")

    // Keep visible Markdown link text.
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

    // Remove remaining HTML.
    .replace(/<[^>]+>/g, " ")

    // Remove common Markdown formatting.
    .replace(/[#>*_`~]/g, " ")

    // Remove Markdown link/reference remnants.
    .replace(/\]\s*\(/g, " ")

    // Normalize whitespace.
    .replace(/\s+/g, " ")
    .trim();
}

function findContentMatch(
  content: string,
  query: string
) {
  if (!content || !query) return "";

  const lowerContent = content.toLowerCase();
  const matchIndex = lowerContent.indexOf(query);

  if (matchIndex === -1) return "";

  const sentences = content.split(
    /(?<=[.!?])\s+/
  );

  let position = 0;

  for (const sentence of sentences) {
    const sentenceStart = position;
    const sentenceEnd =
      position + sentence.length;

    if (
      matchIndex >= sentenceStart &&
      matchIndex <= sentenceEnd
    ) {
      const maxLength = 180;

      if (sentence.length <= maxLength) {
        return sentence.trim();
      }

      const localMatch =
        matchIndex - sentenceStart;

      const start = Math.max(
        0,
        localMatch - 70
      );

      const end = Math.min(
        sentence.length,
        start + maxLength
      );

      let preview = sentence
        .slice(start, end)
        .trim();

      if (start > 0) {
        preview = `…${preview}`;
      }

      if (end < sentence.length) {
        preview = `${preview}…`;
      }

      return preview;
    }

    position = sentenceEnd + 1;
  }

  return content.slice(
    Math.max(0, matchIndex - 70),
    matchIndex + 110
  );
}

function highlightMatch(
  text: string,
  query: string
) {
  if (!query) return text;

  const escaped = query.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const parts = text.split(
    new RegExp(`(${escaped})`, "gi")
  );

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
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