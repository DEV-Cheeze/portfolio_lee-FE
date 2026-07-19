import {
  clearAccessToken,
  clearSessionMarker,
  dispatchLoginRequired,
  extractAccessToken,
  getAccessToken,
  parseJsonSafely,
  setAccessToken,
  waitForAuthBootstrap,
  hasSessionMarker,
  isAccessTokenExpired,
} from './auth-client'

export const API_BASE_URL = 'https://api.lee-devlog.kro.kr/api/v1'


const articleDetailInFlight = new Map<string, Promise<any>>()
const articleDetailResponseCache = new Map<string, { expiresAt: number; value: any }>()
const ARTICLE_DETAIL_DEDUPE_TTL_MS = 1500


function createHeaders(initHeaders?: HeadersInit, includeJsonContentType = false) {
  const headers = new Headers(initHeaders)
  const token = getAccessToken()

  if (includeJsonContentType && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function getErrorMessage(body: any, fallback: string) {
  return body?.message || body?.error || body?.code || fallback
}

let reissuePromise: Promise<string> | null = null

async function tryReissueAccessToken() {
  const response = await fetch(`${API_BASE_URL}/auth/reissue`, {
    method: 'POST',
    credentials: 'include',
    headers: createHeaders(),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    clearAccessToken()
    clearSessionMarker()
    dispatchLoginRequired({
      reason: body?.code,
      message: getErrorMessage(body, '로그인이 만료되었습니다. 다시 로그인해주세요.'),
    })
    throw new Error(getErrorMessage(body, '로그인이 만료되었습니다. 다시 로그인해주세요.'))
  }

  const nextAccessToken = extractAccessToken(response, body)
  if (!nextAccessToken) {
    clearAccessToken()
    clearSessionMarker()
    dispatchLoginRequired({ message: '인증 정보를 다시 확인해주세요.' })
    throw new Error('재발급 응답에서 AccessToken을 찾을 수 없습니다.')
  }

  setAccessToken(nextAccessToken)
  return nextAccessToken
}

async function ensureValidAccessToken(force = false) {
  if (!hasSessionMarker()) {
    return getAccessToken()
  }

  const currentToken = getAccessToken()
  const shouldReissue = force || !currentToken || isAccessTokenExpired(currentToken)

  if (!shouldReissue) {
    return currentToken
  }

  if (!reissuePromise) {
    reissuePromise = tryReissueAccessToken().finally(() => {
      reissuePromise = null
    })
  }

  return reissuePromise
}

function shouldRetryAfterServerError(body: any) {
  const reason = `${body?.message ?? ''} ${body?.error ?? ''} ${body?.code ?? ''}`.toLowerCase()
  return reason.includes('token') || reason.includes('jwt') || reason.includes('expired') || reason.includes('만료')
}

function isAuthFailureResponse(response: Response, body: any) {
  return response.status === 401 || (response.status === 500 && shouldRetryAfterServerError(body))
}

async function tryReissueAccessTokenSilently() {
  if (!hasSessionMarker()) {
    return getAccessToken()
  }

  const currentToken = getAccessToken()
  const shouldReissue = !currentToken || isAccessTokenExpired(currentToken)

  if (!shouldReissue) {
    return currentToken
  }

  try {
    if (!reissuePromise) {
      reissuePromise = tryReissueAccessToken().finally(() => {
        reissuePromise = null
      })
    }

    return await reissuePromise
  } catch {
    clearAccessToken()
    clearSessionMarker()
    return null
  }
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
  waitForBootstrap = true,
) {
  if (waitForBootstrap && hasSessionMarker()) {
    await waitForAuthBootstrap()
  }

  if (retryOnUnauthorized) {
    await ensureValidAccessToken()
  }

  const sendRequest = () => fetch(input, {
    ...init,
    credentials: 'include',
    headers: createHeaders(init.headers),
  })

  let response = await sendRequest()

  if (!retryOnUnauthorized) {
    return response
  }

  if (response.status === 401) {
    await ensureValidAccessToken(true)
    return sendRequest()
  }

  if (response.status === 500 && hasSessionMarker()) {
    const body = await parseJsonSafely(response)
    if (shouldRetryAfterServerError(body)) {
      await ensureValidAccessToken(true)
      response = await sendRequest()
    }
  }

  return response
}

export async function loginRequest(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: createHeaders(undefined, true),
    body: JSON.stringify({ username, password }),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '아이디 또는 비밀번호가 올바르지 않습니다.'))
  }

  const accessToken = extractAccessToken(response, body)
  if (!accessToken) {
    throw new Error('로그인 응답에서 AccessToken을 찾을 수 없습니다.')
  }

  setAccessToken(accessToken)
  return { response, body, accessToken }
}

export async function reissueRequest() {
  return ensureValidAccessToken(true)
}

export async function registerRequest(data: RegisterRequestData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(data),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '회원가입 중 오류가 발생했습니다.'))
  }

  return { response, body }
}

