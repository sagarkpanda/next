import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";

export const dynamic = "force-static";

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="shell page-shell" />}>
      <SearchPageClient />
    </Suspense>
  );
}
