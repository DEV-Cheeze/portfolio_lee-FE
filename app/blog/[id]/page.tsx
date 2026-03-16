"use client";

import { use } from "react";
import { Navigation } from "@/components/navigation";
import { Background } from "@/components/background";
import { BlogPostDetail } from "@/components/blog/blog-post-detail";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <main className="min-h-screen relative">
      <Background />
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-16">
        <BlogPostDetail postId={id} />
      </div>
    </main>
  );
}
