"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Calendar,
  Eye,
  ArrowLeft,
  Send,
  Loader2,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  Reply as ReplyIcon,
  User,
  Lock,
  X,
  Info,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { MarkdownRenderer } from "./markdown-renderer";
import { TableOfContents } from "./table-of-contents";
import { fetchArticleDetail, fetchArticleComments, fetchCommentReplies, likeArticle, unlikeArticle, likeComment, unlikeComment, createArticleComment, createCommentReply, updateComment, deleteComment, deleteArticle } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { resolveProfileImage } from "@/lib/image-fallbacks";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

// --- Interfaces ---

interface Author {
  id: string;
  nickname: string;
  profileImage: string;
}

interface BlogPost {
  id: string;
  writerId?: string;
  title: string;
  content: string;
  thumbnail: string;
  date: string;
  likes: number;
  views: number;
  tags: string[];
  author: Author;
  totalComment?: number;
}

interface Reply {
  id: string;
  parentId: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  author: Author;
  isGuest?: boolean;
  guestPassword?: string;
  guestIp?: string;
  isActivated?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  author: Author;
  isGuest?: boolean;
  guestPassword?: string;
  guestIp?: string;
  replies: Reply[];
  totalReplies: number;
  isActivated?: boolean;
  repliesPage: number;
  hasMoreReplies: boolean;
}

interface BlogPostDetailProps {
  postId: string;
}

// --- Constants ---

const COMMENTS_PER_PAGE = 5;
const REPLIES_PER_PAGE = 5;

// --- Mock Data ---

