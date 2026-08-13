import { apiFetch } from '@/lib/api-client';
import type {
  ConfirmResponse,
  PackageComparisonResponse,
  VoiceBriefing,
} from '../negotiation/types';

/** 30초 음성 브리핑 텍스트 — 협상도착 화면 상단 멘트. */
export function getVoiceBriefing() {
  return apiFetch<VoiceBriefing>('/api/briefing/voice');
}

/** 패키지 3안 비교 — 840 화면. */
export function getBriefingCompare() {
  return apiFetch<PackageComparisonResponse>('/api/briefing/compare');
}

/** 보정 내역(명목 vs 실수익) — 근거조회 화면. */
export function getBriefingAdjustment() {
  return apiFetch<PackageComparisonResponse>('/api/briefing/adjustment');
}

/** 확정 실행 → 확정된 하루 화면 데이터 반환. 오퍼요약 화면에서 씁니다. */
export function postBriefingConfirm(packageId: string) {
  return apiFetch<ConfirmResponse>(
    `/api/briefing/confirm?package_id=${encodeURIComponent(packageId)}`,
    { method: 'POST' },
  );
}
