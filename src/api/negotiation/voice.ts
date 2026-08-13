import { apiFetch } from '@/lib/api-client';

export type STTRequest = {
  audio_base64: string;
  mime_type?: string;
};

export type STTResponse = {
  text: string | null;
};

export function speechToText(payload: STTRequest) {
  return apiFetch<STTResponse>('/api/voice/stt', {
    method: 'POST',
    body: payload,
  });
}