const mockPostsData: Record<string, BlogPost> = {
  "1": {
    id: "1",
    title: "Next.js 15에서 달라진 점들",
    content: `Next.js 15가 출시되면서 많은 변화가 있었습니다. 이번 글에서는 주요 변경사항과 마이그레이션 가이드를 살펴보겠습니다.

## 주요 변경사항

Next.js 15에서는 다음과 같은 주요 변경사항이 있습니다:

- React 19 지원
- Turbopack 안정화
- 새로운 캐싱 API
- 개선된 에러 처리

## 마이그레이션 가이드

기존 프로젝트를 Next.js 15로 마이그레이션하려면 다음 단계를 따르세요:

1. \`package.json\`에서 next 버전을 15로 업데이트
2. 의존성 패키지 업데이트
3. deprecated된 API 교체
4. 테스트 실행 및 버그 수정

> 이번 업데이트는 성능과 개발자 경험 모두에서 큰 개선이 있습니다.

특히 **Turbopack의 안정화**로 개발 서버 시작 시간이 크게 단축되었습니다.

\`\`\`bash
npx @next/codemod@latest upgrade latest
\`\`\``,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2026-01-20",
    likes: 42,
    views: 1234,
    tags: ["Next.js", "React", "Frontend"],
    author: {
      id: "author1",
      nickname: "개발자킴",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
  "2": {
    id: "2",
    title: "TypeScript 5.5 새로운 기능 정리",
    content: `TypeScript 5.5에서 추가된 새로운 기능들을 정리해보았습니다.

## 타입 추론 개선

TypeScript 5.5에서는 타입 추론이 더욱 강력해졌습니다. 복잡한 제네릭 타입에서도 더 정확한 추론이 가능합니다.

\`\`\`typescript
// 이제 더 정확한 타입 추론이 가능합니다
const result = arr.filter((x): x is number => typeof x === "number");
\`\`\`

## 새로운 유틸리티 타입

새로운 유틸리티 타입들이 추가되어 타입 변환이 더욱 편리해졌습니다.

| 유틸리티 타입 | 설명 |
| --- | --- |
| \`NoInfer<T>\` | 타입 추론 방지 |
| \`Awaited<T>\` | Promise 해제 |`,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2026-01-15",
    likes: 38,
    views: 892,
    tags: ["TypeScript", "JavaScript", "Frontend"],
    author: {
      id: "author2",
      nickname: "타입마스터",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
  "3": {
    id: "3",
    title: "효율적인 상태 관리 패턴",
    content: `React 애플리케이션에서 상태를 효율적으로 관리하는 방법에 대해 알아봅니다.

## 상태 관리 라이브러리 비교

**Zustand**, *Jotai*, Redux 등 다양한 라이브러리의 장단점을 비교해봅니다.

- [x] Zustand - 간결하고 가벼운 상태 관리
- [x] Jotai - 원자적 상태 관리
- [ ] Redux - 대규모 앱에 적합

## 언제 어떤 패턴을 사용해야 할까?

프로젝트 규모와 복잡도에 따른 적절한 상태 관리 패턴 선택 가이드입니다.

> 작은 프로젝트에서는 **Context API**만으로도 충분할 수 있습니다.`,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2026-01-10",
    likes: 56,
    views: 2103,
    tags: ["React", "State Management", "Frontend"],
    author: {
      id: "author1",
      nickname: "개발자킴",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
  "4": {
    id: "4",
    title: "Docker로 개발 환경 구축하기",
    content: `Docker를 활용하여 일관된 개발 환경을 구축하는 방법을 설명합니다.

## Docker 기초

Docker의 기본 개념과 명령어를 알아봅니다.

\`\`\`bash
# 이미지 빌드
docker build -t my-app .

# 컨테이너 실행
docker run -p 3000:3000 my-app
\`\`\`

## Docker Compose 활용

멀티 컨테이너 환경을 Docker Compose로 관리하는 방법입니다.

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
\`\`\``,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2026-01-05",
    likes: 29,
    views: 756,
    tags: ["Docker", "DevOps", "Backend"],
    author: {
      id: "author3",
      nickname: "DevOps엔지니어",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
  "5": {
    id: "5",
    title: "PostgreSQL 성능 최적화 팁",
    content: `PostgreSQL 데이터베이스의 성능을 최적화하는 실용적인 팁들을 공유합니다.

## 인덱스 설계

효율적인 인덱스 설계 방법과 주의사항입니다.

\`\`\`sql
-- 복합 인덱스 생성
CREATE INDEX idx_users_email_active
ON users (email, is_active);
\`\`\`

## 쿼리 튜닝

느린 쿼리를 분석하고 최적화하는 방법을 알아봅니다.

1. \`EXPLAIN ANALYZE\`로 쿼리 실행 계획 분석
2. 불필요한 \`SELECT *\` 제거
3. 적절한 인덱스 활용

---

> **팁**: \`pg_stat_statements\` 확장을 사용하면 느린 쿼리를 쉽게 찾을 수 있습니다.`,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2025-12-28",
    likes: 67,
    views: 1567,
    tags: ["PostgreSQL", "Database", "Backend"],
    author: {
      id: "author4",
      nickname: "DB전문가",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
  "6": {
    id: "6",
    title: "Tailwind CSS v4 마이그레이션 가이드",
    content: `Tailwind CSS v4로 마이그레이션하면서 알게 된 주요 변경사항과 팁들을 정���했습니다.

## 주요 변경사항

Tailwind CSS v4에서 달라진 점들을 살펴봅니다.

- **CSS-first 설정** - \`tailwind.config.js\` 대신 CSS에서 직접 설정
- 새로운 엔진으로 *빌드 속도 대폭 향상*
- ~~기존 JIT 모드~~ 기본 내장

## 마이그레이션 팁

기존 프로젝트를 v4로 마이그레이션할 때 주의할 점들입니다.

\`\`\`css
/* v4에서는 CSS에서 직접 테마 설����� */
@theme {
  --color-primary: #3b82f6;
  --font-sans: 'Inter', sans-serif;
}
\`\`\``,
    thumbnail: "/placeholder.svg?height=400&width=800",
    date: "2025-12-20",
    likes: 45,
    views: 1890,
    tags: ["Tailwind CSS", "CSS", "Frontend"],
    author: {
      id: "author1",
      nickname: "개발자킴",
      profileImage: "/placeholder.svg?height=40&width=40",
    },
  },
};

// --- Comment API Mappers ---

const mapApiAuthor = (author: any, fallbackId: string): Author => ({
  id:
    author?.type === "USER" && author?.writerId != null
      ? String(author.writerId)
      : fallbackId,
  nickname: author?.displayName || "익명",
  profileImage: resolveProfileImage(author?.profileImageUrl),
});

const mapApiReply = (reply: any, commentId: string, postId: string): Reply => ({
  id: String(reply.commentId),
  parentId: commentId,
  postId,
  content: reply?.isActivated === false ? "삭제된 댓글입니다." : reply.content,
  createdAt: reply.createdAt,
  likes: reply.likeCount ?? 0,
  isLiked: Boolean(reply.isLiked ?? reply.liked),
  author: mapApiAuthor(reply.author, `guest-reply-${reply.commentId}`),
  isGuest: reply?.author?.type === "GUEST",
  guestIp: reply?.ipAddress || undefined,
  isActivated: reply?.isActivated,
});

const mapApiComment = (comment: any, postId: string): Comment => ({
  id: String(comment.commentId),
  postId,
  content: comment?.isActivated === false ? "삭제된 댓글입니다." : comment.content,
  createdAt: comment.createdAt,
  likes: comment.likeCount ?? 0,
  isLiked: Boolean(comment.isLiked ?? comment.liked),
  author: mapApiAuthor(comment.author, `guest-comment-${comment.commentId}`),
  isGuest: comment?.author?.type === "GUEST",
  guestIp: comment?.ipAddress || undefined,
  replies: [],
  totalReplies: comment.replyCount ?? 0,
  isActivated: comment?.isActivated,
  repliesPage: 0,
  hasMoreReplies: (comment.replyCount ?? 0) > 0,
});


const mapCreatedCommentAuthor = (
  item: any,
  fallbackId: string,
  currentUser?: { id?: string; nickname?: string; profileImage?: string } | null,
): Author => ({
  id: item?.writerId != null ? String(item.writerId) : currentUser?.id || fallbackId,
  nickname: item?.displayName || currentUser?.nickname || "익명",
  profileImage: resolveProfileImage(item?.profileImageUrl || currentUser?.profileImage),
});

const mapCreatedComment = (
  item: any,
  postId: string,
  parentId?: string | null,
  currentUser?: { id?: string; nickname?: string; profileImage?: string } | null,
): Comment | Reply => {
  const isGuest = item?.writerId == null && currentUser?.id == null;

  const base = {
    id: String(item?.commentId),
    postId,
    content: item?.content || "",
    createdAt: new Date().toISOString(),
    likes: 0,
    isLiked: false,
    author: mapCreatedCommentAuthor(item, `guest-comment-${item?.commentId ?? Date.now()}`, currentUser),
    isGuest,
    guestIp: item?.ipAddress || undefined,
    isActivated: true,
  };

  if (parentId != null) {
    return {
      ...base,
      parentId: String(parentId),
    } as Reply;
  }

  return {
    ...base,
    replies: [],
    totalReplies: 0,
    repliesPage: 0,
    hasMoreReplies: false,
  } as Comment;
};

// --- Helper Components ---

const isDeletedItem = (item: { isActivated?: boolean; content?: string }) =>
  item?.isActivated === false || item?.content === "삭제된 댓글입니다.";


function AuthorBadge() {
  return (
    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/15 text-primary rounded select-none">
      작성자
    </span>
  );
}

function GuestBadge({ ip }: { ip?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-muted-foreground/15 text-muted-foreground rounded select-none">
        비회원
      </span>
      {ip && (
        <span className="text-[10px] text-muted-foreground/70 tracking-tight">
          ({ip})
        </span>
      )}
    </div>
  );
}

// --- Main Component ---

export function BlogPostDetail({ postId }: BlogPostDetailProps) {
  const { user, isLoggedIn, isAuthLoading, openLoginModal } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isLikeBursting, setIsLikeBursting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [commentsPage, setCommentsPage] = useState(0);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isCommentLikeSubmitting, setIsCommentLikeSubmitting] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Guest comment states
  const [guestName, setGuestName] = useState("");
  const [guestPassword, setGuestPassword] = useState("");

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [guestReplyName, setGuestReplyName] = useState("");
  const [guestReplyPassword, setGuestReplyPassword] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, number>>({});

  // Delete password prompt
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [deletePromptType, setDeletePromptType] = useState<"comment" | "reply">("comment");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);

  // Initialize post data
  useEffect(() => {
    let isMounted = true;

    const initializePost = async () => {
      const fallbackPost = mockPostsData[postId] || mockPostsData["1"];

      try {
        const response = await fetchArticleDetail(postId);
        const article = response?.data;

        if (!isMounted || !article) {
          return;
        }

        const postData: BlogPost = {
          ...fallbackPost,
          id: String(article.id),
          writerId: article.writerId != null ? String(article.writerId) : undefined,
          title: article.title,
          content: article.content,
          views: article.viewCount,
          likes: article.likeCount,
          isLiked: Boolean(article.liked),
          date: article.createdDate || fallbackPost.date,
          tags: Array.isArray(article.tags) ? article.tags : fallbackPost.tags,
          totalComment: article.totalComment,
          author: {
            ...fallbackPost.author,
            nickname: article.writer || fallbackPost.author.nickname,
            profileImage:
              resolveProfileImage(article.writerProfileImageUrl),
          },
        };

        setPost(postData);
        setIsLiked(Boolean(article.liked));
        setLikesCount(article.likeCount);
        setTotalComments(typeof article.totalComment === "number" ? article.totalComment : 0);
      } catch (error) {
        console.error("Failed to initialize article detail:", error);
        toast({ variant: "destructive", title: "게시글을 불러오지 못했습니다.", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요." });

        if (!isMounted) {
          return;
        }

        setPost(fallbackPost);
        setIsLiked(false);
        setLikesCount(fallbackPost.likes);
      }

      try {
        const commentsResponse = await fetchArticleComments(
          postId,
          0,
          COMMENTS_PER_PAGE
        );
        const commentsData = commentsResponse?.data;
        const mappedComments = Array.isArray(commentsData?.content)
          ? commentsData.content.map((comment: any) => mapApiComment(comment, postId))
          : [];
        const initialLikedComments = new Set<string>();
        mappedComments.forEach((comment: Comment) => {
          if (comment.isLiked) initialLikedComments.add(comment.id);
          comment.replies.forEach((reply) => { if (reply.isLiked) initialLikedComments.add(reply.id); });
        });

        if (!isMounted) {
          return;
        }

        setComments(mappedComments);
        setDisplayedComments(mappedComments);
        setLikedComments(initialLikedComments);
        setTotalComments((prev) =>
          prev > 0 ? prev : mappedComments.length
        );
        setHasMore(Boolean(commentsData?.hasNext));
        setCommentsPage(0);
      } catch (error) {
        console.error("Failed to initialize article comments:", error);
        toast({ variant: "destructive", title: "댓글을 불러오지 못했습니다.", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요." });

        if (!isMounted) {
          return;
        }

        setComments([]);
        setDisplayedComments([]);
        setTotalComments(0);
        setHasMore(false);
        setCommentsPage(0);
      }
    };

    initializePost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  // Infinite scroll for comments
  const loadMoreComments = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = commentsPage + 1;
      const response = await fetchArticleComments(postId, nextPage, COMMENTS_PER_PAGE);
      const commentsData = response?.data;
      const nextComments = Array.isArray(commentsData?.content)
        ? commentsData.content.map((comment: any) => mapApiComment(comment, postId))
        : [];

      if (nextComments.length > 0) {
        setComments((prev) => [...prev, ...nextComments]);
        setDisplayedComments((prev) => [...prev, ...nextComments]);
        setCommentsPage(nextPage);
      }

      setHasMore(Boolean(commentsData?.hasNext));
    } catch (error) {
      console.error("Failed to load more comments:", error);
      toast({ variant: "destructive", title: "댓글을 더 불러오지 못했습니다.", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요." });
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [commentsPage, hasMore, isLoadingMore, postId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreComments]);

  // --- Handlers ---

  const handleLikePost = async () => {
    if (isAuthLoading || isLikeSubmitting) {
      return;
    }

    if (!isLoggedIn) {
      toast({ variant: "destructive", title: "로그인이 필요합니다.", description: "로그인 후 이용해주세요." });
      openLoginModal();
      return;
    }

    const nextLiked = !isLiked;

    setIsLikeSubmitting(true);
    setIsLiked(nextLiked);
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    if (nextLiked) {
      setIsLikeBursting(true);
      window.setTimeout(() => setIsLikeBursting(false), 700);
    }

    try {
      if (nextLiked) {
        await likeArticle(postId);
      } else {
        await unlikeArticle(postId);
      }
    } catch (error) {
      setIsLiked(!nextLiked);
      setLikesCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
      setIsLikeBursting(false);
      toast({
        variant: "destructive",
        title: nextLiked ? "좋아요 실패" : "좋아요 취소 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  const updateCommentLikeState = useCallback((commentId: string, shouldLike: boolean) => {
    const applyLikeState = <T extends Comment | Reply>(item: T): T => ({
      ...item,
      isLiked: shouldLike,
      likes: Math.max(0, (item.likes ?? 0) + (shouldLike ? 1 : -1)),
    });

    const updateItems = (items: Comment[]) =>
      items.map((comment) => {
        if (comment.id === commentId) {
          return applyLikeState(comment) as Comment;
        }

        if (comment.replies.some((reply) => reply.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId ? (applyLikeState(reply) as Reply) : reply
            ),
          };
        }

        return comment;
      });

    setComments((prev) => updateItems(prev));
    setDisplayedComments((prev) => updateItems(prev));
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (shouldLike) next.add(commentId);
      else next.delete(commentId);
      return next;
    });
  }, []);

  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) {
      toast({ variant: "destructive", title: "로그인이 필요합니다.", description: "로그인 후 이용해주세요." });
      return;
    }

    if (isCommentLikeSubmitting.has(commentId)) {
      return;
    }

    const shouldLike = !likedComments.has(commentId);

    setIsCommentLikeSubmitting((prev) => new Set(prev).add(commentId));
    updateCommentLikeState(commentId, shouldLike);

    try {
      if (shouldLike) {
        await likeComment(commentId);
      } else {
        await unlikeComment(commentId);
      }
    } catch (error) {
      updateCommentLikeState(commentId, !shouldLike);
      toast({
        variant: "destructive",
        title: shouldLike ? "댓글 좋아요 실패" : "댓글 좋아요 취소 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsCommentLikeSubmitting((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  // Submit comment (logged-in or guest)
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const isGuestSubmit = !isLoggedIn;

    if (isGuestSubmit) {
      if (!guestName.trim()) {
        toast({ variant: "destructive", title: "입력값을 확인해주세요.", description: "닉네임을 입력해주세요." });
        return;
      }
      if (guestPassword.length < 4) {
        toast({ variant: "destructive", title: "입력값을 확인해주세요.", description: "비밀번호는 4자 이상이어야 합니다." });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const created = await createArticleComment(postId, isGuestSubmit
        ? {
            content: commentText.trim(),
            guestname: guestName.trim(),
            password: guestPassword,
          }
        : {
            content: commentText.trim(),
          });

      const newComment = mapCreatedComment(created, postId, undefined, user) as Comment;

      setComments((prev) => [newComment, ...prev]);
      setDisplayedComments((prev) => [newComment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setCommentText("");
      if (isGuestSubmit) {
        setGuestName("");
        setGuestPassword("");
      }
      toast({
        title: "댓글이 등록되었습니다.",
        description: isGuestSubmit ? "비회원 댓글이 등록되었습니다." : "댓글이 등록되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "댓글 등록 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply (logged-in or guest)
  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    const isGuestSubmit = !isLoggedIn;

    if (isGuestSubmit) {
      if (!guestReplyName.trim()) {
        toast({ variant: "destructive", title: "입력값을 확인해주세요.", description: "닉네임을 입력해주세요." });
        return;
      }
      if (guestReplyPassword.length < 4) {
        toast({ variant: "destructive", title: "입력값을 확인해주세요.", description: "비밀번호는 4자 이상이어야 합니다." });
        return;
      }
    }

    setIsSubmittingReply(true);

    try {
      const created = await createCommentReply(
        postId,
        commentId,
        isGuestSubmit
          ? {
              content: replyText.trim(),
              guestname: guestReplyName.trim(),
              password: guestReplyPassword,
            }
          : {
              content: replyText.trim(),
            },
      );

      const newReply = mapCreatedComment(created, postId, commentId, user) as Reply;

      const updateReplies = (commentList: Comment[]) =>
        commentList.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: [...c.replies, newReply],
                totalReplies: c.totalReplies + 1,
                hasMoreReplies: false,
              }
            : c
        );

      setComments((prev) => updateReplies(prev));
      setDisplayedComments((prev) => updateReplies(prev));
      setExpandedReplies((prev) => {
        const comment = comments.find((c) => c.id === commentId);
        const newTotal = (comment?.replies.length ?? 0) + 1;
        return { ...prev, [commentId]: newTotal };
      });
      setTotalComments((prev) => prev + 1);
      setReplyText("");
      setGuestReplyName("");
      setGuestReplyPassword("");
      setReplyingTo(null);
      toast({
        title: "답글이 등록되었습니다.",
        description: isGuestSubmit ? "비회원 답글이 등록되었습니다." : "답글이 등록되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "답글 등록 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setOpenMenuId(null);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim() || isUpdatingComment) {
      return;
    }

    setIsUpdatingComment(true);
    try {
      const updated = await updateComment(commentId, { content: editingContent.trim() });
      const nextContent = updated?.content || editingContent.trim();

      const updateCommentList = (commentList: Comment[]) =>
        commentList.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content: nextContent,
              }
            : comment
        );

      setComments((prev) => updateCommentList(prev));
      setDisplayedComments((prev) => updateCommentList(prev));
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "댓글 수정 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // Delete comment or reply
  const markCommentAsDeleted = (commentId: string) => {
    const updateCommentList = (commentList: Comment[]) =>
      commentList.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content: "삭제된 댓글입니다.",
              isActivated: false,
            }
          : comment
      );

    setComments((prev) => updateCommentList(prev));
    setDisplayedComments((prev) => updateCommentList(prev));
    setOpenMenuId(null);
  };

  const markReplyAsDeleted = (commentId: string, replyId: string) => {
    const updateReplies = (commentList: Comment[]) =>
      commentList.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      content: "삭제된 댓글입니다.",
                      isActivated: false,
                    }
                  : reply
              ),
            }
          : comment
      );

    setComments((prev) => updateReplies(prev));
    setDisplayedComments((prev) => updateReplies(prev));
    setOpenMenuId(null);
  };

  const handleDeleteComment = async (commentId: string, password?: string) => {
    try {
      await deleteComment(commentId, password ? { password } : undefined);
      markCommentAsDeleted(commentId);
      toast({ title: "댓글이 삭제되었습니다.", description: "삭제가 완료되었습니다." });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "댓글 삭제 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
      return false;
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string, password?: string) => {
    try {
      await deleteComment(replyId, password ? { password } : undefined);
      markReplyAsDeleted(commentId, replyId);
      toast({ title: "답글이 삭제되었습니다.", description: "삭제가 완료되었습니다." });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "답글 삭제 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
      return false;
    }
  };

  // Guest delete with password
  const handleGuestDeletePrompt = (
    id: string,
    type: "comment" | "reply"
  ) => {
    setDeletePromptId(id);
    setDeletePromptType(type);
    setDeletePassword("");
    setDeleteError("");
    setOpenMenuId(null);
  };

  const handleConfirmGuestDelete = async () => {
    if (!deletePromptId) return;

    if (!deletePassword.trim()) {
      setDeleteError("비밀번호를 입력해주세요.");
      toast({ variant: "destructive", title: "삭제에 실패했습니다.", description: "비밀번호를 입력해주세요." });
      return;
    }

    if (deletePromptType === "comment") {
      const success = await handleDeleteComment(deletePromptId, deletePassword);
      if (success) {
        setDeletePromptId(null);
        setDeletePassword("");
        setDeleteError("");
      }
    } else {
      const parentComment = comments.find((comment) =>
        comment.replies.some((reply) => reply.id === deletePromptId)
      );

      if (!parentComment) {
        setDeleteError("답글을 찾을 수 없습니다.");
        toast({ variant: "destructive", title: "삭제에 실패했습니다.", description: "답글을 찾을 수 없습니다." });
        return;
      }

      const success = await handleDeleteReply(parentComment.id, deletePromptId, deletePassword);
      if (success) {
        setDeletePromptId(null);
        setDeletePassword("");
        setDeleteError("");
      }
    }
  };

  const handleOpenReplies = async (commentId: string) => {
    const targetComment = comments.find((comment) => comment.id === commentId);

    if (!targetComment) {
      return;
    }

    if (expandedReplies[commentId] !== undefined) {
      return;
    }

    if (targetComment.totalReplies === 0) {
      setExpandedReplies((prev) => ({ ...prev, [commentId]: 0 }));
      return;
    }

    try {
      const response = await fetchCommentReplies(commentId, 0, REPLIES_PER_PAGE);
      const repliesData = response?.data;
      const fetchedReplies = Array.isArray(repliesData?.content)
        ? repliesData.content.map((reply: any) => mapApiReply(reply, commentId, postId))
        : [];
      setLikedComments((prev) => {
        const next = new Set(prev);
        fetchedReplies.forEach((reply: Reply) => {
          if (reply.isLiked) next.add(reply.id);
        });
        return next;
      });

      const updateReplies = (commentList: Comment[]) =>
        commentList.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: fetchedReplies,
                repliesPage: 0,
                hasMoreReplies: Boolean(repliesData?.hasNext),
              }
            : comment
        );

      setComments((prev) => updateReplies(prev));
      setDisplayedComments((prev) => updateReplies(prev));
      setExpandedReplies((prev) => ({ ...prev, [commentId]: fetchedReplies.length }));
    } catch (error) {
      console.error("Failed to open replies:", error);
      toast({ variant: "destructive", title: "답글을 불러오지 못했습니다.", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요." });
      setExpandedReplies((prev) => ({ ...prev, [commentId]: 0 }));
    }
  };


  const handleCloseReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });

    if (replyingTo === commentId) {
      setReplyingTo(null);
    }

    setReplyText("");
    setGuestReplyName("");
    setGuestReplyPassword("");
  };

  const handleLoadMoreReplies = async (commentId: string) => {
    const targetComment = comments.find((comment) => comment.id === commentId);

    if (!targetComment || !targetComment.hasMoreReplies) {
      return;
    }

    try {
      const nextPage = targetComment.repliesPage + 1;
      const response = await fetchCommentReplies(commentId, nextPage, REPLIES_PER_PAGE);
      const repliesData = response?.data;
      const nextReplies = Array.isArray(repliesData?.content)
        ? repliesData.content.map((reply: any) => mapApiReply(reply, commentId, postId))
        : [];
      setLikedComments((prev) => {
        const next = new Set(prev);
        nextReplies.forEach((reply: Reply) => {
          if (reply.isLiked) next.add(reply.id);
        });
        return next;
      });

      const updateReplies = (commentList: Comment[]) =>
        commentList.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, ...nextReplies],
                repliesPage: nextPage,
                hasMoreReplies: Boolean(repliesData?.hasNext),
              }
            : comment
        );

      setComments((prev) => updateReplies(prev));
      setDisplayedComments((prev) => updateReplies(prev));
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + nextReplies.length,
      }));
    } catch (error) {
      console.error("Failed to load more replies:", error);
      toast({ variant: "destructive", title: "답글을 더 불러오지 못했습니다.", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요." });
    }
  };

  // --- Formatters ---

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return formatDate(dateString);
  };

  // --- Render helpers ---

  const renderGuestInputs = (
    name: string,
    setName: (v: string) => void,
    password: string,
    setPassword: (v: string) => void
  ) => (
    <div className="flex gap-2 mb-2">
      <div className="relative flex-1">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
          className="w-full pl-9 pr-3 py-2 bg-muted border border-glass-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div className="relative flex-1">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (4자 이상)"
          className="w-full pl-9 pr-3 py-2 bg-muted border border-glass-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
    </div>
  );

  const canDeleteComment = (comment: Comment | Reply) => {
    if (comment.isGuest) return true;
    if (isLoggedIn && user?.id === comment.author.id) return true;
    return false;
  };

  const canEditComment = (comment: Comment | Reply) => {
    if (comment.isGuest) return false;
    if ("parentId" in comment) return false;
    return isLoggedIn && user?.id === comment.author.id;
  };

  const handleDeleteArticle = async () => {
    if (isDeletingArticle) return;

    setIsDeletingArticle(true);

    try {
      await deleteArticle(postId);
      toast({ title: "게시글이 삭제되었습니다." });
      router.push("/blog");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "게시글 삭제 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsDeletingArticle(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderActionMenu = (
    item: Comment | Reply,
    type: "comment" | "reply"
  ) => {
    if (!canDeleteComment(item) && !canEditComment(item)) return null;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenMenuId(openMenuId === item.id ? null : item.id)
          }
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {openMenuId === item.id && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenMenuId(null)}
            />
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-glass-border rounded-lg shadow-lg py-1 z-50">
              {canEditComment(item) && type === "comment" && (
                <button
                  type="button"
                  onClick={() => {
                    handleStartEditComment(item as Comment);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  수정
                </button>
              )}
              {canDeleteComment(item) && (
                <button
                  type="button"
                  onClick={() => {
                    if (item.isGuest) {
                      handleGuestDeletePrompt(item.id, type);
                    } else if (type === "comment") {
                      handleDeleteComment(item.id);
                    } else {
                      const parentComment = comments.find((c) =>
                        c.replies.some((r) => r.id === item.id)
                      );
                      if (parentComment) {
                        handleDeleteReply(parentComment.id, item.id);
                      }
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // --- Loading state ---

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRoles = user?.roles ?? [];
  const isAdmin = userRoles.includes("ROLE_ADMIN") || userRoles.includes("ADMIN");
  const isOwnArticle = isLoggedIn && Boolean(
    (post.writerId && user?.id && post.writerId === user.id) ||
    (post.author.id && user?.id && post.author.id === user.id) ||
    (!post.writerId && post.author.nickname && user?.nickname && post.author.nickname === user.nickname)
  );

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button & Edit/Delete Buttons */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로</span>
        </Link>
        {isLoggedIn && (isOwnArticle || isAdmin) && (
          <div className="flex items-center gap-2">
            <Link
              href={`/blog/${postId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>수정</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>삭제</span>
            </button>
          </div>
        )}
      </div>

      {/* Post Header */}
      <header className="mb-8 pb-8 border-b border-border">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs font-medium text-primary/80 bg-primary/10 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image
              src={resolveProfileImage(post.author.profileImage)}
              alt={post.author.nickname}
              width={28}
              height={28}
              className="size-7 rounded-full object-cover border border-border/60 bg-card"
            />
            <span className="font-medium text-foreground">
              {post.author.nickname}
            </span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose-section mb-8">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Table of Contents - Fixed Sidebar */}
      <aside className="hidden xl:block fixed right-8 top-32 z-30 w-56 max-h-[calc(100vh-160px)] overflow-y-auto toc-scrollbar pointer-events-auto">
        <TableOfContents content={post.content} />
      </aside>

      {/* Like Button */}
      <div className="flex justify-center py-8 border-y border-border mb-8">
        <button
          type="button"
          onClick={handleLikePost}
          disabled={isLikeSubmitting}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
            isLiked
              ? "text-red-500"
              : "text-muted-foreground hover:text-red-500"
          } ${isLikeSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
          aria-pressed={isLiked}
        >
          <span className={`like-heart-shell ${isLikeBursting ? "is-bursting" : ""}`}>
            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
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
          <span className="font-medium">{likesCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      <section>
        {/* Comments Header */}
        <h2 className="text-lg font-semibold text-foreground mb-6">
          댓글 {totalComments > 0 && <span className="text-muted-foreground font-normal">({totalComments})</span>}
        </h2>

        {/* Comment Input - Logged in */}
        {isLoggedIn ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <ProfileAvatar
                src={resolveProfileImage(user?.profileImage)}
                alt={user?.nickname || "프로필"}
                sizeClassName="size-10"
              />
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 작성하세요..."
                  className="w-full min-h-[100px] p-4 pr-12 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="absolute right-3 bottom-3 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Comment Input - Guest */
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                비회원으로 댓글을 작성합니다. 삭제 시 비밀번호가 필요합니다.
              </p>
              {renderGuestInputs(
                guestName,
                setGuestName,
                guestPassword,
                setGuestPassword
              )}
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 작성하세요..."
                  className="w-full min-h-[80px] p-4 pr-12 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={
                    !commentText.trim() ||
                    !guestName.trim() ||
                    guestPassword.length < 4 ||
                    isSubmitting
                  }
                  className="absolute right-3 bottom-3 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {displayedComments.map((comment) => {
            const visibleReplyCount = expandedReplies[comment.id] || 0;
            const visibleReplies = comment.replies.slice(0, visibleReplyCount);
            const hasMoreReplies = comment.hasMoreReplies;
            const remainingReplies = Math.max(
              comment.totalReplies - comment.replies.length,
              0
            );

            return (
              <div key={comment.id}>
                {/* Comment */}
                <div className="py-4 border-b border-border last:border-b-0">
                  <div className="flex items-start gap-3">
                    <ProfileAvatar
                      src={resolveProfileImage(comment.author.profileImage)}
                      alt={comment.author.nickname}
                      sizeClassName="size-9"
                    />

                    <div className="flex-1 min-w-0">
                      {/* Author Info & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {comment.author.nickname}
                          </span>
                          {comment.author.id === post.author.id && (
                            <AuthorBadge />
                          )}
                          {comment.isGuest && <GuestBadge ip={comment.guestIp} />}
                          <span className="text-xs text-muted-foreground">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        {renderActionMenu(comment, "comment")}
                      </div>

                      {/* Comment Content */}
                      {isDeletedItem(comment) ? (
                        <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-200/60 bg-sky-50/80 px-3 py-2 text-sm text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                          <Info className="mt-0.5 h-4 w-4 shrink-0" />
                          <p className="leading-relaxed">{comment.content}</p>
                        </div>
                      ) : editingCommentId === comment.id ? (
                        <div className="mb-3 space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full min-h-[96px] p-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none transition-colors"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEditComment}
                              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editingContent.trim() || isUpdatingComment}
                              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdatingComment ? "수정 중..." : "수정"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-foreground/90 text-sm leading-relaxed mb-3">
                          {comment.content}
                        </p>
                      )}

                      {/* Like & Reply Buttons */}
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            likedComments.has(comment.id)
                              ? "text-red-500"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              likedComments.has(comment.id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          <span>
                            {comment.likes}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (expandedReplies[comment.id] === undefined) {
                              await handleOpenReplies(comment.id);
                              setReplyingTo(comment.id);
                              setReplyText("");
                              setGuestReplyName("");
                              setGuestReplyPassword("");
                            } else if (replyingTo === comment.id) {
                              setReplyingTo(null);
                              setReplyText("");
                              setGuestReplyName("");
                              setGuestReplyPassword("");
                            } else {
                              setReplyingTo(comment.id);
                              setReplyText("");
                              setGuestReplyName("");
                              setGuestReplyPassword("");
                            }
                          }}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            replyingTo === comment.id || expandedReplies[comment.id] !== undefined
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <ReplyIcon className="w-4 h-4" />
                          <span>답글</span>
                          {comment.totalReplies > 0 && (
                            <span className="text-xs">
                              {comment.totalReplies}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {((expandedReplies[comment.id] !== undefined && comment.replies.length > 0) || hasMoreReplies) && (
                  <div className="ml-6 md:ml-10 mt-2 space-y-2 border-l-2 border-glass-border pl-4">
                    {visibleReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3 bg-muted/30 rounded-lg border border-glass-border/30"
                      >
                        <div className="flex items-start gap-2.5">
                          <ProfileAvatar
                            src={resolveProfileImage(reply.author.profileImage)}
                            alt={reply.author.nickname}
                            sizeClassName="size-7"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm text-foreground">
                                  {reply.author.nickname}
                                </span>
                                {reply.author.id === post.author.id && (
                                  <AuthorBadge />
                                )}
                                {reply.isGuest && <GuestBadge ip={reply.guestIp} />}
                                <span className="text-xs text-muted-foreground">
                                  {formatCommentDate(reply.createdAt)}
                                </span>
                              </div>
                              {renderActionMenu(reply, "reply")}
                            </div>
                            {isDeletedItem(reply) ? (
                              <div className="mb-2 flex items-start gap-2 rounded-lg border border-sky-200/60 bg-sky-50/80 px-3 py-2 text-sm text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="leading-relaxed">{reply.content}</p>
                              </div>
                            ) : (
                              <p className="text-foreground/90 text-sm leading-relaxed mb-2">
                                {reply.content}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleLikeComment(reply.id)
                              }
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                likedComments.has(reply.id)
                                  ? "text-red-500"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  likedComments.has(reply.id)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                              <span>
                                {reply.likes}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load more replies */}
                    {hasMoreReplies && expandedReplies[comment.id] !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleLoadMoreReplies(comment.id)}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors py-1.5 pl-1"
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span>
                          답글 {remainingReplies}개 더 보기
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Reply Form */}
                {expandedReplies[comment.id] !== undefined && (
                  <div className="ml-6 md:ml-10 mt-2 border-l-2 border-border pl-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-glass-border/30">
                      {!isLoggedIn &&
                        renderGuestInputs(
                          guestReplyName,
                          setGuestReplyName,
                          guestReplyPassword,
                          setGuestReplyPassword
                        )}
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 작성하세요..."
                          className="flex-1 min-h-[60px] p-3 bg-muted border border-glass-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                          autoFocus
                        />
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleSubmitReply(comment.id)
                            }
                            disabled={
                              !replyText.trim() ||
                              isSubmittingReply ||
                              (!isLoggedIn &&
                                (!guestReplyName.trim() ||
                                  guestReplyPassword.length < 4))
                            }
                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingReply ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCloseReplies(comment.id)}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading More Indicator */}
          {hasMore && (
            <div ref={observerRef} className="flex justify-center py-4">
              {isLoadingMore && (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              )}
            </div>
          )}

          {/* No Comments */}
          {displayedComments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              댓글이 없습니다. 첫 번째 댓글을 달아 소통을 시작하세요.
            </div>
          )}

          {/* End of Comments */}
          {!hasMore && displayedComments.length > 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              모든 댓글을 불러왔습니다
            </div>
          )}
        </div>
      </section>

      {/* Guest Delete Password Modal */}
      {deletePromptId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setDeletePromptId(null);
              setDeletePassword("");
              setDeleteError("");
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
            <div className="bg-popover border border-glass-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                댓글 삭제
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                작성 시 입력한 비밀번호를 입력해주세요.
              </p>
              <div className="relative mb-3">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmGuestDelete();
                  }}
                  placeholder="비밀번호"
                  className="w-full pl-9 pr-3 py-2.5 bg-muted border border-glass-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDeletePromptId(null);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGuestDelete}
                  disabled={!deletePassword}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Article Delete Confirm Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
            <div className="bg-popover border border-glass-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                게시글 삭제
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingArticle}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDeleteArticle}
                  disabled={isDeletingArticle}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeletingArticle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    "삭제"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
