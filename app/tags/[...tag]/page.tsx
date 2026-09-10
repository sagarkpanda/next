import { getAllTags, getPostsByTag } from "@/lib/content";
import PostCard from "@/components/PostCard";
export const dynamicParams = false;
export function generateStaticParams() { return getAllTags().map(([, display]) => ({ tag: [display] })); }
export default async function TagPage({ params }: { params: Promise<{ tag: string[] }> }) {
  const { tag } = await params;
  const name = decodeURIComponent(tag.join("/"));
  const posts = getPostsByTag(name);
  return <main className="shell"><section className="section"><div className="command">$ grep -r "#{name}" ~/blogs</div><h1>#{name}</h1><div className="post-list">{posts.map(p=><PostCard key={p.route} post={p}/>)}</div></section></main>;
}
