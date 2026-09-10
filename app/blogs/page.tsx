import Link from "next/link";
import { getCollection } from "@/lib/content";
import PostCard from "@/components/PostCard";

const PAGE_SIZE = 6;
export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getCollection("blogs");
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
}

export default function BlogsPage() {
  const posts = getCollection("blogs").slice(0, PAGE_SIZE);
  return <BlogIndex posts={posts} page={1} />;
}

export function BlogIndex({ posts, page }: { posts: ReturnType<typeof getCollection>; page: number }) {
  return (
    <main className="shell page-shell">
      <section className="section">
        <div className="command">$ cd /blogs && ls -lt</div>
        <h1>Writing</h1>
        <p className="section-lead">Technical notes and hands-on guides covering DevOps, AWS, Kubernetes, Terraform, CI/CD, observability, and security.</p>
        <div className="post-list">{posts.map((p) => <PostCard key={p.route} post={p} />)}</div>
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(getCollection("blogs").length / PAGE_SIZE))} />
        <Link className="text-link" href="/">← home</Link>
      </section>
    </main>
  );
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return <nav className="pagination" aria-label="Blog pagination">
    {page > 1 ? <Link href={page === 2 ? "/blogs/" : `/blogs/page/${page - 1}/`}>← newer</Link> : <span className="disabled">← newer</span>}
    <span>page {page} of {totalPages}</span>
    {page < totalPages ? <Link href={`/blogs/page/${page + 1}/`}>older →</Link> : <span className="disabled">older →</span>}
  </nav>;
}
