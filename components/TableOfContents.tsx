"use client";

import React, { useEffect, useRef, useState } from "react";

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
    const rawText = match[2];

    const customIdMatch =
      /\s*\{#([^}]+)\}\s*$/.exec(rawText);

    const text = cleanHeadingText(
      customIdMatch
        ? rawText.replace(/\s*\{#[^}]+\}\s*$/, "")
        : rawText
    );

    if (!text) continue;

    const baseId =
      customIdMatch?.[1] ||
      slugify(text) ||
      "section";

    const count = slugCounts.get(baseId) ?? 0;

    slugCounts.set(baseId, count + 1);

    const id =
      customIdMatch
        ? baseId
        : count === 0
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

  // The heading currently being read.
  const [activeIndex, setActiveIndex] = useState(-1);

  // The actual rendered heading text.
  const [activeText, setActiveText] = useState(
    "table of contents"
  );

  const tocRef = useRef<HTMLElement>(null);

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

      /*
       * The heading whose top has passed the reading line
       * becomes the current section.
       *
       * This works while scrolling DOWN and UP.
       */
      const offset = 130;

      let currentIndex = 0;

      for (let i = 0; i < elements.length; i++) {
        const top =
          elements[i].getBoundingClientRect().top;

        if (top <= offset) {
          currentIndex = i;
        } else {
          break;
        }
      }

      const currentElement = elements[currentIndex];

      if (!currentElement) return;

      setActiveIndex(currentIndex);

      /*
       * Use the actual rendered heading text rather than
       * relying on the markdown heading parser.
       */
      const text =
        currentElement.textContent?.trim() || "";

      if (text) {
        setActiveText(text);
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
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [headings]);

  /*
   * Close the TOC when clicking anywhere outside it.
   */
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        tocRef.current &&
        !tocRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  if (!headings.length) return null;

  function handleHeadingClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    index: number
  ) {
    event.preventDefault();

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".article-body h2, .article-body h3"
      )
    );

    const element = elements[index];

    if (!element) return;

    const offset = 105;

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      offset;

    /*
     * Immediately close the TOC for EVERY item,
     * including the final items in the list.
     */
    setOpen(false);

    /*
     * Immediately make the clicked section the
     * current TOC heading.
     */
    setActiveIndex(index);

    setActiveText(
      element.textContent?.trim() ||
        headings[index]?.text ||
        "table of contents"
    );

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

    /*
     * Use the REAL rendered heading ID.
     */
    if (element.id) {
      window.history.replaceState(
        null,
        "",
        `#${element.id}`
      );
    }
  }

  return (
    <section
      ref={tocRef}
      className={`toc${open ? " toc-open" : ""}`}
    >
      <button
        type="button"
        className="toc-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="toc-toggle-left">
          <span
            className="toc-terminal"
            aria-hidden="true"
          >
            $
          </span>

          <span className="toc-current-heading">
            {activeText}
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
            {headings.map((heading, index) => (
              <a
                key={`${heading.id}-${index}`}
                href={`#${heading.id}`}
                className={[
                  heading.level === 3
                    ? "toc-sub"
                    : "",
                  activeIndex === index
                    ? "toc-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(event) =>
                  handleHeadingClick(
                    event,
                    index
                  )
                }
              >
                <span
                  className="toc-active-marker"
                  aria-hidden="true"
                >
                  {activeIndex === index
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