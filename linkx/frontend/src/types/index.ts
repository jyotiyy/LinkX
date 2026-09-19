export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  shortUrl: string;
  clickCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UrlListResponse {
  urls: ShortUrl[];
  pagination: PaginationMeta;
}

export interface DashboardSummary {
  totalLinks: number;
  totalClicks: number;
  topLink: ShortUrl | null;
  recentLinks: ShortUrl[];
}

export interface ClicksByDate {
  date: string;
  clicks: number;
}

export interface ReferrerSummary {
  referrer: string;
  count: number;
}

export interface UserAgentSummary {
  userAgent: string;
  count: number;
}

export interface UrlAnalytics {
  url: ShortUrl;
  totalClicks: number;
  createdAt: string;
  latestClickAt: string | null;
  clicksByDate: ClicksByDate[];
  referrerSummary: ReferrerSummary[];
  userAgentSummary: UserAgentSummary[];
}

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorShape;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
