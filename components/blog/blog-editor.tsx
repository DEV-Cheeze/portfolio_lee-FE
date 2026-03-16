"use client";

import React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  X,
  Plus,
  ArrowLeft,
  Eye,
  Pencil,
  Columns2,
  ListChecks,
  Minus,
  Table,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "./markdown-renderer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { createTempArticle, publishArticle, uploadArticleImages, updateArticle, fetchArticleEditDetail } from "@/lib/api";

interface Tag {
  id: string;
  name: string;
}

type ViewMode = "edit" | "preview" | "split";

interface BlogEditorProps {
  mode?: "create" | "edit";
  articleId?: string;
}

export function BlogEditor({ mode = "create", articleId: initialArticleId }: BlogEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [articleId, setArticleId] = useState<number | null>(initialArticleId ? Number(initialArticleId) : null);
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isEditDataLoaded, setIsEditDataLoaded] = useState(mode === "create");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const createdDraftRef = useRef(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoggedIn, isAuthLoading, openLoginModal } = useAuth();
  
  const isEditMode = mode === "edit";


  const userRoles = user?.roles ?? [];
  const isAdmin = userRoles.includes("ROLE_ADMIN") || userRoles.includes("ADMIN");

  // Load existing article data for edit mode
  useEffect(() => {
    if (!isEditMode || !initialArticleId || isEditDataLoaded) {
      return;
    }

    const loadArticleData = async () => {
      try {
        setIsDraftLoading(true);
        const article = await fetchArticleEditDetail(initialArticleId);
        
        if (!article) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }

        setTitle(article.title || "");
        setContent(article.content || "");
        setTags(
          Array.isArray(article.tags)
            ? article.tags.map((tag: string, index: number) => ({
                id: `tag-${index}`,
                name: tag,
              }))
            : []
        );
        setIsEditDataLoaded(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "게시글 불러오기 실패",
          description: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.",
          customDuration: 5000,
          className: "custom-toast-animation",
        });
        router.replace("/blog");
      } finally {
        setIsDraftLoading(false);
      }
    };

    loadArticleData();
  }, [isEditMode, initialArticleId, isEditDataLoaded, router, toast]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isLoggedIn) {
      setIsDraftLoading(false);
      openLoginModal();
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: isEditMode ? "글 수정은 관리자 로그인 후 이용할 수 있습니다." : "글 작성은 관리자 로그인 후 이용할 수 있습니다.",
        customDuration: 4000,
        className: "custom-toast-animation",
      });
      router.replace("/blog");
      return;
    }

    if (!isAdmin) {
      setIsDraftLoading(false);
      toast({
        variant: "destructive",
        title: "권한이 없습니다",
        description: isEditMode ? "글 수정은 관리자만 가능합니다." : "글 작성은 관리자만 가능합니다.",
        customDuration: 4000,
        className: "custom-toast-animation",
      });
      router.replace("/blog");
      return;
    }

    // Skip draft creation in edit mode
    if (isEditMode) {
      if (!isDraftLoading && isEditDataLoaded) {
        return;
      }
      return;
    }

    if (createdDraftRef.current) {
      return;
    }

    createdDraftRef.current = true;

    const bootstrapDraft = async () => {
      try {
        setIsDraftLoading(true);
        const draft = await createTempArticle();
        if (!draft?.id) {
          throw new Error("임시 게시글 번호를 받지 못했습니다.");
        }
        setArticleId(draft.id);
      } catch (error) {
        createdDraftRef.current = false;
        toast({
          variant: "destructive",
          title: "임시 게시글 생성 실패",
          description: error instanceof Error ? error.message : "글쓰기 화면을 준비하지 못했습니다.",
          customDuration: 5000,
          className: "custom-toast-animation",
        });
        router.replace("/blog");
      } finally {
        setIsDraftLoading(false);
      }
    };

    bootstrapDraft();
  }, [isAdmin, isAuthLoading, isLoggedIn, isEditMode, isDraftLoading, isEditDataLoaded, openLoginModal, router, toast]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: tagInput.trim(),
      };
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertMarkdown = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const textToInsert = selectedText || placeholder;

      const newContent =
        content.substring(0, start) +
        before +
        textToInsert +
        after +
        content.substring(end);

      setContent(newContent);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(start + before.length, cursorPos);
      });
    },
    [content]
  );

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;

      const newContent =
        content.substring(0, lineStart) + prefix + content.substring(lineStart);
      setContent(newContent);

      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [content]
  );

  const insertTextAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${prev && !prev.endsWith("\n") ? "\n" : ""}${text}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = `${content.substring(0, start)}${text}${content.substring(end)}`;
    setContent(nextContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextPosition = start + text.length;
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  }, [content]);

  const buildImageMarkdown = useCallback((urls: string[]) => {
    return urls.map((url) => `![](${url})`).join("\n");
  }, []);

  const isImageLimitError = useCallback((message: string) => {
    const normalized = message.toLowerCase();
    return normalized.includes("25") || normalized.includes("최대") || normalized.includes("초과");
  }, []);

  const uploadAndInsertImages = useCallback(async (files: File[]) => {
    if (!articleId || files.length === 0) {
      return false;
    }

    try {
      setIsUploadingImages(true);
      const response = await uploadArticleImages(articleId, files);
      const urls = Array.isArray(response.urls) ? response.urls.filter(Boolean) : [];

      if (urls.length === 0) {
        throw new Error("업로드된 이미지 URL을 받지 못했습니다.");
      }

      const markdown = buildImageMarkdown(urls);
      const prefix = content && !content.endsWith("\n") ? "\n" : "";
      insertTextAtCursor(`${prefix}${markdown}\n`);
      toast({
        title: "이미지 업로드 완료",
        description: `${urls.length}개의 이미지가 본문에 추가되었습니다.`,
        customDuration: 3000,
        className: "custom-toast-animation",
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.";
      toast({
        variant: "destructive",
        title: isImageLimitError(message) ? "이미지 개수 초과" : "이미지 업로드 실패",
        description: isImageLimitError(message)
          ? "이미지는 최대 25개까지 업로드할 수 있습니다."
          : message,
        customDuration: 5000,
        className: "custom-toast-animation",
      });
      return false;
    } finally {
      setIsUploadingImages(false);
    }
  }, [articleId, buildImageMarkdown, content, insertTextAtCursor, isImageLimitError, toast]);

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      await uploadAndInsertImages(files);
    }
    e.target.value = "";
  }, [uploadAndInsertImages]);



  const handleEditorPaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!articleId || isUploadingImages) {
      return;
    }

    const clipboardFiles = Array.from(e.clipboardData.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (clipboardFiles.length > 0) {
      e.preventDefault();
      await uploadAndInsertImages(clipboardFiles);
    }
  }, [articleId, isUploadingImages, uploadAndInsertImages]);

  const handleSubmit = async () => {
    if (!articleId || isPublishing || isDraftLoading) {
      return;
    }

    try {
      setIsPublishing(true);
      
      if (isEditMode) {
        await updateArticle(articleId, {
          title,
          content,
          tags: tags.map((t) => t.name),
        });

        toast({
          title: "게시글 수정 완료",
          description: "게시물이 성공적으로 수정되었습니다.",
          customDuration: 3500,
          className: "custom-toast-animation",
        });
      } else {
        await publishArticle(articleId, {
          title,
          content,
          tags: tags.map((t) => t.name),
        });

        toast({
          title: "게시글 발행 완료",
          description: "게시물이 성공적으로 발행되었습니다.",
          customDuration: 3500,
          className: "custom-toast-animation",
        });
      }
      
      router.push(`/blog/${articleId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: isEditMode ? "게시글 수정 실패" : "게시글 발행 실패",
        description: error instanceof Error ? error.message : isEditMode ? "게시글 수정 중 오류가 발생했습니다." : "게시글 발행 중 오류가 발생했습니다.",
        customDuration: 5000,
        className: "custom-toast-animation",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      });
    }
  };

  const ToolbarButton = ({
    onClick,
    children,
    title,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );

  const ViewToggle = () => (
    <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => setViewMode("edit")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "edit"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Pencil className="w-3 h-3" />
        <span className="hidden sm:inline">편집</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode("split")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "split"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Columns2 className="w-3 h-3" />
        <span className="hidden sm:inline">분할</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode("preview")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "preview"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Eye className="w-3 h-3" />
        <span className="hidden sm:inline">미리보기</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={isEditMode && articleId ? `/blog/${articleId}` : "/blog"}>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEditMode ? "돌아가기" : "목록으로"}</span>
          </button>
        </Link>
        <div className="flex gap-3">
          {!isEditMode && (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              임시저장
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDraftLoading || isPublishing || !articleId}
            className="px-4 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing 
              ? (isEditMode ? "수정 중..." : "발행 중...") 
              : (isEditMode ? "수정하기" : "발행하기")}
          </button>
        </div>
      </div>

      {isDraftLoading && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {isEditMode ? "게시글을 불러오는 중입니다..." : "임시 게시글을 생성하는 중입니다..."}
        </div>
      )}

      {/* Title Input */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
        />
      </div>

      {/* Tags Input */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-3 py-1 bg-primary/8 text-primary rounded-lg text-sm font-medium"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:bg-primary/15 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="태그 추가 (Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/40 text-foreground min-w-[120px]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          최대 10개의 태그를 추가할 수 있습니다. ({tags.length}/10)
        </p>
      </div>

      {/* Editor */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border">
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
              <ToolbarButton
                onClick={() => insertAtLineStart("# ")}
                title="제목 1 (# )"
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertAtLineStart("## ")}
                title="제목 2 (## )"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertAtLineStart("### ")}
                title="제목 3 (### )"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
              <ToolbarButton
                onClick={() => insertMarkdown("**", "**", "굵은 텍스트")}
                title="굵게 (**text**)"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown("*", "*", "기울임 텍스트")}
                title="기울임 (*text*)"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown("~~", "~~", "취소선 텍스트")}
                title="취소선 (~~text~~)"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
              <ToolbarButton
                onClick={() => insertAtLineStart("- ")}
                title="글머리 기호 (- )"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertAtLineStart("1. ")}
                title="번호 매기기 (1. )"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertAtLineStart("- [ ] ")}
                title="체크리스트 (- [ ] )"
              >
                <ListChecks className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() =>
                  insertMarkdown("[", "](url)", "링크 텍스트")
                }
                title="링크 ([text](url))"
              >
                <Link2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => imageInputRef.current?.click()}
                title="이미지 (![alt](url))"
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown("`", "`", "code")}
                title="인라인 코드 (`code`)"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  insertMarkdown("\n```\n", "\n```\n", "코드를 입력하세요")
                }
                title="코드 블록 (```)"
              >
                <span className="text-xs font-mono font-bold">{"{ }"}</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertAtLineStart("> ")}
                title="인용구 (> )"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown("\n---\n", "", "")}
                title="구분선 (---)"
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  insertMarkdown(
                    "\n| 헤더1 | 헤더2 | 헤더3 |\n| --- | --- | --- |\n| ",
                    " | 내용2 | 내용3 |\n",
                    "내용1"
                  )
                }
                title="테이블"
              >
                <Table className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </div>

          <ViewToggle />
        </div>

        {/* Content Area */}
        <div
          className={`${viewMode === "split" ? "grid grid-cols-2" : ""}`}
          style={{ minHeight: "500px" }}
        >
          {/* Editor Pane */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`relative ${
                viewMode === "split" ? "border-r border-border" : ""
              }`}
            >
              {viewMode === "split" && (
                <div className="sticky top-0 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                  Markdown
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                onPaste={handleEditorPaste}
                placeholder={"마크다운으로 내용을 작성하세요...\n\n# 제목\n## 소제목\n**굵은 글씨** *기울임*\n- 목록 항목\n> 인용구\n`인라인 코드`"}
                className="w-full h-full min-h-[500px] p-6 bg-transparent text-foreground font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-muted-foreground/30"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="overflow-auto">
              {viewMode === "split" && (
                <div className="sticky top-0 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border z-10">
                  미리보기
                </div>
              )}
              <div className="p-6">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-muted-foreground/30 text-sm">
                    마크다운을 입력하면 여기에 미리보기가 표시됩니다...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Markdown Help */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          마크다운 문법 가이드
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { code: "# 제목", label: "제목 (H1~H3)" },
            { code: "**굵게**", label: "굵은 글씨" },
            { code: "*기울임*", label: "기울임꼴" },
            { code: "~~취소선~~", label: "취소선" },
            { code: "[텍스트](URL)", label: "링크" },
            { code: "![설명](URL)", label: "이미지" },
            { code: "`코드`", label: "인라인 코드" },
            { code: "```코드블록```", label: "코드 블록" },
            { code: "> 인용구", label: "인용구" },
            { code: "- 항목", label: "글머리 기호" },
            { code: "1. 항목", label: "번호 목록" },
            { code: "---", label: "구분선" },
          ].map((item) => (
            <div
              key={item.code}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <code className="bg-muted px-2 py-1 rounded-md font-mono text-foreground text-xs">
                {item.code}
              </code>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
