"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SearchItem = {
  title: string;
  summary: string;
  tags: string[];
  route: string;
  kind: "blog" | "project";
};

export default function SearchPageClient({
  items,
}: {
  items: SearchItem[];
}) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const query = q.trim().toLowerCase();

  const matches = items.filter((item) => {
    if (!query) return false;

    const haystack = [
      item.title,
      item.summary,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return (
    <main className="shell page-shell">
      <section className="page-header">
        <div className="eyebrow">
          $ search {query ? `"${query}"` : ""}
        </div>

        <h1>Search</h1>

        <form className="page-search" action="/search/">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts and projects..."
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
                {item.kind}
              </span>

              <div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </div>
            </Link>
          ))}

          {!matches.length && (
            <p className="empty-state">
              No matching posts or projects.
            </p>
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
