import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Cpu,
  HardDrive,
  Heart,
  MessageSquare,
  Server,
  Users,
} from 'lucide-react';

export type RangePreset = 'today' | 'week' | 'month' | 'custom';

export type TimePoint = {
  label: string;
  visitors: number;
  views: number;
  comments: number;
  likes: number;
  previousVisitors: number;
  previousViews: number;
  previousComments: number;
  previousLikes: number;
};

export type RankedPost = {
  title: string;
  views: number;
  deltaPercent: number;
  trend: 'up' | 'down' | 'flat';
};

export type VisitorRow = {
  name: string;
  type: '회원' | '비회원';
  visits: number;
  client: string;
};

export type MemberRow = {
  nickname: string;
  role: 'ROLE_ADMIN' | 'ROLE_USER';
  lastSeen: string;
  client: string;
  likes: number;
  comments: number;
};

export type ManagedPostRow = {
  id: number;
  title: string;
  status: '게시중' | '삭제됨';
  writer: string;
  views: number;
  deletedAt?: string;
  updatedAt: string;
};

export type ManagedCommentRow = {
  id: number;
  articleTitle: string;
  author: string;
  authorType: '회원' | '비회원';
  status: '활성' | '삭제됨';
  likes: number;
  createdAt: string;
  deletedAt?: string;
};

export type EndpointRow = {
  endpoint: string;
  requests: number;
  avgMs: number;
  errorRate: number;
};

export type MetricBundle = {
  summary: {
    visitors: number;
    comments: number;
    likes: number;
    avgResponseMs: number;
    requestsLastFiveMin: number;
  };
  history: TimePoint[];
  topPosts: RankedPost[];
  visitorsRank: VisitorRow[];
};

export const rangeLabels: Record<RangePreset, string> = {
  today: '오늘',
  week: '이번주',
  month: '이번달',
  custom: '직접 선택',
};

