import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import Mermaid from "@/components/Mermaid";
import { prepareMarkdown } from "@/lib/markdown";

type CodeProps = React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode };

function CodeBlock({ className, children, ...props }: CodeProps) {
  const language = /language-(\w+)/.exec(className || "")?.[1];
  const value = String(children ?? "").replace(/\n$/, "");
  if (language === "mermaid") return <Mermaid code={value} />;
  return <code className={className} {...props}>{children}</code>;
}

export default function MarkdownContent({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
      components={{
        code: CodeBlock,
        a: ({ href, ...props }) => <a href={href} {...props} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined} />,
        img: ({ loading, ...props }) => <img {...props} loading={loading ?? "lazy"} />,
      }}
    >
      {prepareMarkdown(source)}
    </ReactMarkdown>
  );
}
