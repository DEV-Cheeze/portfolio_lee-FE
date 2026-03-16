import Image from "next/image";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/image-fallbacks";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  src?: string | null;
  alt: string;
  sizeClassName?: string;
  wrapperClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

function hasCustomProfileImage(src?: string | null) {
  const trimmed = src?.trim();
  return Boolean(trimmed && trimmed !== DEFAULT_PROFILE_IMAGE);
}

export function ProfileAvatar({
  src,
  alt,
  sizeClassName = "w-5 h-5",
  wrapperClassName,
  imageClassName,
  fallbackClassName,
}: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-muted flex-shrink-0",
        sizeClassName,
        wrapperClassName,
      )}
    >
      {hasCustomProfileImage(src) ? (
        <Image
          src={src!}
          alt={alt}
          width={96}
          height={96}
          className={cn("w-full h-full object-cover", imageClassName)}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-muted-foreground",
            fallbackClassName,
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <rect width="100" height="100" rx="50" fill="currentColor" fillOpacity="0.15"/>
            <circle cx="50" cy="38" r="16" fill="currentColor" fillOpacity="0.6"/>
            <ellipse cx="50" cy="80" rx="26" ry="20" fill="currentColor" fillOpacity="0.6"/>
          </svg>
        </div>
      )}
    </div>
  );
}
