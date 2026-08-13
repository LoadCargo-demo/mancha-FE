//실제 배포 서버 응답 구조 기준
// 3개 엔드포인트가 순서대로 이어지는 흐름: status(현재 확정 패키지) → event(지연 등
// 이벤트 발생 시 재조립 제안) → rebuild/apply(제안 적용 → 최종 결과)

import { apiFetch } from '@/lib/api-client';
import type { Package } from '@/api/negotiation/pipeline';

export type DrivingStatusResponse = {
  package: Package;
};

export function getDrivingStatus() {
  return apiFetch<DrivingStatusResponse>('/api/driving/status');
}

export type DrivingEventRequest = {
  // TODO: event_type이 Swagger에서 드롭다운(enum)이면 실제 허용값으로 교체하세요.
  event_type: 'DELAY' | string;
  order_id: string;
  delay_min: number;
  detail: string;
};

export type PackageDiff = {
  profit_diff: number;
  return_time_diff_min: number;
  empty_km_diff: number;
};

export type DrivingEventResponse = {
  should_notify: boolean;
  new_package: Package;
  diff: PackageDiff;
  tradeoff_text: string;
};

export function submitDrivingEvent(payload: DrivingEventRequest) {
  return apiFetch<DrivingEventResponse>('/api/driving/event', {
    method: 'POST',
    body: payload,
  });
}

export type RebuildApplyResponse = {
  status: string;
  package: Package;
  diff: PackageDiff;
};

export function applyRebuild() {
  return apiFetch<RebuildApplyResponse>('/api/driving/rebuild/apply', {
    method: 'POST',
  });
}