export async function checkNicknameExistsRequest(nickname: string) {
  const response = await fetch(`${API_BASE_URL}/users/nickname/exists?name=${encodeURIComponent(nickname)}`, {
    method: 'GET',
    credentials: 'include',
    headers: createHeaders(),
  })

  const body = await parseJsonSafely(response)

  if (response.ok) {
    return false
  }

  if (response.status >= 400 && response.status < 500) {
    return true
  }

  throw new Error(getErrorMessage(body, '닉네임 중복 확인 중 오류가 발생했습니다.'))
}

export async function updateNicknameRequest(nickname: string) {
  const response = await apiFetch(`${API_BASE_URL}/users/nickname`, {
    method: 'PUT',
    headers: createHeaders(undefined, true),
    body: JSON.stringify({ nickname }),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '닉네임 변경 중 오류가 발생했습니다.'))
  }

  return (body?.data ?? {}) as UpdateNicknameResponseData
}


interface UploadArticleImagesResponseData {
  urls?: string[]
}

interface UpdateProfileImageResponseData {
  profileImageUrl?: string
}

export async function uploadArticleImages(articleId: string | number, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const response = await apiFetch(`${API_BASE_URL}/article-images/${articleId}`, {
    method: 'POST',
    body: formData,
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '이미지 업로드 중 오류가 발생했습니다.'))
  }

  return (body?.data ?? { urls: [] }) as UploadArticleImagesResponseData
}

export async function updateProfileImageRequest(file: File) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await apiFetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    body: formData,
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '프로필 사진 변경 중 오류가 발생했습니다.'))
  }

  return (body?.data ?? {}) as UpdateProfileImageResponseData
}


interface RegisterRequestData {
  username: string
  nickname: string
  password: string
  email: string
}

interface UpdateNicknameResponseData {
  nickname?: string
}

interface MyPageResponseData {
  username?: string
  nickname?: string
  profileImageUrl?: string | null
  registered_at?: string
}

interface MyCommentItem {
  articleId: number
  commentId: number
  thumbnailImageUrl?: string | null
  title: string
  content: string
  wroteAt: string
}

interface MyLikeItem {
  articleId: number
  thumbnailImage?: string | null
  title: string
  wroteAt: string
  writerName: string
}

interface MyPagedResponse<T> {
  content: T[]
  hasNext: boolean
  page: number
  size: number
}

export async function fetchMyPage(skipBootstrapWait = false) {
  const response = await apiFetch(`${API_BASE_URL}/my`, {
    cache: 'no-store',
  }, true, !skipBootstrapWait)

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '마이페이지 정보를 불러오지 못했습니다.'))
  }

  return (body?.data ?? null) as MyPageResponseData | null
}

export async function fetchMyComments(page: number, size: number) {
  const response = await apiFetch(`${API_BASE_URL}/my/comments?page=${page}&size=${size}`, {
    cache: 'no-store',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '내가 쓴 댓글을 불러오지 못했습니다.'))
  }

  return (body?.data ?? { content: [], hasNext: false, page, size }) as MyPagedResponse<MyCommentItem>
}

export async function fetchMyLikes(page: number, size: number) {
  const response = await apiFetch(`${API_BASE_URL}/my/likes?page=${page}&size=${size}`, {
    cache: 'no-store',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '좋아요한 글을 불러오지 못했습니다.'))
  }

  return (body?.data ?? { content: [], hasNext: false, page, size }) as MyPagedResponse<MyLikeItem>
}


interface TagListItem {
  tagId: number
  tagName: string
  count: number
}

export async function fetchTags() {
  const response = await apiFetch(`${API_BASE_URL}/tags`, {
    cache: 'no-store',
  }, false)

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '태그 목록을 불러오지 못했습니다.'))
  }

  const tags = Array.isArray(body?.data?.tags) ? body.data.tags : []
  return tags.slice(0, 10) as TagListItem[]
}

export async function logoutRequest() {
  await waitForAuthBootstrap()
  await tryReissueAccessTokenSilently()

  const sendLogoutRequest = () => fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: createHeaders(),
  })

  let response = await sendLogoutRequest()
  let body = await parseJsonSafely(response)

  if (!response.ok && hasSessionMarker() && isAuthFailureResponse(response, body)) {
    await tryReissueAccessTokenSilently()
    response = await sendLogoutRequest()
    body = await parseJsonSafely(response)
  }

  if (!response.ok && isAuthFailureResponse(response, body)) {
    clearAccessToken()
    clearSessionMarker()
    return { response, body, skippedServerLogout: true }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '로그아웃 중 오류가 발생했습니다.'))
  }

  clearAccessToken()
  clearSessionMarker()
  return { response, body }
}


export async function likeArticle(articleId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/likes/${articleId}`, {
    method: 'POST',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '좋아요 요청에 실패했습니다.'))
  }

  return body
}

export async function unlikeArticle(articleId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/likes/${articleId}`, {
    method: 'DELETE',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '좋아요 취소 요청에 실패했습니다.'))
  }

  return body
}

