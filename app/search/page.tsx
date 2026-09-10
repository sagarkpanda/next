import Link from "next/link";
import { getCollection } from "@/lib/content";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const posts = getCollection("blogs");
  const projects = getCollection("projects");
  const matches = [
    ...posts.map((item) => ({ ...item, kind: "blog" as const })),
    ...projects.map((item) => ({ ...item, kind: "project" as const })),
  ].filter((item) => {
    if (!query) return false;
    const haystack = `${item.data.title ?? ""} ${item.data.summary ?? ""} ${(item.data.tags ?? []).join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });

  return (
    <main className="shell page-shell">
      <section className="page-header">
        <div className="eyebrow">$ search {query ? `"${query}"` : ""}</div>
        <h1>Search</h1>
        <form className="page-search" action="/search/">
          <input name="q" defaultValue={q} placeholder="Search posts and projects..." autoFocus />
          <button className="button primary" type="submit">search →</button>
        </form>
      </section>
      {query ? (
        <section className="search-results">
          <p className="section-lead">{matches.length} result{matches.length === 1 ? "" : "s"} for <strong>{q}</strong>.</p>
          {matches.map((item) => (
            <Link className="search-result" key={`${item.kind}-${item.route}`} href={item.route}>
              <span className="search-result-kind">{item.kind}</span>
              <div><h2>{item.data.title}</h2><p>{item.data.summary}</p></div>
            </Link>
          ))}
          {!matches.length && <p className="empty-state">No matching posts or projects.</p>}
        </section>
      ) : <p className="empty-state">Type a term to search your writing and projects.</p>}
    </main>
  );
}