export const analyticsByRange: Record<Exclude<RangePreset, 'custom'>, MetricBundle> = {
  today: {
    summary: {
      visitors: 128,
      comments: 19,
      likes: 42,
      avgResponseMs: 142,
      requestsLastFiveMin: 84,
    },
    history: [
      { label: '09', visitors: 8, views: 12, comments: 1, likes: 3, previousVisitors: 6, previousViews: 9, previousComments: 1, previousLikes: 2 },
      { label: '10', visitors: 13, views: 22, comments: 2, likes: 5, previousVisitors: 11, previousViews: 18, previousComments: 1, previousLikes: 4 },
      { label: '11', visitors: 17, views: 29, comments: 2, likes: 6, previousVisitors: 14, previousViews: 24, previousComments: 2, previousLikes: 5 },
      { label: '12', visitors: 21, views: 35, comments: 3, likes: 8, previousVisitors: 18, previousViews: 31, previousComments: 2, previousLikes: 7 },
      { label: '13', visitors: 16, views: 28, comments: 2, likes: 5, previousVisitors: 17, previousViews: 29, previousComments: 3, previousLikes: 5 },
      { label: '14', visitors: 22, views: 40, comments: 4, likes: 7, previousVisitors: 19, previousViews: 35, previousComments: 3, previousLikes: 6 },
      { label: '15', visitors: 31, views: 51, comments: 5, likes: 8, previousVisitors: 24, previousViews: 43, previousComments: 4, previousLikes: 7 },
    ],
    topPosts: [
      { title: 'Blue-Green 배포 전략 정리', views: 134, deltaPercent: 18, trend: 'up' },
      { title: 'JPA Native Query 최적화 경험', views: 122, deltaPercent: 15, trend: 'up' },
      { title: 'CORS 이슈 해결 기록', views: 101, deltaPercent: 9, trend: 'up' },
      { title: 'OAuth 로그인 흐름 구현', views: 96, deltaPercent: 8, trend: 'up' },
      { title: '트랜잭션 격리수준 실전 이해', views: 90, deltaPercent: 6, trend: 'up' },
      { title: 'Spring Security 인가 설계', views: 75, deltaPercent: 4, trend: 'up' },
      { title: '도커 배포 트러블슈팅', views: 69, deltaPercent: 3, trend: 'up' },
      { title: '댓글/좋아요 동시성 처리', views: 64, deltaPercent: 2, trend: 'up' },
      { title: 'Next.js 블로그 연동', views: 52, deltaPercent: 2, trend: 'up' },
      { title: 'Grafana 대시보드 구축', views: 47, deltaPercent: 1, trend: 'up' },
    ],
    visitorsRank: [
      { name: 'DEV_Cheeze', type: '회원', visits: 17, client: 'Chrome / macOS' },
      { name: '172.31.2.19', type: '비회원', visits: 12, client: 'Chrome / Windows' },
      { name: 'lee_admin', type: '회원', visits: 10, client: 'Safari / iPhone' },
      { name: '203.0.113.44', type: '비회원', visits: 8, client: 'Edge / Windows' },
      { name: 'API_TESTER', type: '회원', visits: 7, client: 'Firefox / Linux' },
    ],
  },
  week: {
    summary: {
      visitors: 864,
      comments: 103,
      likes: 228,
      avgResponseMs: 156,
      requestsLastFiveMin: 513,
    },
    history: [
      { label: 'Mon', visitors: 92, views: 161, comments: 11, likes: 26, previousVisitors: 84, previousViews: 148, previousComments: 10, previousLikes: 22 },
      { label: 'Tue', visitors: 121, views: 201, comments: 14, likes: 31, previousVisitors: 109, previousViews: 182, previousComments: 12, previousLikes: 27 },
      { label: 'Wed', visitors: 138, views: 233, comments: 16, likes: 34, previousVisitors: 131, previousViews: 220, previousComments: 15, previousLikes: 30 },
      { label: 'Thu', visitors: 144, views: 248, comments: 18, likes: 36, previousVisitors: 141, previousViews: 244, previousComments: 17, previousLikes: 35 },
      { label: 'Fri', visitors: 126, views: 219, comments: 13, likes: 29, previousVisitors: 133, previousViews: 224, previousComments: 15, previousLikes: 31 },
      { label: 'Sat', visitors: 109, views: 186, comments: 12, likes: 22, previousVisitors: 101, previousViews: 175, previousComments: 10, previousLikes: 20 },
      { label: 'Sun', visitors: 134, views: 241, comments: 19, likes: 50, previousVisitors: 121, previousViews: 219, previousComments: 16, previousLikes: 42 },
    ],
    topPosts: [
      { title: 'JPA Native Query 최적화 경험', views: 824, deltaPercent: 22, trend: 'up' },
      { title: 'Blue-Green 배포 전략 정리', views: 781, deltaPercent: 20, trend: 'up' },
      { title: '트랜잭션 격리수준 실전 이해', views: 699, deltaPercent: 16, trend: 'up' },
      { title: 'OAuth 로그인 흐름 구현', views: 648, deltaPercent: 14, trend: 'up' },
      { title: 'CORS 이슈 해결 기록', views: 637, deltaPercent: 13, trend: 'up' },
      { title: 'Spring Security 인가 설계', views: 593, deltaPercent: 12, trend: 'up' },
      { title: '도커 배포 트러블슈팅', views: 582, deltaPercent: 10, trend: 'up' },
      { title: '댓글/좋아요 동시성 처리', views: 546, deltaPercent: 9, trend: 'up' },
      { title: 'Next.js 블로그 연동', views: 517, deltaPercent: 8, trend: 'up' },
      { title: 'Grafana 대시보드 구축', views: 472, deltaPercent: 7, trend: 'up' },
    ],
    visitorsRank: [
      { name: 'DEV_Cheeze', type: '회원', visits: 54, client: 'Chrome / macOS' },
      { name: '172.31.2.19', type: '비회원', visits: 42, client: 'Chrome / Windows' },
      { name: 'lee_admin', type: '회원', visits: 31, client: 'Safari / iPhone' },
      { name: '203.0.113.44', type: '비회원', visits: 27, client: 'Edge / Windows' },
      { name: 'API_TESTER', type: '회원', visits: 24, client: 'Firefox / Linux' },
    ],
  },
  month: {
    summary: {
      visitors: 3482,
      comments: 411,
      likes: 968,
      avgResponseMs: 163,
      requestsLastFiveMin: 1832,
    },
    history: [
      { label: '1주', visitors: 682, views: 1210, comments: 76, likes: 214, previousVisitors: 641, previousViews: 1182, previousComments: 71, previousLikes: 206 },
      { label: '2주', visitors: 744, views: 1328, comments: 94, likes: 235, previousVisitors: 699, previousViews: 1264, previousComments: 87, previousLikes: 224 },
      { label: '3주', visitors: 901, views: 1542, comments: 108, likes: 249, previousVisitors: 860, previousViews: 1497, previousComments: 101, previousLikes: 241 },
      { label: '4주', visitors: 1155, views: 1816, comments: 133, likes: 270, previousVisitors: 1079, previousViews: 1692, previousComments: 124, previousLikes: 259 },
    ],
    topPosts: [
      { title: 'JPA Native Query 최적화 경험', views: 3242, deltaPercent: 31, trend: 'up' },
      { title: 'Blue-Green 배포 전략 정리', views: 3160, deltaPercent: 28, trend: 'up' },
      { title: '트랜잭션 격리수준 실전 이해', views: 2893, deltaPercent: 21, trend: 'up' },
      { title: 'Spring Security 인가 설계', views: 2711, deltaPercent: 19, trend: 'up' },
      { title: 'OAuth 로그인 흐름 구현', views: 2642, deltaPercent: 18, trend: 'up' },
      { title: 'CORS 이슈 해결 기록', views: 2514, deltaPercent: 16, trend: 'up' },
      { title: '도커 배포 트러블슈팅', views: 2449, deltaPercent: 14, trend: 'up' },
      { title: 'Next.js 블로그 연동', views: 2331, deltaPercent: 13, trend: 'up' },
      { title: 'Grafana 대시보드 구축', views: 2190, deltaPercent: 12, trend: 'up' },
      { title: '댓글/좋아요 동시성 처리', views: 2081, deltaPercent: 10, trend: 'up' },
    ],
    visitorsRank: [
      { name: 'DEV_Cheeze', type: '회원', visits: 164, client: 'Chrome / macOS' },
      { name: '172.31.2.19', type: '비회원', visits: 138, client: 'Chrome / Windows' },
      { name: 'lee_admin', type: '회원', visits: 94, client: 'Safari / iPhone' },
      { name: '203.0.113.44', type: '비회원', visits: 81, client: 'Edge / Windows' },
      { name: 'API_TESTER', type: '회원', visits: 66, client: 'Firefox / Linux' },
    ],
  },
};

