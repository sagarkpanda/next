import { getCollection } from "@/lib/content";

function escapeAttr(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

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

  // Remove legacy HTML comments from the Hugo source.
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Keep HTML line breaks valid when rehype-raw is enabled.
  text = text.replace(/<br\s*>\s*<\/br\s*>|<br\s*\/?>/gi, "<br />");

  // Literal angle-bracket placeholders in prose (e.g. <name:tag>) are not HTML.
  text = text.replace(/<([A-Za-z][^>]*:[^>]*)>/g, (_, inner) => `&lt;${inner}&gt;`);

  // MD is parsed as Markdown, not MDX, so braces are ordinary text and need no
  // JavaScript-expression escaping. Protecting code above prevents any HTML
  // normalization from touching code examples.

  return text.replace(/@@MD_CODE_(\d+)_@@/g, (_, i) => protectedParts[Number(i)]);
}

export function prepareMarkdown(source: string) {
  let text = source;

  // Normalize raw HTML <img> elements to Markdown images so externally hosted
  // images render consistently through the Markdown pipeline. Do this BEFORE
  // converting Hugo figure shortcodes; otherwise the generated <figure><img>
  // would be converted back into Markdown inside raw HTML, which Markdown does
  // not parse as an image.
  text = text.replace(/<img\s+([^>]*?)\/?\s*>/gi, (_, attrs: string) => {
    const get = (name: string) => attrs.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
    const src = get("src");
    if (!src) return _;
    const alt = get("alt") || "Image";
    const title = get("title");
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  });

  // Hugo figure shortcode -> HTML figure; react-markdown + rehype-raw renders it.
  // Keep this AFTER raw <img> normalization so the generated image stays HTML.
  text = text.replace(/\{\{<\s*figure\s+([^>]+?)\s*>\}\}/g, (_, attrs: string) => {
    const get = (name: string) => attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
    const src = get("src");
    const alt = get("alt") || "Image";
    const title = get("title");
    return `<figure class="my-8"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" class="mx-auto h-auto max-w-full rounded-xl border border-zinc-800/10 dark:border-white/10" />${title ? `<figcaption>${escapeAttr(title)}</figcaption>` : ""}</figure>`;
  });

  // Hugo icon shortcode is not semantically important to article text.
  text = text.replace(/\{\{<\s*icon\s+name="([^"]+)"[^>]*>\}\}/g, "◉");

  // Hugo relref shortcode -> matching blog route.
  const posts = getCollection("blogs");
  text = text.replace(/\{\{<\s*relref\s+"([^"]+)"\s*>\}\}/g, (_, target: string) => {
    const match = posts.find((p) => p.slug === target || p.slug.endsWith(`/${target}`));
    return match ? `/blogs/${match.slug}/` : target;
  });

  return protectCode(text);
}
