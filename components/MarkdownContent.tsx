import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

import CodeCopy from "@/components/CodeCopy";
import Mermaid from "@/components/Mermaid";
import { prepareMarkdown } from "@/lib/markdown";

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
            React.isValidElement(child) && child.type === Mermaid;

          if (isMermaid) {
            return <>{children}</>;
          }

          let language = "code";

          if (React.isValidElement(child)) {
            const className =
              typeof child.props?.className === "string"
                ? child.props.className
                : "";

            const match = /language-([\w-]+)/.exec(className);

            if (match?.[1]) {
              language = match[1];
            }
          }

          return (
            <details className="code-details">
              <summary className="code-summary">
                <span className="code-summary-left">
                  <span className="code-arrow" aria-hidden="true">
                    ▶
                  </span>

                  <span>{language}</span>
                </span>

                <span className="code-expand-label">
                  expand
                </span>
              </summary>

              <pre className="code-block" {...props}>
                {children}
                <CodeCopy />
              </pre>
            </details>
          );
        },

        code({ className, children, ...props }) {
          const match = /language-([\w-]+)/.exec(className || "");

          if (match?.[1] === "mermaid") {
            return (
              <Mermaid
                chart={String(children).replace(/\n$/, "")}
              />
            );
          }

          return (
            <code className={className} {...props}>
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