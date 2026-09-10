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

          {matches.map((item) => (
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
                <p>{item.description}</p>
              </div>
            </Link>
          ))}

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
