"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Calendar,
  Pencil,
  Lock,
  Heart,
  MessageSquare,
  Trash2,
  X,
  Check,
  Loader2,
  LogIn,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { deleteComment, fetchMyComments, fetchMyLikes, unlikeArticle } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { resolveProfileImage, hasThumbnail } from "@/lib/image-fallbacks";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

type CommentItem = {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  createdAt: string;
  thumbnail?: string | null;
};

type LikedPostItem = {
  id: string;
  title: string;
  thumbnail?: string | null;
  author: string;
  likedAt: string;
};

const PAGE_SIZE = 10;

export function MyPageContent() {
  const { user, isLoggedIn, updateNickname, updateProfileImage } = useAuth();
  const { toast } = useToast();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || "");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [likedPosts, setLikedPosts] = useState<LikedPostItem[]>([]);
  const [hasMoreLikedPosts, setHasMoreLikedPosts] = useState(false);
  const [loadingLikedPosts, setLoadingLikedPosts] = useState(false);
  const [likedPostsPage, setLikedPostsPage] = useState(0);
  const [likedPostsLoaded, setLikedPostsLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<"comments" | "liked">("comments");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [unlikingPostId, setUnlikingPostId] = useState<string | null>(null);

  const commentsScrollRef = useRef<HTMLDivElement | null>(null);
  const likedScrollRef = useRef<HTMLDivElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setNewNickname(user?.nickname || "");
  }, [user?.nickname]);

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId) return;

    setDeletingCommentId(commentId);

    try {
      await deleteComment(commentId, {});
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast({ title: "댓글이 삭제되었습니다.", description: "마이페이지 목록에서 제거되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "댓글 삭제 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleUnlike = async (postId: string) => {
    if (unlikingPostId) return;

    setUnlikingPostId(postId);

    try {
      await unlikeArticle(postId);
      setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "좋아요가 취소되었습니다.", description: "마이페이지 목록에서 제거되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "좋아요 취소 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setUnlikingPostId(null);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    await updateProfileImage(file);
    e.target.value = "";
  };

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) {
      toast({
        variant: "destructive",
        title: "닉네임 변경 실패",
        description: "닉네임을 입력해주세요.",
      });
      return;
    }

    if (newNickname === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    const result = await updateNickname(newNickname);
    if (result.success) {
      setIsEditingNickname(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const loadComments = useCallback(async (page: number) => {
    setLoadingComments(true);

    try {
      const response = await fetchMyComments(page, PAGE_SIZE);
      const nextComments = response.content.map((item) => ({
        id: String(item.commentId),
        postId: String(item.articleId),
        postTitle: item.title,
        content: item.content,
        createdAt: item.wroteAt,
        thumbnail: hasThumbnail(item.thumbnailImageUrl) ? item.thumbnailImageUrl : null,
      }));

      setComments((prev) => (page === 0 ? nextComments : [...prev, ...nextComments]));
      setHasMoreComments(response.hasNext);
      setCommentsPage(response.page);
    } catch (error) {
      if (page === 0) {
        setComments([]);
      }
      setHasMoreComments(false);
    } finally {
      setLoadingComments(false);
      setCommentsLoaded(true);
    }
  }, []);

  const loadLikedPosts = useCallback(async (page: number) => {
    setLoadingLikedPosts(true);

    try {
      const response = await fetchMyLikes(page, PAGE_SIZE);
      const nextLikedPosts = response.content.map((item) => ({
        id: String(item.articleId),
        title: item.title,
        thumbnail: hasThumbnail(item.thumbnailImage) ? item.thumbnailImage : null,
        author: item.writerName,
        likedAt: item.wroteAt,
      }));

      setLikedPosts((prev) => (page === 0 ? nextLikedPosts : [...prev, ...nextLikedPosts]));
      setHasMoreLikedPosts(response.hasNext);
      setLikedPostsPage(response.page);
    } catch (error) {
      if (page === 0) {
        setLikedPosts([]);
      }
      setHasMoreLikedPosts(false);
    } finally {
      setLoadingLikedPosts(false);
      setLikedPostsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      return;
    }

    loadComments(0);
    loadLikedPosts(0);
  }, [isLoggedIn, user, loadComments, loadLikedPosts]);

  const handleCommentsScroll = useCallback(() => {
    const el = commentsScrollRef.current;
    if (!el || loadingComments || !hasMoreComments) return;

    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (reachedBottom) {
      loadComments(commentsPage + 1);
    }
  }, [commentsPage, hasMoreComments, loadComments, loadingComments]);

  const handleLikedScroll = useCallback(() => {
    const el = likedScrollRef.current;
    if (!el || loadingLikedPosts || !hasMoreLikedPosts) return;

    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (reachedBottom) {
      loadLikedPosts(likedPostsPage + 1);
    }
  }, [likedPostsPage, hasMoreLikedPosts, loadLikedPosts, loadingLikedPosts]);

  // Not logged in state
  if (!isLoggedIn || !user) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="rounded-2xl border border-glass-border bg-glass backdrop-blur-xl p-8 md:p-12 max-w-md w-full shadow-lg">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            마이페이지를 이용하시려면 로그인해주세요.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity text-center shadow-sm"
            >
              홈으로 가서 로그인
            </Link>
            <Link
              href="/signup"
              className="w-full py-3 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors text-center"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <input
        ref={profileImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileImageChange}
      />
      {/* Profile Section */}
      <div className={`rounded-2xl border border-glass-border bg-glass backdrop-blur-xl p-6 md:p-8 shadow-lg transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="relative">
            <ProfileAvatar
              src={resolveProfileImage(user?.profileImage)}
              alt={user?.nickname || "프로필"}
              sizeClassName="w-24 h-24"
            />
            <button
              type="button"
              onClick={() => profileImageInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 bg-foreground text-background rounded-lg shadow-md hover:opacity-90 transition-opacity"
              aria-label="프로필 사진 변경"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Nickname */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="px-3 py-1 bg-muted border border-glass-border rounded-lg text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="p-1.5 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingNickname(false);
                      setNewNickname(user?.nickname || "");
                    }}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.nickname}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingNickname(true)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    aria-label="닉네임 변경"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Username */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mb-1">
              <User className="w-3.5 h-3.5" />
              <span>@{user?.username}</span>
            </div>

            {/* Join Date */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {user?.joinDate ? formatDate(user.joinDate) : ""} 가입
              </span>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-muted border border-glass-border hover:bg-muted/80 text-foreground rounded-xl transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-2xl border border-glass-border bg-glass backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex border-b border-glass-border bg-card/50">
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === "comments"
                ? "text-foreground bg-muted/30 border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            내가 쓴 댓글
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("liked")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === "liked"
                ? "text-foreground bg-muted/30 border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            <Heart className="w-4 h-4" />
            좋아요한 글
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 bg-card/30">
          {activeTab === "comments" ? (
            <div
              ref={commentsScrollRef}
              onScroll={handleCommentsScroll}
              className="space-y-3 max-h-[34rem] overflow-y-auto pr-2"
            >
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 border border-transparent hover:border-glass-border group transition-all"
                  >
                    <Link href={`/blog/${comment.postId}`} className="shrink-0">
                      {comment.thumbnail ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-border">
                          <Image
                            src={comment.thumbnail}
                            alt={comment.postTitle}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-border bg-muted/50 dark:bg-muted/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground/60" strokeWidth={1.5} />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${comment.postId}`}
                        className="text-xs font-medium text-primary hover:underline line-clamp-1"
                      >
                        {comment.postTitle}
                      </Link>
                      <p className="text-sm text-foreground mt-1 line-clamp-2 leading-relaxed">
                        {comment.content}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1.5 block">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100 disabled:cursor-not-allowed"
                      aria-label="댓글 삭제"
                    >
                      {deletingCommentId === comment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              ) : commentsLoaded && !loadingComments ? (
                <p className="text-center text-muted-foreground text-sm py-12">
                  작성한 댓글이 없습니다.
                </p>
              ) : null}

              {loadingComments && (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">댓글을 불러오는 중...</span>
                </div>
              )}
            </div>
          ) : (
            <div
              ref={likedScrollRef}
              onScroll={handleLikedScroll}
              className="space-y-3 max-h-[34rem] overflow-y-auto pr-2"
            >
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 border border-transparent hover:border-glass-border group transition-all"
                  >
                    <Link href={`/blog/${post.id}`} className="shrink-0">
                      {post.thumbnail ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-border">
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-border bg-muted/50 dark:bg-muted/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground/60" strokeWidth={1.5} />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.author} · {formatDate(post.likedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleUnlike(post.id)}
                      disabled={unlikingPostId === post.id}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100 disabled:cursor-not-allowed"
                      aria-label="좋아요 취소"
                    >
                      {unlikingPostId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                ))
              ) : likedPostsLoaded && !loadingLikedPosts ? (
                <p className="text-center text-muted-foreground text-sm py-12">
                  좋아요한 글이 없습니다.
                </p>
              ) : null}

              {loadingLikedPosts && (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">좋아요한 글을 불러오는 중...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    alert("비밀번호가 변경되었습니다.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-glass-border bg-glass shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-6">
          비밀번호 변경
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-glass-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-glass-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="8자 이상"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-glass-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
}
