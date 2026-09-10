"use client";

import { useState } from "react";
import CodeCopy from "@/components/CodeCopy";

function getText(
  value: React.ReactNode
): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getText).join("");
  }

  return "";
}

export default function CodeBlock({
  children,
  language,
}: {
  children: React.ReactNode;
  language: string;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const code = getText(children);

  const lineCount =
    code.replace(/\n$/, "").split("\n").length;

  const isLong = lineCount > 3;

  return (
    <div
      className={[
        "code-details",
        isLong && !expanded
          ? "code-collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="code-summary">
        <div className="code-summary-left">
          <span
            className="code-language"
          >
            {language}
          </span>
        </div>

        {isLong && (
          <button
            type="button"
            className="code-expand-button"
            aria-label={
              expanded
                ? "Collapse code"
                : "Expand code"
            }
            aria-expanded={expanded}
            onClick={() =>
              setExpanded(
                (value) => !value
              )
            }
          >
            {expanded ? "▲" : "▼"}
          </button>
        )}
      </div>

      <pre className="code-block">
        {children}
        <CodeCopy code={code} />
      </pre>
    </div>
  );
}
