"use client";

import { useEffect, useState } from "react";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

function cleanHeadingText(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function slugify(value: string) {
  return cleanHeadingText(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);

    if (!match) continue;

    const level = match[1].length;
    const text = cleanHeadingText(match[2]);

    if (!text) continue;

    const baseId = slugify(text) || "section";
    const count = slugCounts.get(baseId) ?? 0;

    slugCounts.set(baseId, count + 1);

    const id =
      count === 0
        ? baseId
        : `${baseId}-${count}`;

    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}

export default function TableOfContents({
  headings,
}: {
  headings: Heading[];
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!headings.length) return;

    let ticking = false;

    const updateActiveHeading = () => {
      const offset = 130;

      let current = headings[0]?.id ?? "";

      for (const heading of headings) {
        const element = document.getElementById(
          heading.id
        );

        if (!element) continue;

        const top = element.getBoundingClientRect().top;

        if (top <= offset) {
          current = heading.id;
        } else {
          break;
        }
      }

      setActiveId(current);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(
        updateActiveHeading
      );
    };

    updateActiveHeading();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleScroll
      );
    };
  }, [headings]);

  if (!headings.length) {
    return null;
  }

  function handleHeadingClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) {
    event.preventDefault();

    const element =
      document.getElementById(id);

    if (!element) return;

    const offset = 105;

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    setActiveId(id);
    setOpen(false);

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );
  }

  return (
    <section
      className={`toc${open ? " toc-open" : ""}`}
    >
      <button
        type="button"
        className="toc-toggle"
        aria-expanded={open}
        onClick={() =>
          setOpen((value) => !value)
        }
      >
        <span className="toc-toggle-left">
          <span className="toc-terminal">
            $
          </span>

          <span>
            table of contents
          </span>
        </span>

        <span
          className="toc-arrow"
          aria-hidden="true"
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <nav
          className="toc-nav"
          aria-label="Table of contents"
        >
          <div className="toc-list">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={[
                  heading.level === 3
                    ? "toc-sub"
                    : "",
                  activeId === heading.id
                    ? "toc-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(event) =>
                  handleHeadingClick(
                    event,
                    heading.id
                  )
                }
              >
                <span
                  className="toc-active-marker"
                  aria-hidden="true"
                >
                  {activeId === heading.id
                    ? ">"
                    : ""}
                </span>

                <span>
                  {heading.text}
                </span>
              </a>
            ))}
          </div>
        </nav>
      )}
    </section>
  );
}
