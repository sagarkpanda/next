"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

import CodeCopy from "@/components/CodeCopy";
import Mermaid from "@/components/Mermaid";

function getTextContent(value: React.ReactNode): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getTextContent).join("");
  }

  if (React.isValidElement(value)) {
    const props = value.props as {
      children?: React.ReactNode;
    };

    return getTextContent(props.children);
  }

  return "";
}

function CodeBlock({
  children,
  language,
  ...props
}: {
  children: React.ReactNode;
  language: string;
  [key: string]: unknown;
}) {
  const [expanded, setExpanded] = useState(false);

  const code = getTextContent(children);
  const lines = code.replace(/\n$/, "").split("\n");
  const isLong = lines.length > 3;

  const visibleCode =
    isLong && !expanded
      ? `${lines.slice(0, 3).join("\n")}\n`
      : code;

  return (
    <div
      className={[
        "code-wrapper",
        isLong && !expanded ? "code-collapsed" : "",
        expanded ? "code-expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <pre
        className="code-block"
        {...(props as React.HTMLAttributes<HTMLPreElement>)}
      >
        <code>{visibleCode}</code>

        <CodeCopy code={code} />
      </pre>

      {isLong && (
        <button
          type="button"
          className="code-expand-button"
          aria-label={expanded ? "Collapse code" : "Expand code"}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <span aria-hidden="true">
            {expanded ? "▲" : "▼"}
          </span>
        </button>
      )}
    </div>
  );
}

export default function MarkdownRenderer({
  source,
}: {
  source: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        rehypeHighlight,
        rehypeSlug,
      ]}
      components={{
        pre({ children, ...props }) {
          const child = React.Children.toArray(children)[0];

          let language = "code";

          if (React.isValidElement(child)) {
            const childProps = child.props as {
              className?: string;
            };

            const className = childProps.className ?? "";

            const match =
              /language-([\w-]+)/.exec(className);

            if (match?.[1]) {
              language = match[1];
            }
          }

          if (language === "mermaid") {
            return <>{children}</>;
          }

          return (
            <CodeBlock
              language={language}
              {...props}
            >
              {children}
            </CodeBlock>
          );
        },

        code({ className, children, ...props }) {
          const match =
            /language-([\w-]+)/.exec(className || "");

          if (match?.[1] === "mermaid") {
            return (
              <Mermaid
                code={String(children).replace(/\n$/, "")}
              />
            );
          }

          return (
            <code
              className={className}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
