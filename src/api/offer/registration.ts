import { apiFetch } from '@/lib/api-client';
import type {
  DriverConstraints,
  PrefillResponse,
  RegisterDayResponse,
} from '../negotiation/types';

/** 과거 패턴 + 기상 연동 기반 조건 프리필. 오퍼2·3 화면 초기값으로 씁니다. */
export function getRegistrationPrefill() {
  return apiFetch<PrefillResponse>('/api/registration/prefill');
}

/** 오퍼3 "등록하기" — 오퍼1~3에서 모은 조건을 한 번에 제출해 밤 설계 파이프라인을 트리거합니다. */
export function postRegisterDay(constraints: DriverConstraints) {
  return apiFetch<RegisterDayResponse>('/api/registration/day', {
    method: 'POST',
    body: constraints,
  });
}
