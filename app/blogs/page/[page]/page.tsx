import { notFound } from "next/navigation";
import { getCollection } from "@/lib/content";
import PostCard from "@/components/PostCard";
import Link from "next/link";

const PAGE_SIZE = 6;
export const dynamicParams = false;

export function generateStaticParams() {
  const totalPages = Math.max(1, Math.ceil(getCollection("blogs").length / PAGE_SIZE));
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export default async function PaginatedBlogs({ params }: { params: Promise<{ page: string }> }) {
  const { page: raw } = await params;
  const page = Number(raw);
  const posts = getCollection("blogs");
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();
  const current = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <main className="shell page-shell"><section className="section"><div className="command">$ cd /blogs/page/{page} && ls -lt</div><h1>Writing</h1><p className="section-lead">Technical notes and hands-on guides covering DevOps, AWS, Kubernetes, Terraform, CI/CD, observability, and security.</p><div className="post-list">{current.map(p => <PostCard key={p.route} post={p}/>)}</div><nav className="pagination" aria-label="Blog pagination">{page > 1 ? <Link href={page === 2 ? "/blogs/" : `/blogs/page/${page-1}/`}>← newer</Link> : <span className="disabled">← newer</span>}<span>page {page} of {totalPages}</span>{page < totalPages ? <Link href={`/blogs/page/${page+1}/`}>older →</Link> : <span className="disabled">older →</span>}</nav><Link className="text-link" href="/blogs/">← all posts</Link></section></main>;
}
