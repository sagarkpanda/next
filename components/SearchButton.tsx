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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;

    fetch("/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
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
    router.push(`/search/?q=${encodeURIComponent(q)}`);
  };

  const normalized = query.trim().toLowerCase();

  const filteredSections = sections.filter(([name]) =>
    !normalized
      ? true
      : name.toLowerCase().includes(normalized)
  );

  const results = useMemo(() => {
    if (!normalized) return [];

    return index
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
                  onChange={(e) => setQuery(e.target.value)}
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
                  const match = findContentMatch(item, query);

                  return (
                    <Link
                      key={`${item.kind}-${item.route}`}
                      href={item.route}
                      onClick={closeSearch}
                    >
                      <span>
                        {item.title}

                        {match && (
                          <small className="search-match-preview">
                            {match.before}
                            <mark>{match.match}</mark>
                            {match.after}
                          </small>
                        )}

                        {!match && (
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

                      {filteredSections.map(([name, href]) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={closeSearch}
                        >
                          {name}
                          <span>↗</span>
                        </Link>
                      ))}
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
              <span>Enter</span> search <span>Esc</span> close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function findContentMatch(
  item: SearchItem,
  searchTerm: string
): SearchMatch | null {
  const content = item.content || "";
  const term = searchTerm.trim();

  if (!content || !term) return null;

  const lowerContent = content.toLowerCase();
  const lowerTerm = term.toLowerCase();

  const index = lowerContent.indexOf(lowerTerm);

  if (index === -1) {
    return null;
  }

  const contextBefore = 70;
  const contextAfter = 100;

  let start = Math.max(0, index - contextBefore);
  let end = Math.min(
    content.length,
    index + term.length + contextAfter
  );

  if (start > 0) {
    const boundary = content
      .slice(start, index)
      .search(/[\s.!?,;:]\S*$/);

    if (boundary >= 0) {
      start += boundary + 1;
    }
  }

  if (end < content.length) {
    const afterMatch = content.slice(
      index + term.length,
      end
    );

    const boundary = afterMatch.search(/[\s.!?,;:]/);

    if (boundary >= 0) {
      end = index + term.length + boundary;
    }
  }

  let before = content.slice(start, index);
  const match = content.slice(index, index + term.length);
  let after = content.slice(index + term.length, end);

  before = cleanExcerpt(before);
  after = cleanExcerpt(after);

  if (start > 0) {
    before = `…${before}`;
  }

  if (end < content.length) {
    after = `${after}…`;
  }

  return {
    before,
    match,
    after,
  };
}

function cleanExcerpt(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}