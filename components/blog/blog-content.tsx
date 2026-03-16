"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, PenSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { BlogPostCard } from "./blog-post-card";
import { TagList } from "./tag-list";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { fetchArticles, fetchTags, likeArticle, unlikeArticle } from "@/lib/api";
import { hasThumbnail } from "@/lib/image-fallbacks";

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

export function BlogContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [sidebarTags, setSidebarTags] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // API State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const { user, isLoggedIn, isAuthLoading, openLoginModal } = useAuth();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async (pageToFetch: number, keyword: string, tags: string[]) => {
    if (isError) return;

    try {
      setIsLoading(true);
      const json = await fetchArticles(pageToFetch, 10, {
        keyword,
        tags,
      });

      if (json.code !== 200) {
        throw new Error(json.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      }

      const incomingPosts = Array.isArray(json?.data?.content) ? json.data.content : [];
      const newPosts = incomingPosts.map((article: any) => {
        const authorNickname =
          article.writerName ??
          article.writerNickname ??
          article.writer ??
          article.authorName ??
          article.authorNickname ??
          article.nickname ??
          null;

        const authorProfileImage =
          article.writerProfileImageUrl ??
          article.writerProfileUrl ??
          article.profileImageUrl ??
          article.authorProfileImageUrl ??
          article.authorProfileUrl ??
          article.profileImage ??
          null;

        return {
          id: String(article.articleId),
          title: article.title,
          excerpt: article.content,
          thumbnail: hasThumbnail(article.thumbnailImageUrl) ? article.thumbnailImageUrl : null,
          date: article.createdAt,
          likes: article.likeCount,
          views: article.viewCount,
          comments: article.commentCount,
          tags: article.tags || [],
          author: authorNickname
            ? {
                nickname: authorNickname,
                profileImage: authorProfileImage || null,
              }
            : undefined,
        };
      });

      setLikedPosts((prevLiked) => {
        const newLikedPosts = new Set(prevLiked);
        incomingPosts.forEach((article: any) => {
          const articleId = String(article.articleId);
          if (article.isLiked) {
            newLikedPosts.add(articleId);
          } else {
            newLikedPosts.delete(articleId);
          }
        });
        return newLikedPosts;
      });

      setLikeCounts((prev) => {
        const next = { ...prev };
        incomingPosts.forEach((article: any) => {
          next[String(article.articleId)] = article.likeCount ?? 0;
        });
        return next;
      });

      setPosts((prev) => (pageToFetch === 0 ? newPosts : [...prev, ...newPosts]));
      setHasNext(Boolean(json?.data?.hasNext));
      setPage(json?.data?.page ?? pageToFetch);
    } catch (error) {
      setIsError(true);
      setHasNext(false);

      toast({
        variant: "destructive",
        title: "불러오기 실패",
        description: error instanceof Error ? error.message : "게시물을 불러오는 중 오류가 발생했습니다.",
        customDuration: 5000,
        className: "custom-toast-animation"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalizedQuery = searchQuery.trim();
      setDebouncedSearchQuery(normalizedQuery);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsError(false);
    setHasNext(true);
    setPage(0);
    fetchPosts(0, debouncedSearchQuery, selectedTags);
  }, [debouncedSearchQuery, selectedTags]);

  useEffect(() => {
    let isMounted = true;

    const fetchSidebarTags = async () => {
      try {
        const tags = await fetchTags();
        if (!isMounted) {
          return;
        }
        setSidebarTags(tags.map((tag) => tag.tagName));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        toast({
          variant: "destructive",
          title: "태그 불러오기 실패",
          description: error instanceof Error ? error.message : "태그를 불러오는 중 오류가 발생했습니다.",
          customDuration: 5000,
          className: "custom-toast-animation",
        });
      }
    };

    fetchSidebarTags();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoading && !isError) {
          fetchPosts(page + 1, debouncedSearchQuery, selectedTags);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasNext, isLoading, page, isError, debouncedSearchQuery, selectedTags]);


  const handleWriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const userRoles = user?.roles ?? [];
    const isAdmin = userRoles.includes("ROLE_ADMIN") || userRoles.includes("ADMIN");

    if (isAuthLoading) {
      e.preventDefault();
      return;
    }

    if (!isLoggedIn) {
      e.preventDefault();
      openLoginModal();
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "글 작성은 관리자 로그인 후 이용할 수 있습니다.",
        customDuration: 4000,
        className: "custom-toast-animation",
      });
      return;
    }

    if (!isAdmin) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "권한이 없습니다",
        description: "글 작성은 관리자만 가능합니다.",
        customDuration: 4000,
        className: "custom-toast-animation",
      });
    }
  };

  const allTags = useMemo(() => {
    if (sidebarTags.length > 0) {
      return sidebarTags;
    }

    const tags = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).slice(0, 10);
  }, [posts, sidebarTags]);

  const filteredPosts = useMemo(() => posts, [posts]);

  const handleLike = async (postId: string) => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다.",
        description: "좋아요는 로그인 후 이용할 수 있습니다.",
      });
      openLoginModal();
      return;
    }

    if (pendingLikeIds.has(postId)) {
      return;
    }

    const wasLiked = likedPosts.has(postId);

    setPendingLikeIds((prev) => new Set(prev).add(postId));
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? 0) + (wasLiked ? -1 : 1)),
    }));

    try {
      if (wasLiked) {
        await unlikeArticle(postId);
      } else {
        await likeArticle(postId);
      }
    } catch (error) {
      setLikedPosts((prev) => {
        const restored = new Set(prev);
        if (wasLiked) {
          restored.add(postId);
        } else {
          restored.delete(postId);
        }
        return restored;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] ?? 0) + (wasLiked ? 1 : -1)),
      }));

      toast({
        variant: "destructive",
        title: wasLiked ? "좋아요 취소 실패" : "좋아요 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleTagClick = (tag: string) => {
    if (tag === "") {
      setSelectedTags([]);
      return;
    }

    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  return (
    <div
      className={`transition-all duration-700 delay-100 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-8 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                data-testid="input-blog-search"
                type="text"
                placeholder="게시글 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-glass backdrop-blur-xl border border-glass-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all shadow-sm"
              />
            </div>
            <Link data-testid="link-blog-write" href="/blog/write">
              <button
                data-testid="button-blog-write"
                type="button"
                onClick={handleWriteClick}
                className="flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shrink-0 shadow-sm"
              >
                <PenSquare className="w-4 h-4" />
                <span className="hidden sm:inline">글 작성</span>
              </button>
            </Link>
          </div>

          <div className="space-y-4" data-testid="list-blog-posts">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className={`transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${150 + (index % 10) * 100}ms` }}
                  data-testid={`row-blog-post-${post.id}`}
                >
                  <BlogPostCard
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    currentLikes={likeCounts[post.id] ?? post.likes}
                    isLikePending={pendingLikeIds.has(post.id)}
                    onLike={() => handleLike(post.id)}
                  />
                </div>
              ))
            ) : !isLoading ? (
              <div
                className="text-center py-16 text-muted-foreground text-sm bg-glass backdrop-blur-xl border border-glass-border rounded-xl shadow-sm"
                data-testid="text-blog-empty"
              >
                검색 결과가 없습니다.
              </div>
            ) : null}

            {hasNext && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isLoading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:w-64 shrink-0">
          <TagList
            tags={allTags}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </aside>
      </div>
    </div>
  );
}
