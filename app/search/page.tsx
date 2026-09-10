import { Suspense } from "react";
import { getCollection } from "@/lib/content";
import SearchPageClient from "@/components/SearchPageClient";

export const dynamic = "force-static";

export default function SearchPage() {
  const posts = getCollection("blogs");
  const projects = getCollection("projects");

  const items = [
    ...posts.map((item) => ({
      title: item.data.title ?? "",
      summary: item.data.summary ?? "",
      tags: item.data.tags ?? [],
      route: item.route,
      kind: "blog" as const,
    })),
    ...projects.map((item) => ({
      title: item.data.title ?? "",
      summary: item.data.summary ?? "",
      tags: item.data.tags ?? [],
      route: item.route,
      kind: "project" as const,
    })),
  ];

  return (
    <Suspense fallback={<main className="shell page-shell" />}>
      <SearchPageClient items={items} />
    </Suspense>
  );
}  return (
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
