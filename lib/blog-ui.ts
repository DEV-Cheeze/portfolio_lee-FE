export const DEFAULT_PROFILE_IMAGE = "/images/default-profile.svg";

export function resolveProfileImage(src?: string | null) {
  if (typeof src === "string" && src.trim()) {
    return src;
  }
  return DEFAULT_PROFILE_IMAGE;
}

export interface TocHeadingItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return normalized || "section";
}

export function extractHeadingsWithUniqueIds(markdown: string): TocHeadingItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: TocHeadingItem[] = [];
  const slugCount = new Map<string, number>();
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseSlug = slugify(text);
    const nextCount = (slugCount.get(baseSlug) ?? 0) + 1;
    slugCount.set(baseSlug, nextCount);

    headings.push({
      id: nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`,
      text,
      level,
    });
  }

  return headings;
}
