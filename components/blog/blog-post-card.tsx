"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Eye, Calendar, FileText } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface Author {
  nickname: string;
  profileImage: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  date: string;
  likes: number;
  views: number;
  comments: number;
  tags: string[];
  author?: Author;
}

interface BlogPostCardProps {
  post: BlogPost;
  isLiked: boolean;
  currentLikes: number;
  onLike: () => void;
  isLikePending?: boolean;
}

export function BlogPostCard({ post, isLiked, currentLikes, onLike, isLikePending = false }: BlogPostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    if (!isLiked) return;
    setIsBursting(true);
    const timer = window.setTimeout(() => setIsBursting(false), 700);
    return () => window.clearTimeout(timer);
  }, [isLiked]);

  return (
    <article
      className="group bg-card rounded-xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
      data-testid={`card-blog-post-${post.id}`}
    >
      <Link href={`/blog/${post.id}`} className="flex flex-col sm:flex-row" data-testid={`link-blog-post-${post.id}`}>
        {post.thumbnail ? (
          <div className="relative w-full h-48 sm:w-48 sm:h-48 sm:flex-none overflow-hidden bg-muted/30">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="block w-full h-full min-w-0 min-h-0 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              data-testid={`img-blog-post-thumbnail-${post.id}`}
            />
          </div>
        ) : (
          <div 
            className="relative w-full h-48 sm:w-48 sm:h-48 sm:flex-none overflow-hidden bg-muted/50 dark:bg-muted/30 flex items-center justify-center"
            data-testid={`placeholder-blog-post-thumbnail-${post.id}`}
          >
            <div className="flex flex-col items-center gap-3 text-muted-foreground/60">
              <FileText className="w-10 h-10" strokeWidth={1.5} />
              {post.tags.length > 0 && (
                <span className="text-xs font-medium px-2 py-1 bg-background/50 dark:bg-background/30 rounded-md">
                  {post.tags[0]}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 p-6 flex flex-col min-w-0">
          <h3
            className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors"
            data-testid={`text-blog-post-title-${post.id}`}
          >
            {post.title}
          </h3>

          <p
            className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed"
            data-testid={`text-blog-post-excerpt-${post.id}`}
          >
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mb-4" data-testid={`list-blog-post-tags-${post.id}`}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-primary/8 text-primary rounded-md font-medium"
                data-testid={`badge-blog-post-tag-${post.id}-${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            className="flex items-center gap-4 text-xs text-muted-foreground mt-auto"
            data-testid={`row-blog-post-meta-${post.id}`}
          >
            <div className="flex items-center gap-2" data-testid={`author-blog-post-${post.id}`}>
              <ProfileAvatar
                src={post.author?.profileImage || undefined}
                alt={post.author?.nickname || "작성자"}
                sizeClassName="w-5 h-5"
              />
              <span className="font-medium text-foreground/80">{post.author?.nickname || "익명"}</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid={`text-blog-post-date-${post.id}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            <button
              data-testid={`button-blog-post-like-${post.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLikePending) return;
                onLike();
              }}
              disabled={isLikePending}
              className={`relative flex items-center gap-1.5 transition-all duration-300 ${
                isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              } ${isLikePending ? "opacity-70 cursor-not-allowed" : ""}`}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              aria-pressed={isLiked}
            >
              <span className={`like-heart-shell ${isBursting ? "is-bursting" : ""}`}>
                <Heart
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    isLiked ? "fill-current scale-110" : ""
                  }`}
                />
                <span className="like-heart-ring" aria-hidden="true" />
                <span className="like-heart-particles" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </span>
              <span data-testid={`text-blog-post-likecount-${post.id}`}>{currentLikes}</span>
            </button>

            <div className="flex items-center gap-1.5" data-testid={`text-blog-post-comments-${post.id}`}>
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments}</span>
            </div>

            <div className="flex items-center gap-1.5" data-testid={`text-blog-post-views-${post.id}`}>
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
