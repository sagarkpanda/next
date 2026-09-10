import { getCollection } from "@/lib/content";

function protectCode(text: string) {
  const protectedParts: string[] = [];
  const token = (i: number) => `@@MD_CODE_${i}_@@`;

  text = text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, (match) => {
    const i = protectedParts.push(match) - 1;
    return token(i);
  });
  text = text.replace(/`[^`\n]+`/g, (match) => {
    const i = protectedParts.push(match) - 1;
    return token(i);
  });

  return {
    text,
    restore(value: string) {
      return value.replace(/@@MD_CODE_(\d+)_@@/g, (_, i) => protectedParts[Number(i)]);
    },
  };
}

function escapeAttr(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function getShortcodeAttr(attrs: string, name: string) {
  return attrs.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

export function prepareMarkdown(source: string) {
  const protectedCode = protectCode(source);
  let text = protectedCode.text;

  // Remove legacy Hugo HTML comments from prose.
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Keep HTML line breaks valid when rehype-raw is enabled.
  text = text.replace(/<br\s*>\s*<\/br\s*>|<br\s*\/?>(?=\s*)/gi, "<br />");

  // Hugo figure shortcode. Some source files use multiline shortcodes, so match
  // across newlines. Convert the shortcode to ordinary Markdown instead of
  // nesting Markdown inside raw HTML (which Markdown parsers do not process).
  text = text.replace(/\{\{<\s*figure\b([\s\S]*?)>\}\}/gi, (_, attrs: string) => {
    const src = getShortcodeAttr(attrs, "src");
    if (!src) return "";
    const alt = getShortcodeAttr(attrs, "alt") || "Image";
    const title = getShortcodeAttr(attrs, "title");
    const image = `![${alt}](${src})`;
    return title ? `${image}\n\n*${title}*` : image;
  });

  // Raw HTML images from the Markdown source become normal Markdown images.
  // This keeps external images consistent with the Hugo figure conversion.
  text = text.replace(/<img\s+([^>]*?)\/?\s*>/gi, (_, attrs: string) => {
    const src = getShortcodeAttr(attrs, "src");
    if (!src) return _;
    const alt = getShortcodeAttr(attrs, "alt") || "Image";
    const title = getShortcodeAttr(attrs, "title");
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  });

  // Literal angle-bracket placeholders in prose (e.g. <name:tag>) are not HTML.
  text = text.replace(/<([A-Za-z][A-Za-z0-9_-]*:[A-Za-z0-9_-]+)>/g, (_, inner) => `&lt;${inner}&gt;`);

  // Hugo icon shortcode is not semantically important to article text.
  text = text.replace(/\{\{<\s*icon\s+name=["']([^"']+)["'][^>]*>\}\}/g, "◉");

  // Hugo relref shortcode -> matching blog route.
  const posts = getCollection("blogs");
  text = text.replace(/\{\{<\s*relref\s+["']([^"']+)["']\s*>\}\}/g, (_, target: string) => {
    const match = posts.find((p) => p.slug === target || p.slug.endsWith(`/${target}`));
    return match ? `/blogs/${match.slug}/` : target;
  });

  return protectedCode.restore(text);
}
