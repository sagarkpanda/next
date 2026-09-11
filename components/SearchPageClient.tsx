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
        const searchableContent = cleanSearchContent(
          item.content
        );

        const haystack = [
          item.title,
          item.description,
          searchableContent,
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
            const match = findContentMatch(
              item.content,
              q
            );

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

function cleanSearchContent(content: string) {
  return content
    // Remove fenced code blocks.
    .replace(
      /```[\s\S]*?```/g,
      " "
    )

    // Remove Hugo figure shortcodes completely.
    .replace(
      /\{\{<\s*figure\b[\s\S]*?>\}\}/gi,
      " "
    )

    // Remove Markdown images completely.
    .replace(
      /!\[[^\]]*\]\(\s*(?:<[^>]*>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g,
      " "
    )

    // Remove reference-style Markdown images.
    .replace(
      /!\[[^\]]*\]\[[^\]]*\]/g,
      " "
    )

    // Remove raw HTML images.
    .replace(
      /<img\b[^>]*>/gi,
      " "
    )

    // Remove figure tags.
    .replace(
      /<\/?figure\b[^>]*>/gi,
      " "
    )

    // Markdown links: keep visible text only.
    .replace(
      /\[([^\]]+)\]\(\s*<?[^)\s>]+>?(?:\s+["'][^"']*["'])?\s*\)/g,
      "$1"
    )

    // Reference-style Markdown links.
    .replace(
      /\[([^\]]+)\]\[[^\]]*\]/g,
      "$1"
    )

    // Remove raw HTML tags.
    .replace(
      /<[^>]+>/g,
      " "
    )

    // Remove Markdown formatting.
    .replace(
      /[#>*_`~]/g,
      " "
    )

    // Normalize whitespace.
    .replace(/\s+/g, " ")
    .trim();
}

function findContentMatch(
  content: string,
  searchTerm: string
): SearchMatch | null {
  const cleanedContent =
    cleanSearchContent(content);

  const term = searchTerm.trim();

  if (!cleanedContent || !term) {
    return null;
  }

  const lowerContent =
    cleanedContent.toLowerCase();

  const lowerTerm =
    term.toLowerCase();

  const matchIndex =
    lowerContent.indexOf(lowerTerm);

  if (matchIndex === -1) {
    return null;
  }

  /*
   * Split the cleaned article into sentences.
   * Keep the original sentence text so the result
   * remains readable.
   */
  const sentences =
    splitIntoSentences(cleanedContent);

  let currentSentenceIndex = -1;
  let currentOffset = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    const sentenceStart =
      currentOffset;

    const sentenceEnd =
      sentenceStart + sentence.length;

    if (
      matchIndex >= sentenceStart &&
      matchIndex < sentenceEnd
    ) {
      currentSentenceIndex = i;
      break;
    }

    currentOffset = sentenceEnd;
  }

  if (currentSentenceIndex === -1) {
    return null;
  }

  const startSentence = Math.max(
    0,
    currentSentenceIndex - 2
  );

  const endSentence = Math.min(
    sentences.length,
    currentSentenceIndex + 3
  );

  const selected = sentences.slice(
    startSentence,
    endSentence
  );

  const selectedText =
    selected.join(" ").trim();

  const selectedLower =
    selectedText.toLowerCase();

  const localMatchIndex =
    selectedLower.indexOf(lowerTerm);

  if (localMatchIndex === -1) {
    return null;
  }

  let before =
    selectedText.slice(
      0,
      localMatchIndex
    );

  const match =
    selectedText.slice(
      localMatchIndex,
      localMatchIndex + term.length
    );

  let after =
    selectedText.slice(
      localMatchIndex + term.length
    );

  before = before.trim();
  after = after.trim();

  if (startSentence > 0) {
    before = `… ${before}`;
  }

  if (endSentence < sentences.length) {
    after = `${after} …`;
  }

  return {
    before,
    match,
    after,
  };
}

function splitIntoSentences(text: string) {
  /*
   * Handles normal prose sentences ending in:
   * . ! ?
   *
   * Also avoids breaking common technical patterns
   * unnecessarily by requiring whitespace after the
   * punctuation.
   */
  const sentences =
    text.match(
      /[^.!?]+(?:[.!?]+(?=\s|$)|$)/g
    ) ?? [];

  return sentences
    .map((sentence) =>
      sentence.replace(/\s+/g, " ").trim()
    )
    .filter(Boolean);
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