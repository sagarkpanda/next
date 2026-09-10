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
  const relative = path.relative(path.join(contentRoot, section), file).replace(/\\/g, "/");
  const noExt = relative.replace(/\.md$/i, "");
  const parts = noExt.split("/");
  if (parts.at(-1) === "_index") parts.pop();
  return parts.filter(Boolean).join("/");
}

const index = [];

for (const section of ["blogs", "projects"]) {
  for (const file of walk(path.join(contentRoot, section)).filter(
    (file) => /\.md$/i.test(file) && !path.basename(file).startsWith("_"),
  )) {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    if (parsed.data.draft) continue;

    const slug = normalizeSlug(file, section);
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [];
    const categories = Array.isArray(parsed.data.categories)
      ? parsed.data.categories.map(String)
      : [];

    index.push({
      title: String(parsed.data.title ?? slug),
      description: String(parsed.data.description ?? parsed.data.summary ?? ""),
      content: parsed.content,
      tags,
      categories,
      route: `/${section}/${slug}/`,
      kind: section === "blogs" ? "Blog" : "Project",
    });
  }
}

// Searchable homepage sections. The content is derived from the existing site data
// at build time, while results point to the appropriate homepage section.
const siteData = fs.readFileSync(path.join(root, "lib", "site-data.ts"), "utf8");

const skillsMatch = siteData.match(/skills:\s*\[([\s\S]*?)\],\s*experience:/);
if (skillsMatch) {
  const skills = [...skillsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  index.push({
    title: "Skills",
    description: skills.join(", "),
    content: skills.join(" "),
    tags: skills,
    categories: [],
    route: "/#skills",
    kind: "Skill",
  });
}

const experienceMatch = siteData.match(/experience:\s*\[([\s\S]*?)\],\s*education:/);
if (experienceMatch) {
  const experienceText = experienceMatch[1]
    .replace(/https?:\/\/\S+/g, "")
    .replace(/["{}[\]]/g, " ")
    .replace(/[:,]/g, " ");
  index.push({
    title: "Experience",
    description: experienceText.replace(/\s+/g, " ").trim(),
    content: experienceText,
    tags: ["Wipro", "Valeo", "Waycool Foods", "Straive", "DevOps"],
    categories: [],
    route: "/#experience",
    kind: "Experience",
  });
}

const educationMatch = siteData.match(/education:\s*\[([\s\S]*?)\]\s*\};/);
if (educationMatch) {
  const educationText = educationMatch[1]
    .replace(/https?:\/\/\S+/g, "")
    .replace(/["{}[\]]/g, " ")
    .replace(/[:,]/g, " ");
  index.push({
    title: "Education",
    description: educationText.replace(/\s+/g, " ").trim(),
    content: educationText,
    tags: ["Master of Computer Applications", "Bachelor of Computer Applications"],
    categories: [],
    route: "/#education",
    kind: "Education",
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(index));
console.log(`Generated ${index.length} search entries at ${path.relative(root, outputPath)}`);
