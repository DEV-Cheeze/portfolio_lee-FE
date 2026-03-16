import { DEFAULT_PROFILE_IMAGE } from './image-fallbacks'

const ACCESS_TOKEN_HEADER = 'Authorization'
const SESSION_MARKER_KEY = 'auth_session_active'
const LOGIN_REQUIRED_EVENT = 'auth:login-required'

let accessTokenMemory: string | null = null
let authBootstrapPromise: Promise<void> | null = null
let resolveAuthBootstrap: (() => void) | null = null
let authBootstrapCompleted = false

interface JwtPayload {
  role?: string
  roles?: string[] | string
  authorities?: string[] | string
  sub?: string
  username?: string
  nickname?: string
  name?: string
  userId?: string | number
  profileImageUrl?: string
  profileImage?: string
  exp?: number
  [key: string]: unknown
}


export function startAuthBootstrap() {
  if (authBootstrapCompleted) {
    authBootstrapCompleted = false
  }

  if (!authBootstrapPromise) {
    authBootstrapPromise = new Promise<void>((resolve) => {
      resolveAuthBootstrap = resolve
    })
  }
}

export function finishAuthBootstrap() {
  authBootstrapCompleted = true
  if (resolveAuthBootstrap) {
    resolveAuthBootstrap()
  }
  authBootstrapPromise = null
  resolveAuthBootstrap = null
}

export async function waitForAuthBootstrap() {
  if (authBootstrapCompleted || !authBootstrapPromise) {
    return
  }

  await authBootstrapPromise
}

export function getAccessToken() {
  return accessTokenMemory
}

export function setAccessToken(token: string | null) {
  accessTokenMemory = token
}

export function clearAccessToken() {
  accessTokenMemory = null
}

export function markSessionActive() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_MARKER_KEY, 'true')
}

export function clearSessionMarker() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_MARKER_KEY)
}

export function hasSessionMarker() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SESSION_MARKER_KEY) === 'true'
}

function normalizeBearerToken(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.startsWith('Bearer ') ? trimmed.slice(7) : trimmed
}

function findTokenDeep(source: unknown): string | null {
  if (!source || typeof source !== 'object') return null

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findTokenDeep(item)
      if (found) return found
    }
    return null
  }

  const record = source as Record<string, unknown>
  const preferredKeys = [
    'accessToken',
    'access_token',
    'authorization',
    'Authorization',
    'token',
    'jwt',
  ]

  for (const key of preferredKeys) {
    const direct = normalizeBearerToken(record[key])
    if (direct) return direct
  }

  for (const value of Object.values(record)) {
    const nested = findTokenDeep(value)
    if (nested) return nested
  }

  return null
}

export function extractAccessToken(response: Response, body?: any) {
  const headerValue =
    response.headers.get(ACCESS_TOKEN_HEADER) ||
    response.headers.get(ACCESS_TOKEN_HEADER.toLowerCase())

  const normalizedHeaderToken = normalizeBearerToken(headerValue)
  if (normalizedHeaderToken) {
    return normalizedHeaderToken
  }

  const explicitPaths = [
    body?.accessToken,
    body?.data?.accessToken,
    body?.result?.accessToken,
    body?.result?.data?.accessToken,
    body?.token?.accessToken,
    body?.data?.token?.accessToken,
    body?.Authorization,
    body?.authorization,
  ]

  for (const candidate of explicitPaths) {
    const normalized = normalizeBearerToken(candidate)
    if (normalized) {
      return normalized
    }
  }

  return findTokenDeep(body)
}

export async function parseJsonSafely(response: Response) {
  try {
    const raw = await response.clone().text()
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function decodeJwtPayload(token: string | null): JwtPayload | null {
  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json)
  } catch {
    return null
  }
}


function normalizeRoles(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((role) => role.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean)
  }

  return []
}

export function buildUserFromToken(token: string | null, fallback?: { username?: string; nickname?: string }) {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const username =
    (typeof payload.username === 'string' && payload.username) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    fallback?.username ||
    'user'

  const nickname =
    (typeof payload.nickname === 'string' && payload.nickname) ||
    (typeof payload.name === 'string' && payload.name) ||
    fallback?.nickname ||
    username

  const roles = [
    ...normalizeRoles(payload.role),
    ...normalizeRoles(payload.roles),
    ...normalizeRoles(payload.authorities),
  ]

  return {
    id: String(payload.userId ?? username),
    username,
    nickname,
    profileImage:
      (typeof payload.profileImageUrl === 'string' && payload.profileImageUrl) ||
      (typeof payload.profileImage === 'string' && payload.profileImage) ||
      DEFAULT_PROFILE_IMAGE,
    joinDate: new Date().toISOString().split('T')[0],
    roles: Array.from(new Set(roles)),
  }
}


export function getAccessTokenExpiry(token: string | null) {
  const payload = decodeJwtPayload(token)
  return typeof payload?.exp === 'number' ? payload.exp : null
}

export function isAccessTokenExpired(token: string | null, bufferSeconds = 30) {
  if (!token) return true

  const expiresAt = getAccessTokenExpiry(token)
  if (!expiresAt) return false

  const now = Math.floor(Date.now() / 1000)
  return expiresAt <= now + bufferSeconds
}

export function dispatchLoginRequired(detail?: { message?: string; reason?: string }) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LOGIN_REQUIRED_EVENT, { detail }))
}

export function getLoginRequiredEventName() {
  return LOGIN_REQUIRED_EVENT
}
