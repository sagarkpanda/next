"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const sections = [
  ["About", "/#about"],
  ["Skills", "/#skills"],
  ["Projects", "/#projects"],
  ["Experience", "/#experience"],
  ["Education", "/#education"],
  ["Latest Writing", "/#blog"],
  ["Contact", "/#contact"],
  ["All Blog Posts", "/blogs/"],
] as const;

export default function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;

    fetch("/search-index.json")
      .then((response) =>
        response.ok ? response.json() : []
      )
      .then((data) => {
        setIndex(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  const closeSearch = () => {
    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const q = query.trim();

    if (!q) return;

    closeSearch();

    router.push(
      `/search/?q=${encodeURIComponent(q)}`
    );
  };

  const normalized =
    query.trim().toLowerCase();

  const filteredSections =
    sections.filter(([name]) =>
      !normalized ||
      name.toLowerCase().includes(normalized)
    );

  const results = useMemo(() => {
    if (!normalized) return [];

    return index
      .filter((item) => item.kind === "Blog")
      .filter((item) => {
        const searchableContent =
          cleanSearchContent(item.content);

        const haystack = [
          item.title,
          item.description,
          searchableContent,
          ...item.tags,
          ...item.categories,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [index, normalized]);

  return (
    <>
      <button
        className="icon-button search-button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        title="Search (Ctrl+K)"
      >
        <Search size={16} />
      </button>

      {open && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <button
            className="search-backdrop"
            aria-label="Close search"
            onClick={closeSearch}
          />

          <div className="search-dialog">
            <div className="search-dialog-head">
              <span>
                <Search size={16} /> search
              </span>

              <button
                className="icon-button"
                onClick={closeSearch}
                aria-label="Close search"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="search-input-wrap">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search blog posts..."
                  aria-label="Search blog posts"
                />

                {query && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </form>

            {!normalized ? (
              <div className="search-suggestions">
                <div className="search-suggestions-title">
                  jump to section
                </div>

                {sections.map(([name, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeSearch}
                  >
                    {name}
                    <span>↗</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="search-suggestions">
                <div className="search-suggestions-title">
                  {results.length
                    ? "matching blog posts"
                    : "no matching blog posts"}
                </div>

                {results.map((item) => {
                  const match =
                    findContentMatch(
                      item.content,
                      query
                    );

                  return (
                    <Link
                      key={`${item.kind}-${item.route}`}
                      href={item.route}
                      onClick={closeSearch}
                    >
                      <span>
                        {item.title}

                        {match ? (
                          <small className="search-match-preview">
                            {match.before}
                            <mark>
                              {match.match}
                            </mark>
                            {match.after}
                          </small>
                        ) : (
                          <small>Blog</small>
                        )}
                      </span>

                      <span>↗</span>
                    </Link>
                  );
                })}

                {!results.length &&
                  filteredSections.length > 0 && (
                    <>
                      <div className="search-suggestions-title">
                        matching sections
                      </div>

                      {filteredSections.map(
                        ([name, href]) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={closeSearch}
                          >
                            {name}
                            <span>↗</span>
                          </Link>
                        )
                      )}
                    </>
                  )}

                <button
                  type="button"
                  className="search-all-button"
                  onClick={submit}
                >
                  Search all blog posts →
                </button>
              </div>
            )}

            <div className="search-hint">
              <span>Enter</span> search{" "}
              <span>Esc</span> close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function cleanSearchContent(content: string) {
  return content
    // Remove fenced code blocks.
    .replace(
      /```[\s\S]*?```/g,
      " "
    )

    // Remove Hugo figure shortcodes.
    .replace(
      /\{\{<\s*figure\b[\s\S]*?>\}\}/gi,
      " "
    )

    // Remove Markdown images.
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

    // Keep Markdown link text but remove its URL.
    .replace(
      /\[([^\]]+)\]\(\s*<?[^)\s>]+>?(?:\s+["'][^"']*["'])?\s*\)/g,
      "$1"
    )

    // Reference-style links.
    .replace(
      /\[([^\]]+)\]\[[^\]]*\]/g,
      "$1"
    )

    // Remove HTML tags.
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

  /*
   * Two complete sentences before the match,
   * the matching sentence,
   * and two complete sentences after it.
   */
  const startSentence = Math.max(
    0,
    currentSentenceIndex - 2
  );

  const endSentence = Math.min(
    sentences.length,
    currentSentenceIndex + 3
  );

  const selected =
    sentences.slice(
      startSentence,
      endSentence
    );

  const selectedText =
    selected.join(" ").trim();

  const localMatchIndex =
    selectedText
      .toLowerCase()
      .indexOf(lowerTerm);

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
  const sentences =
    text.match(
      /[^.!?]+(?:[.!?]+(?=\s|$)|$)/g
    ) ?? [];

  return sentences
    .map((sentence) =>
      sentence
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}