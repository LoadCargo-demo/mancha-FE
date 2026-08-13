import { useState, useRef, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useToastStore } from '@/store/useToastStore';

// WAV 헤더 변환 함수 (PCM 데이터를 브라우저에서 재생 가능한 WAV로 변환)
// — 백엔드로 옮긴 뒤에도 그대로 재사용 (백엔드가 주는 것도 동일한 raw PCM base64)
function createWavUrl(base64Data: string): string {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;

  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);

  new Uint8Array(buffer, 44).set(bytes);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * 우리 백엔드(/api/voice/tts)를 호출해서 base64 오디오를 받아온다.
 * Gemini API 키는 이제 프론트에 전혀 없음 — 백엔드 환경변수에만 존재.
 */
async function fetchTTSAudioBase64(
  text: string,
  voiceName: string,
): Promise<string | null> {
  try {
    const res = await apiFetch<{
      audio_base64: string | null;
      error_message?: string | null;
    }>('/api/voice/tts', {
      method: 'POST',
      body: { text, voice_name: voiceName },
    });

    // Gemini 쿼터 초과 등 백엔드가 명시적으로 실패를 알려준 경우 — 토스트만 띄우고
    // 나머지 화면은 정상 동작해야 하므로 에러를 던지지 않고 null만 반환한다.
    if (res.error_message) {
      useToastStore.getState().showToast(res.error_message);
      return null;
    }

    return res.audio_base64;
  } catch (error) {
    console.error('TTS 백엔드 호출 실패:', error);
    return null;
  }
}

export function GeminiTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 재생 진행률 표시용 (예: "22초 / 30초"). audio 엘리먼트의
  // timeupdate/loadedmetadata 이벤트로 갱신됩니다.
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 새로 만든 audio 엘리먼트에 진행률 추적 리스너를 붙인다.
  const attachProgressListeners = useCallback((audio: HTMLAudioElement) => {
    const handleLoadedMetadata = () => {
      // 스트리밍 등으로 duration이 Infinity로 잡히는 경우 방어
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // 음성 재생 강제 정지
  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // [Pre-fetching] 텍스트를 백엔드에 보내서 음성 URL만 '미리' 만들어 반환
  const preloadTTS = useCallback(
    async (
      text: string,
      voiceName: string = 'Aoede',
    ): Promise<string | null> => {
      if (!text || text.trim() === '') return null;

      const base64Audio = await fetchTTSAudioBase64(text, voiceName);
      if (base64Audio) {
        return createWavUrl(base64Audio);
      }
      return null;
    },
    [],
  );

  // [즉시 재생] 미리 만들어둔 URL을 딜레이 없이 바로 재생
  const playPreloadedTTS = useCallback(
    async (audioSrc: string) => {
      stopTTS();
      setIsSpeaking(true);
      try {
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        attachProgressListeners(audio);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioSrc); // 다 읽으면 메모리 비우기
        };
        await audio.play().catch((err) => {
          console.error('오디오 자동 재생이 차단되었습니다:', err);
          setIsSpeaking(false);
        });
      } catch (error) {
        console.error('미리 로드된 TTS 재생 실패:', error);
        setIsSpeaking(false);
      }
    },
    [stopTTS, attachProgressListeners],
  );

  // [일반 재생] 텍스트를 받아서 바로 백엔드 호출 후 재생 (기존 방식)
  const playTTS = useCallback(
    async (text: string, voiceName: string = 'Aoede') => {
      if (!text || text.trim() === '') return;

      stopTTS(); // 재생 중인 게 있으면 멈춤
      setIsSpeaking(true);

      const base64Audio = await fetchTTSAudioBase64(text, voiceName);

      if (!base64Audio) {
        setIsSpeaking(false);
        return;
      }

      const audioSrc = createWavUrl(base64Audio);
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      attachProgressListeners(audio);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioSrc);
      };

      await audio.play().catch((err) => {
        console.error('오디오 자동 재생이 차단되었습니다:', err);
        setIsSpeaking(false);
      });
    },
    [stopTTS, attachProgressListeners],
  );

  // 컴포넌트 언마운트 시 오디오 정지 및 메모리 정리
  useEffect(() => {
    return () => stopTTS();
  }, [stopTTS]);

  return {
    playTTS,
    stopTTS,
    preloadTTS,
    playPreloadedTTS,
    isSpeaking,
    currentTime,
    duration,
  };
}
