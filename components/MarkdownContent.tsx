import MarkdownRenderer from "@/components/MarkdownRenderer";
import { prepareMarkdown } from "@/lib/markdown";

export default function MarkdownContent({
  source,
}: {
  source: string;
}) {
  const prepared = prepareMarkdown(source);

  return <MarkdownRenderer source={prepared} />;
}
