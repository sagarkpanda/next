"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

type SearchItem = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  categories: string[];
  route: string;
  kind: string;
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
        const haystack = [
          item.title,
          item.description,
          item.content,
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
            const match = findContentMatch(item, q);

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
                    <p>
                      {match.before}
                      <mark>{match.match}</mark>
                      {match.after}
                    </p>
                  ) : (
                    <p>{item.description}</p>
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

function findContentMatch(
  item: SearchItem,
  searchTerm: string
): SearchMatch | null {
  const content = item.content || "";
  const term = searchTerm.trim();

  if (!content || !term) return null;

  const lowerContent = content.toLowerCase();
  const lowerTerm = term.toLowerCase();

  const index = lowerContent.indexOf(lowerTerm);

  if (index === -1) {
    return null;
  }

  const contextBefore = 95;
  const contextAfter = 140;

  let start = Math.max(0, index - contextBefore);
  let end = Math.min(
    content.length,
    index + term.length + contextAfter
  );

  /*
   * Prefer starting at a natural boundary instead of cutting
   * directly through a word.
   */
  if (start > 0) {
    const boundary = content.slice(start, index).search(/[\s.!?,;:]\S*$/);

    if (boundary >= 0) {
      start += boundary + 1;
    }
  }

  /*
   * Prefer ending at a natural boundary as well.
   */
  if (end < content.length) {
    const afterMatch = content.slice(index + term.length, end);
    const boundary = afterMatch.search(/[\s.!?,;:]/);

    if (boundary >= 0) {
      end = index + term.length + boundary;
    }
  }

  let before = content.slice(start, index);
  const match = content.slice(index, index + term.length);
  let after = content.slice(index + term.length, end);

  before = cleanExcerpt(before);
  after = cleanExcerpt(after);

  if (start > 0) {
    before = `…${before}`;
  }

  if (end < content.length) {
    after = `${after}…`;
  }

  return {
    before,
    match,
    after,
  };
}

function cleanExcerpt(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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