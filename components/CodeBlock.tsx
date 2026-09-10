"use client";

import React from "react";
import CodeCopy from "@/components/CodeCopy";

function getText(value: React.ReactNode): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getText).join("");
  }

  if (
    value &&
    typeof value === "object" &&
    "props" in value
  ) {
    const props = value.props as {
      children?: React.ReactNode;
    };

    return getText(props.children);
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
  const code = getText(children);
  const normalizedCode = code.replace(/\n$/, "");

  const lineCount = normalizedCode
    ? normalizedCode.split("\n").length
    : 0;

  const isLong = lineCount > 3;

  const [expanded, setExpanded] = React.useState(false);

  const collapsed = isLong && !expanded;

  return (
    <div
      className={[
        "code-details",
        collapsed ? "code-collapsed" : "",
        expanded ? "code-expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="code-summary">
        <div className="code-summary-left">
          <span className="code-language">
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
              setExpanded((value) => !value)
            }
          >
            <span aria-hidden="true">
              {expanded ? "▲" : "▼"}
            </span>
          </button>
        )}
      </div>

      <div className="code-content">
        <pre className="code-block">
          {children}

          <CodeCopy code={normalizedCode} />
        </pre>
      </div>
    </div>
  );
}
