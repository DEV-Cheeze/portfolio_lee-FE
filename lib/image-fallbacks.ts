export const DEFAULT_PROFILE_IMAGE = "/default-profile.svg"
export const DEFAULT_THUMBNAIL_IMAGE = "/default-thumbnail.svg"

export function resolveProfileImage(image?: string | null) {
  return image?.trim() ? image : DEFAULT_PROFILE_IMAGE
}

export function resolveThumbnailImage(image?: string | null) {
  return image?.trim() ? image : null
}

export function hasThumbnail(image?: string | null): boolean {
  return Boolean(image?.trim())
}
