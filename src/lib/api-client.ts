// 프로덕션(Vercel)에서는 상대 경로를 써서 vercel.json의 /api rewrite 프록시를 타야 합니다.
// 절대 URL(http://...)을 쓰면 HTTPS 페이지에서 mixed content로 차단됩니다.
const BASE_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000');

function resolveDriverId(): string {
  const override = import.meta.env.VITE_DEMO_DRIVER_ID;
  if (override) return override;

  const key = 'mancha_driver_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// 백엔드 /api/registration/prefill 등에서 쿼리 파라미터로 받는 session_id.
// "프론트에서 기기/탭별로 발급하는 고유 세션 ID" — sessionStorage 기반이라
// 탭을 닫으면 사라지고, 새 탭/새 기기는 각자 다른 UUID를 받는다.
function resolveSessionId(): string {
  const key = 'mancha_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API Error ${status}`);
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** true면 driver_id를 자동으로 붙이지 않음 (기본은 항상 붙임) */
  skipDriverId?: boolean;
};

function withDriverId(path: string, skip?: boolean): string {
  if (skip) return path;
  const params = new URLSearchParams();
  params.set('driver_id', resolveDriverId());
  params.set('session_id', resolveSessionId());
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${params.toString()}`;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, skipDriverId, ...rest } = options;
  const url = `${BASE_URL}${withDriverId(path, skipDriverId)}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

export function connectSocket(path: string): WebSocket {
  const wsBase = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000';
  return new WebSocket(`${wsBase}${withDriverId(path)}`);
}
