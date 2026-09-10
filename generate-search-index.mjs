import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const outputPath = path.join(root, "public", "search-index.json");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function normalizeSlug(file, section) {
  const relative = path
    .relative(path.join(contentRoot, section), file)
    .replace(/\\/g, "/");

  const noExt = relative.replace(/\.md$/i, "");
  const parts = noExt.split("/");

  if (parts.at(-1) === "_index") {
    parts.pop();
  }

  return parts.filter(Boolean).join("/");
}

const index = [];
const blogRoot = path.join(contentRoot, "blogs");

for (const file of walk(blogRoot).filter(
  (file) =>
    /\.md$/i.test(file) &&
    !path.basename(file).startsWith("_"),
)) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);

  if (parsed.data.draft) continue;

  const slug = normalizeSlug(file, "blogs");

  const tags = Array.isArray(parsed.data.tags)
    ? parsed.data.tags.map(String)
    : [];

  const categories = Array.isArray(parsed.data.categories)
    ? parsed.data.categories.map(String)
    : [];

  index.push({
    title: String(parsed.data.title ?? slug),
    description: String(
      parsed.data.description ??
        parsed.data.summary ??
        "",
    ),
    content: parsed.content,
    tags,
    categories,
    route: `/blogs/${slug}/`,
    kind: "Blog",
  });
}

fs.mkdirSync(path.dirname(outputPath), {
  recursive: true,
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(index),
);

console.log(
  `Generated ${index.length} blog search entries at ${path.relative(
    root,
    outputPath,
  )}`,
);
