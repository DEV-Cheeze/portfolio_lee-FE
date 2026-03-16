"use client";

import { Tag } from "lucide-react";

interface TagListProps {
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export function TagList({ tags, selectedTags, onTagClick }: TagListProps) {
  return (
    <div className="sticky top-24" data-testid="panel-blog-tags">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground" data-testid="text-blog-tags-title">
            Tags
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5" data-testid="list-blog-tags">
          <button
            data-testid="button-blog-tag-all"
            type="button"
            onClick={() => onTagClick("")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              selectedTags.length === 0
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>

          {tags.map((tag) => (
            <button
              data-testid={`button-blog-tag-${tag}`}
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