export const customRangeBundle: MetricBundle = {
  summary: {
    visitors: 642,
    comments: 71,
    likes: 149,
    avgResponseMs: 148,
    requestsLastFiveMin: 266,
  },
  history: [
    { label: '03/18', visitors: 91, views: 151, comments: 10, likes: 22, previousVisitors: 84, previousViews: 142, previousComments: 8, previousLikes: 18 },
    { label: '03/19', visitors: 97, views: 163, comments: 11, likes: 24, previousVisitors: 89, previousViews: 151, previousComments: 9, previousLikes: 22 },
    { label: '03/20', visitors: 88, views: 149, comments: 9, likes: 21, previousVisitors: 94, previousViews: 158, previousComments: 10, previousLikes: 20 },
    { label: '03/21', visitors: 103, views: 181, comments: 13, likes: 28, previousVisitors: 92, previousViews: 166, previousComments: 12, previousLikes: 24 },
    { label: '03/22', visitors: 74, views: 124, comments: 8, likes: 15, previousVisitors: 69, previousViews: 117, previousComments: 6, previousLikes: 12 },
    { label: '03/23', visitors: 82, views: 139, comments: 7, likes: 18, previousVisitors: 77, previousViews: 131, previousComments: 7, previousLikes: 16 },
    { label: '03/24', visitors: 107, views: 188, comments: 13, likes: 21, previousVisitors: 99, previousViews: 174, previousComments: 12, previousLikes: 19 },
  ],
  topPosts: [
    { title: 'Blue-Green 배포 전략 정리', views: 502, deltaPercent: 11, trend: 'up' },
    { title: 'JPA Native Query 최적화 경험', views: 481, deltaPercent: 9, trend: 'up' },
    { title: 'CORS 이슈 해결 기록', views: 429, deltaPercent: 5, trend: 'up' },
    { title: 'OAuth 로그인 흐름 구현', views: 417, deltaPercent: 5, trend: 'up' },
    { title: '트랜잭션 격리수준 실전 이해', views: 391, deltaPercent: 4, trend: 'up' },
    { title: 'Spring Security 인가 설계', views: 352, deltaPercent: 2, trend: 'up' },
    { title: '도커 배포 트러블슈팅', views: 311, deltaPercent: -1, trend: 'down' },
    { title: '댓글/좋아요 동시성 처리', views: 294, deltaPercent: 1, trend: 'up' },
    { title: 'Next.js 블로그 연동', views: 286, deltaPercent: 0, trend: 'flat' },
    { title: 'Grafana 대시보드 구축', views: 244, deltaPercent: -2, trend: 'down' },
  ],
  visitorsRank: [
    { name: 'DEV_Cheeze', type: '회원', visits: 41, client: 'Chrome / macOS' },
    { name: '172.31.2.19', type: '비회원', visits: 35, client: 'Chrome / Windows' },
    { name: 'lee_admin', type: '회원', visits: 22, client: 'Safari / iPhone' },
    { name: '203.0.113.44', type: '비회원', visits: 18, client: 'Edge / Windows' },
    { name: 'API_TESTER', type: '회원', visits: 16, client: 'Firefox / Linux' },
  ],
};

