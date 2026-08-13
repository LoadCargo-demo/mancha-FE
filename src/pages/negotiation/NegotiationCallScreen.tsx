// 오퍼-협상도착. AI가 전화로 오늘의 추천 오퍼를 브리핑하는 화면입니다.
// 상태 3단계: speaking(음성 재생 중) → idle(마이크 대기) → listening(실제 녹음+STT 인식 중).
// TTS/STT 둘 다 백엔드(/api/voice/tts, /api/voice/stt)를 거침 — 프론트에 API 키 없음.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Mic from '@iconify-react/material-symbols-light/mic';
import BarChart from '@iconify-react/material-symbols-light/bar-chart';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import { getVoiceBriefing } from '@/api/negotiation/briefing';
import { speechToText } from '../../api/negotiation/voice';
import type { VoiceBriefing } from '../../api/negotiation/types';
import { useNegotiationStore } from '../../store/useNegotiationStore';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import { GeminiTTS } from '@/hooks/GeminiTTS';

type CallPhase = 'speaking' | 'idle' | 'listening';

// STT 결과 캡션을 보여준 뒤 다음 화면으로 넘어가기까지 대기 시간
const RESULT_TO_NAVIGATE_DELAY_MS = 1200;

function today(): string {
  const date = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = days[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/** 녹음된 오디오 Blob을 서버에 보낼 수 있는 base64 문자열로 변환 (data URL 접두어 제거) */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function NegotiationCallScreen() {
  const navigate = useNavigate();
  const setRecommendedPackageId = useNegotiationStore(
    (s) => s.setRecommendedPackageId,
  );
  const { playTTS, isSpeaking } = GeminiTTS();
  const [phase, setPhase] = useState<CallPhase>('speaking');
  const [showHeardCaption, setShowHeardCaption] = useState(false);
  const [heardText, setHeardText] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<VoiceBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasStartedSpeakingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    getVoiceBriefing()
      .then((res) => {
        if (cancelled) return;
        setBriefing(res);
        setRecommendedPackageId(res.recommended_package_id);
      })
      .catch((err) => {
        if (!cancelled) console.error('브리핑 불러오기 실패:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setRecommendedPackageId]);

  // 브리핑 텍스트가 준비되면 바로 TTS 재생 시작 (자동 재생)
  useEffect(() => {
    if (!isLoading && briefing) {
      playTTS(briefing.briefing_text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, briefing]);

  // 가짜 타이머 대신, 실제 재생이 끝나는 시점(isSpeaking: true→false)에 idle로 전환
  useEffect(() => {
    if (isSpeaking) {
      hasStartedSpeakingRef.current = true;
      return;
    }
    if (hasStartedSpeakingRef.current && phase === 'speaking') {
      setPhase('idle');
    }
  }, [isSpeaking, phase]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (phase !== 'idle') return;

    setShowHeardCaption(false);
    setHeardText(null);
    setPhase('listening');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error('마이크 접근 실패:', err);
      setPhase('idle'); // 마이크 권한 거부 등 — 다시 시도할 수 있게 idle로 복귀
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;

      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const base64 = await blobToBase64(audioBlob);

      let recognizedText: string;
      try {
        const res = await speechToText({
          audio_base64: base64,
          mime_type: 'audio/webm',
        });
        recognizedText = res.text ?? '(인식 실패, 다시 시도해주세요)';
      } catch (err) {
        console.error('STT 요청 실패:', err);
        recognizedText = '(인식 실패, 다시 시도해주세요)';
      }

      setHeardText(recognizedText);
      setShowHeardCaption(true);
      // setHeardText는 비동기라 이 클로저에서 바로 못 읽으므로, 로컬 변수로 직접 넘긴다.
      window.setTimeout(
        () =>
          navigate(ROUTES.negotiationResult, {
            state: { heardText: recognizedText },
          }),
        RESULT_TO_NAVIGATE_DELAY_MS,
      );
    };

    recorder.stop();
  };

  return (
    <div className="flex h-dvh mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        type="Briefing"
        dateLabel={today()}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col gap-[16px] px-[var(--spacing-screen)] pt-[16px]">
        <div className="flex flex-col gap-[12px] rounded-[12px] bg-[var(--color-gray-100)] p-[16px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
              만차 에이전트
            </span>
            <span className="rounded-full bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
              AI 음성 생성됨
            </span>
          </div>

          <p className="whitespace-pre-line text-[17px] font-bold leading-[1.5] text-[color:var(--color-text-primary)]">
            {isLoading || !briefing
              ? '오늘의 브리핑을 준비하고 있어요...'
              : briefing.briefing_text}
          </p>

          {phase === 'speaking' && (
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-center gap-[3px] py-[8px]">
                <BarChart
                  width="28"
                  height="28"
                  className={`text-[color:var(--color-action-primary)] ${
                    isSpeaking ? 'animate-pulse' : 'opacity-40'
                  }`}
                />
              </div>
              <p className="text-center text-[11px] text-[color:var(--color-text-secondary)]">
                {isSpeaking ? '음성 재생 중...' : '음성 준비 중...'}
              </p>
            </div>
          )}

          {(phase === 'idle' || phase === 'listening') && (
            <div className="flex flex-col items-center gap-[8px] py-[12px]">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={() => phase === 'listening' && stopRecording()}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                aria-label={
                  phase === 'listening'
                    ? '듣고 있어요 (떼면 전송)'
                    : '누르고 있는 동안 답하기'
                }
                className={`flex size-[56px] items-center justify-center rounded-full transition-colors select-none ${
                  phase === 'listening'
                    ? 'bg-[var(--color-action-primary)] scale-110'
                    : 'bg-[var(--color-white-1000)] shadow-[0px_2px_8px_var(--color-black-alpha-8)]'
                }`}
              >
                <Mic
                  width="24"
                  height="24"
                  className={
                    phase === 'listening'
                      ? 'text-[color:var(--color-text-inverse)]'
                      : 'text-[color:var(--color-action-primary)]'
                  }
                />
              </button>
              <span className="text-[13px] text-[color:var(--color-text-secondary)]">
                {phase === 'listening'
                  ? '듣고 있어요... (떼면 전송)'
                  : '누르고 있는 동안 답하기'}
              </span>
              {phase === 'listening' && showHeardCaption && heardText && (
                <span className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                  {heardText}
                </span>
              )}
            </div>
          )}
        </div>

        {briefing && (
          <div className="flex gap-[8px]">
            <div className="flex-1 rounded-[12px] bg-[var(--color-gray-100)] p-[12px]">
              <p className="text-[12px] text-[color:var(--color-text-secondary)]">
                예상 대기
              </p>
              <p className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                {briefing.expected_wait_min}분
              </p>
            </div>
            <div className="flex-1 rounded-[12px] bg-[var(--color-gray-100)] p-[12px]">
              <p className="text-[12px] text-[color:var(--color-text-secondary)]">
                성사 확률
              </p>
              <p className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                {Math.round(briefing.success_probability * 100)}%
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomCTA
        type="Briefing"
        onPrimaryClick={() => navigate(ROUTES.offer)}
        onSecondaryClick={() => navigate(ROUTES.negotiationEvidence)}
        onTertiaryClick={() => navigate(ROUTES.negotiationCompare)}
      />
    </div>
  );
}
