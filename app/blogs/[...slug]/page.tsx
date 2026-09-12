import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getItem } from "@/lib/content";
import BlogArticle from "@/components/BlogArticle";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCollection("blogs").map((p) => ({
    slug: p.slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = getItem("blogs", slug);

  if (!post) {
    return {};
  }

  const postTitle = String(post.data.title);

  const description = String(
    post.data.summary ||
      post.data.description ||
      ""
  );

  const cover = post.data.cover
    ? String(post.data.cover)
    : "/images/og-image.png";

  const postUrl =
    `https://next.sagarpanda.com/blogs/${post.slug}/`;

  return {
    title: {
      absolute: postTitle,
    },

    description,

    openGraph: {
      title: postTitle,
      description,
      type: "article",
      url: postUrl,
      images: [
        {
          url: cover,
          alt: postTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description,
      images: [cover],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const post = getItem("blogs", slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="shell article-shell">
      <BlogArticle post={post} />
    </main>
  );
}