export const fetchArticles = async (
  page: number,
  size: number,
  options?: { keyword?: string; tags?: string[] },
) => {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('page', String(page))
    searchParams.set('size', String(size))

    const trimmedKeyword = options?.keyword?.trim() ?? ''
    if (trimmedKeyword) {
      searchParams.set('keyword', trimmedKeyword)
    }

    const normalizedTags = Array.isArray(options?.tags)
      ? options.tags.map((tag) => tag.trim()).filter(Boolean)
      : []
    if (normalizedTags.length > 0) {
      searchParams.set('tags', normalizedTags.join(','))
    }

    const response = await apiFetch(`${API_BASE_URL}/articles?${searchParams.toString()}`)

    if (!response.ok) {
      const body = await parseJsonSafely(response)
      throw new Error(getErrorMessage(body, `HTTP error! status: ${response.status}`))
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    throw error
  }
}

interface FetchArticleEditResponseData {
  title?: string
  content?: string
  tags?: string[]
}

export async function fetchArticleEditDetail(articleId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}/edit`, {
    cache: 'no-store',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '게시글 수정 정보를 불러오지 못했습니다.'))
  }

  return (body?.data ?? {}) as FetchArticleEditResponseData
}

export const fetchArticleDetail = async (id: string) => {
  const cacheKey = String(id)
  const cached = articleDetailResponseCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const existingRequest = articleDetailInFlight.get(cacheKey)
  if (existingRequest) {
    return existingRequest
  }

  const requestPromise = (async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/articles/${id}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const body = await parseJsonSafely(response)
        throw new Error(getErrorMessage(body, `HTTP error! status: ${response.status}`))
      }

      const body = await response.json()
      articleDetailResponseCache.set(cacheKey, {
        value: body,
        expiresAt: Date.now() + ARTICLE_DETAIL_DEDUPE_TTL_MS,
      })
      return body
    } catch (error) {
      console.error('Failed to fetch article detail:', error)
      throw error
    } finally {
      articleDetailInFlight.delete(cacheKey)
    }
  })()

  articleDetailInFlight.set(cacheKey, requestPromise)
  return requestPromise
}

export const fetchArticleComments = async (articleId: string, page: number, size: number) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}/comments?page=${page}&size=${size}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await parseJsonSafely(response)
      throw new Error(getErrorMessage(body, `HTTP error! status: ${response.status}`))
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch article comments:', error)
    throw error
  }
}

export const fetchCommentReplies = async (commentId: string, page: number, size: number) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}/replies?page=${page}&size=${size}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await parseJsonSafely(response)
      throw new Error(getErrorMessage(body, `HTTP error! status: ${response.status}`))
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch comment replies:', error)
    throw error
  }
}


interface CreateDraftResponseData {
  id: number
}

interface PublishArticlePayload {
  title: string
  content: string
  tags: string[]
}

export async function createTempArticle() {
  const response = await apiFetch(`${API_BASE_URL}/articles`, {
    method: 'POST',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '임시 게시글 생성에 실패했습니다.'))
  }

  return (body?.data ?? null) as CreateDraftResponseData | null
}

export async function publishArticle(articleId: string | number, payload: PublishArticlePayload) {
  const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}/publish`, {
    method: 'POST',
    headers: createHeaders(undefined, true),
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
    }),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '게시글 발행에 실패했습니다.'))
  }

  return body?.data ?? null
}

interface UpdateArticlePayload {
  title: string
  content: string
  tags: string[]
}

export async function updateArticle(articleId: string | number, payload: UpdateArticlePayload) {
  const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}`, {
    method: 'PATCH',
    headers: createHeaders(undefined, true),
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
    }),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '게시글 수정에 실패했습니다.'))
  }

  return body?.data ?? null
}


interface CreateCommentPayload {
  content: string
  guestname?: string
  password?: string
}

interface UpdateCommentPayload {
  content: string
}

export async function createArticleComment(articleId: string | number, payload: CreateCommentPayload) {
  const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}/comments`, {
    method: 'POST',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(payload),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '댓글 등록에 실패했습니다.'))
  }

  return body?.data ?? null
}

export async function updateComment(commentId: string | number, payload: UpdateCommentPayload) {
  const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(payload),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '댓글 수정에 실패했습니다.'))
  }

  return body?.data ?? null
}


interface DeleteCommentPayload {
  password?: string
}

export async function deleteComment(commentId: string | number, payload?: DeleteCommentPayload) {
  const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(payload ?? {}),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '댓글 삭제에 실패했습니다.'))
  }

  return body?.data ?? null
}

export async function likeComment(commentId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '댓글 좋아요 요청에 실패했습니다.'))
  }

  return body?.data ?? null
}

export async function unlikeComment(commentId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: 'DELETE',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '댓글 좋아요 취소 요청에 실패했습니다.'))
  }

  return body?.data ?? null
}

export async function createCommentReply(
  articleId: string | number,
  commentId: string | number,
  payload: CreateCommentPayload,
) {
  void articleId

  const response = await apiFetch(`${API_BASE_URL}/comments/${commentId}/reply`, {
    method: 'POST',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(payload),
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '답글 등록에 실패했습니다.'))
  }

  return body?.data ?? null
}

export async function deleteArticle(articleId: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/articles/${articleId}`, {
    method: 'DELETE',
  })

  const body = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, '게시글 삭제에 실패했습니다.'))
  }

  return body?.data ?? null
}
