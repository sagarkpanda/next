"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSearchIndex } from "@/lib/search";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(query);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return [];

    return getSearchIndex().filter((item) => {
      const haystack = [
        item.title,
        item.description,
        item.content,
        ...(item.tags ?? []),
        ...(item.categories ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [search]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <p className="mb-3 font-mono text-sm text-[var(--accent)]">
          search
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Search
        </h1>
      </div>

      <form action="/search" method="get" className="mb-10">
        <input
          type="search"
          name="q"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts, projects, technologies..."
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-base outline-none transition focus:border-[var(--accent)]"
          autoFocus
        />
      </form>

      {query && (
        <p className="mb-6 text-[var(--muted)]">
          {results.length} result{results.length === 1 ? "" : "s"} for{" "}
          <span className="font-medium text-[var(--text)]">
            "{query}"
          </span>
        </p>
      )}

      <div className="space-y-5">
        {results.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={item.route}
            className="block rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 transition hover:border-[var(--accent)]"
          >
            <div className="mb-2 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
              {item.type}
            </div>

            <h2 className="mb-2 text-xl font-semibold">
              {item.title}
            </h2>

            {item.description && (
              <p className="text-[var(--muted)]">
                {item.description}
              </p>
            )}
          </Link>
        ))}

        {query && results.length === 0 && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-8 text-[var(--muted)]">
            No results found.
          </div>
        )}

        {!query && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-8 text-[var(--muted)]">
            Enter a search term to find posts and projects.
          </div>
        )}
      </div>
    </main>
  );
}