export const warnLogs = [
  '[WARN] 2026-03-26 14:11:23 [SecurityExceptionHandlerFilter] JWT token expired for request GET /api/v1/my',
  '[WARN] 2026-03-26 13:57:48 [CommentService] Guest comment deletion attempted with invalid password',
  '[WARN] 2026-03-26 13:22:16 [S3Util] Failed to load object metadata, fallback CDN url served',
  '[WARN] 2026-03-26 12:49:02 [LikeService] Duplicate like request detected, unique constraint prevented insert',
  '[WARN] 2026-03-26 11:31:14 [CorsFilter] Origin mismatch rejected for https://portfolio-lee.dev',
];

export const members: MemberRow[] = [
  { nickname: 'DEV_Cheeze', role: 'ROLE_ADMIN', lastSeen: '2026-03-26 15:02', client: 'Chrome 146 / macOS', likes: 74, comments: 19 },
  { nickname: 'lee_admin', role: 'ROLE_USER', lastSeen: '2026-03-26 14:34', client: 'Safari / iPhone', likes: 28, comments: 11 },
  { nickname: 'API_TESTER', role: 'ROLE_USER', lastSeen: '2026-03-26 11:42', client: 'Firefox / Linux', likes: 12, comments: 7 },
  { nickname: 'guest_monitor', role: 'ROLE_USER', lastSeen: '2026-03-25 23:58', client: 'Edge / Windows', likes: 6, comments: 4 },
  { nickname: 'observer_k', role: 'ROLE_USER', lastSeen: '2026-03-25 21:11', client: 'Chrome / Windows', likes: 4, comments: 3 },
];

export const managedPosts: ManagedPostRow[] = [
  { id: 42, title: 'Blue-Green 배포 전략 정리', status: '게시중', writer: 'DEV_Cheeze', views: 3242, updatedAt: '2026-03-26 10:44' },
  { id: 31, title: 'Nginx HTTPS 설정 실수 기록', status: '삭제됨', writer: 'lee_admin', views: 812, deletedAt: '2026-03-24 18:22', updatedAt: '2026-03-24 18:22' },
  { id: 29, title: 'OAuth 임시 테스트 글', status: '삭제됨', writer: 'DEV_Cheeze', views: 112, deletedAt: '2026-03-21 12:45', updatedAt: '2026-03-21 12:45' },
  { id: 18, title: 'JPA Native Query 최적화 경험', status: '게시중', writer: 'DEV_Cheeze', views: 2893, updatedAt: '2026-03-26 09:10' },
  { id: 14, title: 'Actuator 모니터링 실험 초안', status: '삭제됨', writer: 'API_TESTER', views: 203, deletedAt: '2026-03-20 17:10', updatedAt: '2026-03-20 17:10' },
];

