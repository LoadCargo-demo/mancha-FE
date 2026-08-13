const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const DEMO_DRIVER_ID = import.meta.env.VITE_DEMO_DRIVER_ID ?? 'driver_kimmansu';

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
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}driver_id=${encodeURIComponent(DEMO_DRIVER_ID)}`;
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

function connectSocket(path: string): WebSocket {
  const wsBase = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000';
  return new WebSocket(`${wsBase}${withDriverId(path)}`);
}
