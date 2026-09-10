"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";

export type { Heading } from "@/lib/headings";

export default function TableOfContents({
  headings,
}: {
  headings: Heading[];
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length) {
          setActiveId(visible[0].target.id);
          return;
        }

        const passed = elements
          .filter(
            (element) =>
              element.getBoundingClientRect().top <= 130
          )
          .sort(
            (a, b) =>
              b.getBoundingClientRect().top -
              a.getBoundingClientRect().top
          );

        if (passed.length) {
          setActiveId(passed[0].id);
        }
      },
      {
        rootMargin: "-105px 0px -65% 0px",
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  function handleMouseLeave() {
    setOpen(false);
  }

  function handleHeadingClick() {
    setOpen(false);
  }

  return (
    <section
      className={`toc${open ? " toc-open" : ""}`}
      onMouseLeave={handleMouseLeave}
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
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={[
                  heading.level === 3 ? "toc-sub" : "",
                  activeId === heading.id ? "toc-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleHeadingClick}
              >
                <span className="toc-active-marker">
                  {activeId === heading.id ? ">" : ""}
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