export const managedComments: ManagedCommentRow[] = [
  { id: 301, articleTitle: 'Blue-Green 배포 전략 정리', author: 'DEV_Cheeze', authorType: '회원', status: '활성', likes: 8, createdAt: '2026-03-26 14:10' },
  { id: 287, articleTitle: 'JPA Native Query 최적화 경험', author: '172.31.2.19', authorType: '비회원', status: '삭제됨', likes: 0, createdAt: '2026-03-25 09:02', deletedAt: '2026-03-25 09:11' },
  { id: 271, articleTitle: 'CORS 이슈 해결 기록', author: 'lee_admin', authorType: '회원', status: '활성', likes: 5, createdAt: '2026-03-24 21:08' },
  { id: 266, articleTitle: 'OAuth 로그인 흐름 구현', author: '203.0.113.44', authorType: '비회원', status: '삭제됨', likes: 0, createdAt: '2026-03-24 20:52', deletedAt: '2026-03-24 21:03' },
  { id: 241, articleTitle: 'Spring Security 인가 설계', author: 'API_TESTER', authorType: '회원', status: '활성', likes: 1, createdAt: '2026-03-22 16:20' },
];

export const endpointTraffic: EndpointRow[] = [
  { endpoint: 'GET /api/v1/articles', requests: 328, avgMs: 124, errorRate: 0.4 },
  { endpoint: 'GET /api/v1/articles/{id}', requests: 281, avgMs: 138, errorRate: 0.3 },
  { endpoint: 'POST /api/v1/comments/{id}/reply', requests: 74, avgMs: 166, errorRate: 0.9 },
  { endpoint: 'POST /api/v1/like/{id}', requests: 63, avgMs: 97, errorRate: 0.2 },
  { endpoint: 'GET /api/v1/tags', requests: 52, avgMs: 82, errorRate: 0.1 },
  { endpoint: 'GET /actuator/prometheus', requests: 21, avgMs: 244, errorRate: 0.0 },
];

export const performanceTrend = [
  { label: '-5m', response: 172, error: 1.4, requests: 302 },
  { label: '-4m', response: 163, error: 1.2, requests: 318 },
  { label: '-3m', response: 158, error: 0.9, requests: 336 },
  { label: '-2m', response: 146, error: 0.8, requests: 347 },
  { label: '-1m', response: 141, error: 0.6, requests: 351 },
  { label: 'now', response: 139, error: 0.7, requests: 364 },
];

export const performanceCards: Array<{ key: string; label: string; value: string; rawValue: number; unit: string; icon: LucideIcon }> = [
  { key: 'uptime', label: '서버 업타임', value: '14d 08h', rawValue: 14.3, unit: 'days', icon: Server },
  { key: 'cpu', label: 'CPU Usage', value: '37%', rawValue: 37, unit: 'percent', icon: Cpu },
  { key: 'ram', label: 'RAM Usage', value: '62%', rawValue: 62, unit: 'percent', icon: Activity },
  { key: 'disk', label: '디스크 여유 공간', value: '18.4GB', rawValue: 18.4, unit: 'gb', icon: HardDrive },
  { key: 'response', label: '평균 API 응답시간', value: '139ms', rawValue: 139, unit: 'ms', icon: Activity },
  { key: 'error', label: '에러율', value: '0.7%', rawValue: 0.7, unit: 'error_rate', icon: Activity },
];

export const adminCategoryStats = [
  { label: '활성 회원', value: '124', icon: Users },
  { label: '오늘 방문', value: '128', icon: Users },
  { label: '활성 댓글', value: '1,284', icon: MessageSquare },
  { label: '좋아요 누적', value: '4,209', icon: Heart },
];


export const deletedPosts = managedPosts
  .filter((item) => item.status === '삭제됨')
  .map((item) => ({
    title: item.title,
    deletedAt: item.deletedAt ?? item.updatedAt,
    status: '복구 가능' as const,
  }));

export const deletedComments = managedComments
  .filter((item) => item.status === '삭제됨')
  .map((item) => ({
    title: `${item.articleTitle} · ${item.author}`,
    deletedAt: item.deletedAt ?? item.createdAt,
    status: '복구 가능' as const,
  }));
