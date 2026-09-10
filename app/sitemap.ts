import type { MetadataRoute } from "next";
import { getCollection } from "@/lib/content";
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";const pages=["/","/blogs/",...getCollection("blogs").map(p=>p.route),...getCollection("projects").map(p=>p.route)];return pages.map(url=>({url:new URL(url,base).toString(),lastModified:new Date()}));}
