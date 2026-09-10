import { getCollection } from "@/lib/content";
import PostCard from "@/components/PostCard";
export const dynamicParams=false;
export function generateStaticParams(){const c=new Set(getCollection("blogs").flatMap(p=>p.data.categories||[]).map(x=>x.toLowerCase()));return [...c].map(category=>({category}));}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const {category}=await params;const posts=getCollection("blogs").filter(p=>(p.data.categories||[]).some(x=>x.toLowerCase()===category.toLowerCase()));return <main className="shell"><section className="section"><div className="command">$ grep -r "{category}" ~/blogs</div><h1>{category}</h1><div className="post-list">{posts.map(p=><PostCard key={p.route} post={p}/>)}</div></section></main>}
