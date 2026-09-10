import Link from "next/link";
import {
  displayDate,
  getCollection,
  readingTime,
} from "@/lib/content";

import type { ContentItem } from "@/types/content";

import MarkdownContent from "@/components/MarkdownContent";
import TableOfContents, {
  extractHeadings,
} from "@/components/TableOfContents";

function RelatedPosts({
  post,
}: {
  post: ContentItem;
}) {
  const all = getCollection("blogs").filter(
    (item) => item.route !== post.route
  );

  const tags = new Set(
    (post.data.tags ?? []).map((t) =>
      t.toLowerCase()
    )
  );

  const categories = new Set(
    (post.data.categories ?? []).map((c) =>
      c.toLowerCase()
    )
  );

  const related = all
    .map((item) => {
      const tagScore = (
        item.data.tags ?? []
      ).filter((t) =>
        tags.has(t.toLowerCase())
      ).length;

      const categoryScore = (
        item.data.categories ?? []
      ).filter((c) =>
        categories.has(c.toLowerCase())
      ).length;

      return {
        item,
        score:
          tagScore * 3 +
          categoryScore * 2,
      };
    })
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(
          b.item.data.date
        ).localeCompare(
          String(a.item.data.date)
        )
    )
    .slice(0, 3)
    .map((x) => x.item);

  if (!related.length) return null;

  return (
    <section className="related-section">
      <div className="command">
        $ grep -r "related" ~/blogs
      </div>

      <h2>Related</h2>

      <div className="related-grid">
        {related.map((item) => (
          <Link
            key={item.route}
            href={item.route}
            className="related-card"
          >
            <span>
              {displayDate(item.data.date)}
            </span>

            <strong>
              {item.data.title}
            </strong>

            <small>
              {item.data.summary ||
                item.data.description ||
                ""}
            </small>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function BlogArticle({
  post,
}: {
  post: ContentItem;
}) {
  const posts = getCollection("blogs");

  const index = posts.findIndex(
    (item) => item.route === post.route
  );

  const newer =
    index > 0
      ? posts[index - 1]
      : undefined;

  const older =
    index >= 0
      ? posts[index + 1]
      : undefined;

  const headings = extractHeadings(
    post.content
  );

  return (
    <article>
      <header className="article-header">
        <div className="eyebrow">
          ~/blogs/{post.slug}
        </div>

        <h1>{post.data.title}</h1>

        {post.data.summary && (
          <p>{post.data.summary}</p>
        )}

        <div className="article-author">
          By <strong>Sagar Panda</strong>
        </div>

        <div className="article-meta">
          <span>
            {displayDate(post.data.date)}
          </span>

          <span>·</span>

          <span>
            {readingTime(post.content)} min read
          </span>
        </div>

        <div className="article-tags">
          {(post.data.tags || []).map(
            (tag, i) => (
              <Link
                key={`${tag}-${i}`}
                href={`/tags/${encodeURIComponent(
                  tag
                )}/`}
                className="tag-link"
              >
                #{tag}
              </Link>
            )
          )}
        </div>
      </header>

      {post.data.cover && (
        <div className="article-cover">
          <img
            src={String(post.data.cover)}
            alt={post.data.title}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      <div className="article-content">
        <TableOfContents
          headings={headings}
        />

        <div className="article-body">
          <MarkdownContent
            source={post.content}
          />
        </div>
      </div>

      <div className="article-nav">
        {older ? (
          <Link
            href={older.route}
            className="article-nav-card"
          >
            <span>← previous</span>

            <strong>
              {older.data.title}
            </strong>
          </Link>
        ) : (
          <span />
        )}

        {newer ? (
          <Link
            href={newer.route}
            className="article-nav-card article-nav-next"
          >
            <span>next →</span>

            <strong>
              {newer.data.title}
            </strong>
          </Link>
        ) : (
          <span />
        )}
      </div>

      <RelatedPosts post={post} />

      <footer className="article-footer">
        <Link href="/blogs/">
          ← all posts
        </Link>
      </footer>
    </article>
  );
}