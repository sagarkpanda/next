import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

import CodeBlock from "@/components/CodeBlock";
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
        pre({ children }) {
          const child =
            React.Children.toArray(
              children
            )[0];

          let language = "code";

          if (
            React.isValidElement(child)
          ) {
            const childProps =
              child.props as {
                className?: string;
              };

            const className =
              childProps.className ?? "";

            const match =
              /language-([\w-]+)/.exec(
                className
              );

            if (match?.[1]) {
              language = match[1];
            }
          }

          if (
            language === "mermaid"
          ) {
            return <>{children}</>;
          }

          return (
            <CodeBlock
              language={language}
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

          if (
            match?.[1] === "mermaid"
          ) {
            return (
              <Mermaid
                code={String(
                  children
                ).replace(/\n$/, "")}
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
