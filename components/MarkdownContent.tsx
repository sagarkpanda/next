"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

import CodeCopy from "@/components/CodeCopy";
import Mermaid from "@/components/Mermaid";
import { prepareMarkdown } from "@/lib/markdown";

type CodeBlockProps = {
  children: React.ReactNode;
  language: string;
  code: string;
  preProps: React.HTMLAttributes<HTMLPreElement>;
};

function CodeBlock({
  children,
  language,
  code,
  preProps,
}: CodeBlockProps) {
  const lineCount = code === "" ? 0 : code.split("\n").length;
  const expandable = lineCount > 3;

  const [expanded, setExpanded] = useState(!expandable);

  return (
    <div
      className={[
        "code-details",
        expandable ? "code-expandable" : "code-static",
        expanded ? "code-expanded" : "code-collapsed",
      ].join(" ")}
    >
      <div className="code-header">
        <span className="code-language">
          {language}
        </span>

        <span className="code-line-count">
          {lineCount} {lineCount === 1 ? "line" : "lines"}
        </span>
      </div>

      <div
        className={[
          "code-content",
          expandable && !expanded
            ? "code-content-collapsed"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <pre
          className="code-block"
          {...preProps}
        >
          {children}

          <CodeCopy code={code} />
        </pre>

        {expandable && (
          <button
            type="button"
            className="code-expand-button"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? "Collapse code block"
                : "Expand code block"
            }
            onClick={() => setExpanded((value) => !value)}
          >
            <span aria-hidden="true">
              {expanded ? "▲" : "▼"}
            </span>

            <span>
              {expanded ? "collapse" : "expand"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function MarkdownContent({
  source,
}: {
  source: string;
}) {
  const prepared = prepareMarkdown(source);

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

          const isMermaid =
            React.isValidElement(child) &&
            child.type === Mermaid;

          if (isMermaid) {
            return <>{children}</>;
          }

          let language = "code";
          let code = "";

          if (React.isValidElement(child)) {
            const childProps = child.props as {
              className?: string;
              children?: React.ReactNode;
            };

            const className =
              typeof childProps.className === "string"
                ? childProps.className
                : "";

            const match =
              /language-([\w-]+)/.exec(className);

            if (match?.[1]) {
              language = match[1];
            }

            code = String(
              childProps.children ?? ""
            ).replace(/\n$/, "");
          }

          return (
            <CodeBlock
              language={language}
              code={code}
              preProps={props}
            >
              {children}
            </CodeBlock>
          );
        },

        code({
          className,
          children,
          ...props
        }) {
          const match =
            /language-([\w-]+)/.exec(
              className || ""
            );

          if (match?.[1] === "mermaid") {
            return (
              <Mermaid
                code={String(children).replace(
                  /\n$/,
                  ""
                )}
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
      {prepared}
    </ReactMarkdown>
  );
}