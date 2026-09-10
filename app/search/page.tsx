import { Suspense } from "react";
import { getCollection } from "@/lib/content";
import SearchPageClient from "@/components/SearchPageClient";

export const dynamic = "force-static";

export default function SearchPage() {
  const posts = getCollection("blogs");
  const projects = getCollection("projects");

  const items = [
    ...posts.map((item) => ({
      title: String(item.data.title ?? ""),
      summary: String(item.data.description ?? ""),
      tags: item.data.tags ?? [],
      route: item.route,
      kind: "blog" as const,
    })),
    ...projects.map((item) => ({
      title: String(item.data.title ?? ""),
      summary: String(item.data.description ?? ""),
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
}
