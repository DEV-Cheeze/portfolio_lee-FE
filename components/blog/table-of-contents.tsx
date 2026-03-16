"use client";

import { useState, useEffect, useCallback } from "react";
import type { MarkdownHeading } from "@/lib/markdown-headings";

interface TableOfContentsProps {
  content: string;
}

const DEFAULT_SCROLL_OFFSET = 112;

function getHeadingScrollOffset() {
  if (typeof window === "undefined") return DEFAULT_SCROLL_OFFSET;

  const navigation = document.querySelector<HTMLElement>('[data-testid="nav-main"]');
  const navigationHeight = navigation?.offsetHeight ?? 0;

  return Math.max(DEFAULT_SCROLL_OFFSET, navigationHeight + 28);
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const syncHeadingsFromDom = () => {
      const renderedHeadings = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".prose-section h1[id], .prose-section h2[id], .prose-section h3[id]"
        )
      ).map((element) => ({
        id: element.id,
        text: element.textContent?.trim() ?? "",
        level: Number(element.tagName.replace("H", "")),
      })).filter((heading) => heading.text);

      setHeadings(renderedHeadings);
      setActiveId((prev) => prev || renderedHeadings[0]?.id || "");
    };

    syncHeadingsFromDom();

    const rafId = window.requestAnimationFrame(syncHeadingsFromDom);
    window.addEventListener("load", syncHeadingsFromDom);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("load", syncHeadingsFromDom);
    };
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const updateActiveHeading = () => {
      const headingScrollOffset = getHeadingScrollOffset();
      const currentScrollY = window.scrollY + headingScrollOffset + 12;
      let nextActiveId = headings[0]?.id ?? "";

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;

        if (element.offsetTop <= currentScrollY) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(nextActiveId);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headingScrollOffset = getHeadingScrollOffset();
      const offsetPosition = Math.max(0, element.getBoundingClientRect().top + window.scrollY - headingScrollOffset);
      const highlightTarget = element.querySelector<HTMLElement>(`[data-heading-highlight="${id}"]`);

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      if (highlightTarget) {
        const existingTimeoutId = highlightTarget.dataset.highlightTimeoutId;

        if (existingTimeoutId) {
          window.clearTimeout(Number(existingTimeoutId));
        }

        highlightTarget.classList.remove("toc-heading-highlight");
        void highlightTarget.offsetWidth;
        highlightTarget.classList.add("toc-heading-highlight");

        const timeoutId = window.setTimeout(() => {
          highlightTarget.classList.remove("toc-heading-highlight");
          delete highlightTarget.dataset.highlightTimeoutId;
        }, 1800);

        highlightTarget.dataset.highlightTimeoutId = String(timeoutId);
      }

      setActiveId(id);
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="text-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-2 border-l border-border">
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id;
          const paddingLeft = (heading.level - 1) * 12 + 12;

          return (
            <li key={`${heading.id}-${index}`}>
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left transition-colors duration-150 -ml-px border-l-2 ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
                style={{ paddingLeft: `${paddingLeft}px` }}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="line-clamp-2 leading-relaxed">{heading.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
