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

    return items.filter((item) => {
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
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts, projects, technologies..."
            autoFocus
          />

          <button className="button primary" type="submit">
            search →
          </button>
        </form>
      </section>

      {query ? (
        <section className="search-results">
          <p className="section-lead">
            {matches.length} result{matches.length === 1 ? "" : "s"} for{" "}
            <strong>{q}</strong>.
          </p>

          {matches.map((item) => (
            <Link
              className="search-result"
              key={`${item.kind}-${item.route}`}
              href={item.route}
            >
              <span className="search-result-kind">{item.kind}</span>

              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}

          {!matches.length && (
            <p className="empty-state">No matching posts or projects.</p>
          )}
        </section>
      ) : (
        <p className="empty-state">
          Type a term to search your writing and projects.
        </p>
      )}
    </main>
  );
}
