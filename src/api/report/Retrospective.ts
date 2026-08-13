import { apiFetch } from '@/lib/api-client';

export type RetrospectiveSummaryResponse = {
  today_empty_km: number;
  last_week_empty_km: number;
  predicted_profit: number;
  actual_profit: number;
  predicted_wait_min: number;
  actual_wait_min: number;
  wait_diff_min: number;
  predicted_return: string; // "HH:MM"
  actual_return: string; // "HH:MM"
  structural_cause: string; // AI 운행 코치가 보여줄 원인 분석 문장
  note: string; // "규칙 기반이며 실제 ML 모델은 사용하지 않습니다" 같은 투명성 고지
};

export function getRetrospectiveSummary() {
  return apiFetch<RetrospectiveSummaryResponse>('/api/retrospective/summary');
}

export type VoiceNoteRequest = {
  text: string;
};

export function submitVoiceNote(payload: VoiceNoteRequest) {
  return apiFetch<string>('/api/retrospective/voice-note', {
    method: 'POST',
    body: payload,
  });
}
