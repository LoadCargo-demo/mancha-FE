import { apiFetch } from '@/lib/api-client';
import type { QnaResponse } from '../negotiation/types';

/** 근거 기반 답변 생성(RAG) — 839 화면에서 음성으로 되물었을 때 씁니다. */
export function askQuestion(question: string) {
  return apiFetch<QnaResponse>('/api/qna/ask', {
    method: 'POST',
    body: { question },
  });
}
