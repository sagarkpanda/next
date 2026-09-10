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

    const getElements = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          ".article-body h2, .article-body h3"
        )
      );

    const updateActiveHeading = () => {
      const elements = getElements();

      if (!elements.length) return;

      const offset = 130;

      let activeIndex = 0;

      for (let i = 0; i < elements.length; i++) {
        const top = elements[i].getBoundingClientRect().top;

        if (top <= offset) {
          activeIndex = i;
        } else {
          break;
        }
      }

      const activeHeading = headings[activeIndex];

      if (activeHeading) {
        setActiveId(activeHeading.id);
      }
    };

    updateActiveHeading();

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        updateActiveHeading();
        ticking = false;
      });
    };

    const handleResize = () => {
      updateActiveHeading();
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [headings]);

  if (!headings.length) return null;

  function handleHeadingClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    index: number,
    heading: Heading
  ) {
    event.preventDefault();

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".article-body h2, .article-body h3"
      )
    );

    const element = elements[index];

    if (!element) return;

    setActiveId(heading.id);
    setOpen(false);

    const offset = 105;

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    const actualId = element.id || heading.id;

    window.history.replaceState(
      null,
      "",
      `#${actualId}`
    );
  }

  return (
    <section
      className={`toc${open ? " toc-open" : ""}`}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="toc-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="toc-toggle-left">
          <span className="toc-terminal">$</span>

          <span>table of contents</span>
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
            {headings.map((heading, index) => (
              <a
                key={`${heading.id}-${index}`}
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
                    index,
                    heading
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

                <span>{heading.text}</span>
              </a>
            ))}
          </div>
        </nav>
      )}
    </section>
  );
}
