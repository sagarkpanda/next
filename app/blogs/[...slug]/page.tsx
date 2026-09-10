import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection,getItem } from "@/lib/content";
import BlogArticle from "@/components/BlogArticle";
export const dynamicParams=false;
export function generateStaticParams(){return getCollection("blogs").map(p=>({slug:p.slug.split("/")}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{const {slug}=await params;const post=getItem("blogs",slug);if(!post)return {};return {title:`${post.data.title} | Sagar Panda`,description:String(post.data.summary||post.data.description||"")};}
export default async function BlogPage({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const post=getItem("blogs",slug);if(!post)notFound();return <main className="shell article-shell"><BlogArticle post={post}/></main>}
