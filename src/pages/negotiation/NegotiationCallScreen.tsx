// 오퍼-협상도착. AI가 전화로 오늘의 추천 오퍼를 브리핑하는 화면입니다.
// 상태 3단계: speaking(음성 재생 중) → idle(마이크 대기) → listening(실제 녹음+STT 인식 중).
// TTS/STT 둘 다 백엔드(/api/voice/tts, /api/voice/stt)를 거침 — 프론트에 API 키 없음.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imgMicIcon from '../../assets/icons/mic.svg';
import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import { ROUTES } from '../../router/routes';
import { getVoiceBriefing } from '@/api/negotiation/briefing';
import { speechToText } from '../../api/negotiation/voice';
import type { VoiceBriefing } from '../../api/negotiation/types';
import { useNegotiationStore } from '../../store/useNegotiationStore';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import { GeminiTTS } from '@/hooks/GeminiTTS';
import { useToastStore } from '@/store/useToastStore';

type CallPhase = 'speaking' | 'idle' | 'listening';

// STT 결과 캡션을 보여준 뒤 다음 화면으로 넘어가기까지 대기 시간
const RESULT_TO_NAVIGATE_DELAY_MS = 1200;

function today(): string {
  const date = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = days[date.getDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
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
  const { playTTS, isSpeaking, currentTime, duration } = GeminiTTS();
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
        // Gemini 쿼터 초과 등으로 백엔드가 error_message를 채워 보낸 경우 —
        // 토스트로 안내하고 나머지 흐름은 '인식 실패'와 동일하게 조용히 넘어간다.
        const errorMessage = (res as { error_message?: string | null })
          .error_message;
        if (errorMessage) {
          useToastStore.getState().showToast(errorMessage);
          recognizedText = '(인식 실패, 다시 시도해주세요)';
        } else {
          recognizedText = res.text ?? '(인식 실패, 다시 시도해주세요)';
        }
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
    <div className="flex h-[100dvh] mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        type="Briefing"
        dateLabel={today()}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col items-start overflow-auto bg-[var(--color-white-1000)] py-[20px]">
        {/* AgentMessage */}
        <div className="flex w-full flex-col items-center px-[20px] pb-[16px]">
          <div className="w-full rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col items-center p-[25px]">
              <div className="flex flex-col items-center gap-[4px]">
                <span className="text-[12px] font-semibold text-[color:var(--color-gray-600)]">
                  만차 에이전트
                </span>
                <span className="rounded-[4px] bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
                  AI 음성 생성됨
                </span>
              </div>

              <div className="flex flex-col items-center gap-[4px] pt-[20px] text-center text-[20px] font-bold leading-[1.45] text-[color:var(--color-text-primary)]">
                {(isLoading || !briefing
                  ? ['오늘의 브리핑을 준비하고 있어요...']
                  : briefing.briefing_text.split('\n')
                ).map((line, i) => (
                  // '협상' 관련 줄만 강조색 처리 — 실제로는 API가 강조할 구간을 구조화해서
                  // 내려주는 게 더 안전하지만, 지금은 문자열 매칭으로 대체합니다.
                  <p
                    key={i}
                    className={
                      line.includes('협상')
                        ? 'text-[color:var(--color-action-primary)]'
                        : undefined
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>

              {phase === 'speaking' && (
                <div className="flex w-full flex-col items-center gap-[16px] pt-[24px]">
                  <style>{`
                    @keyframes eq-bounce {
                      0%, 100% { transform: scaleY(0.35); }
                      50% { transform: scaleY(1); }
                    }
                  `}</style>
                  <div className="flex h-[32px] items-end gap-[3px]">
                    {[14, 14, 11, 31, 8, 29].map((h, i) => (
                      <div
                        key={i}
                        className="w-[4px] origin-bottom rounded-[2px] bg-[var(--color-action-primary)]"
                        style={{
                          height: `${h}px`,
                          animation: isSpeaking
                            ? `eq-bounce ${0.6 + (i % 3) * 0.15}s ease-in-out ${i * 0.08}s infinite`
                            : 'none',
                          opacity: isSpeaking ? 1 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex w-full flex-col gap-[8px] px-[8px]">
                    <div className="h-[4px] w-full overflow-hidden rounded-[2px] bg-[var(--color-gray-200)]">
                      <div
                        className="h-full rounded-[2px] bg-[var(--color-action-primary)] transition-[width]"
                        style={{
                          width:
                            duration > 0
                              ? `${Math.min((currentTime / duration) * 100, 100)}%`
                              : '0%',
                        }}
                      />
                    </div>
                    <div className="flex w-full items-center justify-between text-[12px] font-medium text-[color:var(--color-gray-600)]">
                      <span>
                        {isSpeaking && duration > 0
                          ? '재생 중'
                          : '재생 준비 중'}
                      </span>
                      <span>
                        {Math.round(currentTime)}초 /{' '}
                        {duration > 0 ? Math.round(duration) : '--'}초
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(phase === 'idle' || phase === 'listening') && (
                <div className="flex flex-col items-center gap-[2px] py-[12px]">
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={() =>
                      phase === 'listening' && stopRecording()
                    }
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    aria-label={
                      phase === 'listening'
                        ? '듣고 있어요 (떼면 전송)'
                        : '눌러서 말하기'
                    }
                    className="relative flex size-[64px] items-center justify-center select-none"
                  >
                    {/* halo — 안 눌렀을 때만, 눌러보라고 유도하는 은은한 링 (넛지) */}
                    {phase === 'idle' && (
                      <span className="absolute -inset-[8px] rounded-full bg-[var(--color-action-primary)]/15 animate-pulse" />
                    )}
                    {/* 눌러서 얘기하는 중 — 바깥 halo(64px, 옅은 파랑) + 안쪽 진한 원(48px) */}
                    {phase === 'listening' && (
                      <span className="absolute inset-0 rounded-full bg-blue-500/25" />
                    )}
                    <span
                      className={`relative flex items-center justify-center rounded-full bg-[var(--color-action-primary)] transition-transform ${
                        phase === 'listening'
                          ? 'size-12 bg-blue-800'
                          : 'size-[64px]  shadow-[0px_4px_12px_0px_rgba(53,129,255,0.35)]'
                      }`}
                    >
                      <img
                        src={imgMicIcon}
                        alt=""
                        width="15"
                        height="15"
                        className="text-[color:var(--color-text-inverse)]"
                      />
                    </span>
                  </button>
                  <span className="text-[12px] font-medium text-[color:var(--color-action-primary)]">
                    {phase === 'listening' ? '듣고 있어요...' : '눌러서 말하기'}
                  </span>
                  {phase === 'listening' && showHeardCaption && heardText && (
                    <span className="pt-[6px] text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                      {heardText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AiInsight (SUMMARY) — 실제 API 필드가 없어서 지금은 고정 문구입니다.
            추천 근거를 구조화해서 내려주는 필드가 생기면 그걸로 교체하면 돼요. */}
        <div className="flex w-full flex-col items-start px-[20px] pb-[16px]">
          <div className="flex w-full items-start gap-[12px] rounded-[12px] border border-[var(--color-blue-180,#c8dfff)] bg-[var(--color-blue-50)] p-[17px] shadow-[0px_2px_8px_var(--color-black-alpha-8)]">
            <span className="shrink-0 rounded-[4px] bg-[var(--color-action-primary)] px-[6px] py-[2px] text-[10px] font-bold text-[color:var(--color-text-inverse)]">
              SUMMARY
            </span>
            <p className="text-[14px] leading-[1.6] text-[color:var(--color-blue-text-muted,#285a8f)]">
              기사님의 선호 패턴을 분석하여 3안 중{' '}
              <strong className="font-bold">가장 높은 순수익</strong>을
              제안합니다.
            </p>
          </div>
        </div>

        {/* MetricGrid — 기존 데이터(예상 대기 / 성사 확률) 유지하고 카드 스타일만 Figma에 맞춤 */}
        {briefing && (
          <div className="flex w-full gap-[12px] px-[20px] pb-[16px]">
            <div className="flex-1 rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] p-[16px] shadow-[0px_2px_8px_var(--color-black-alpha-8)]">
              <p className="text-[12px] text-[color:var(--color-gray-600)]">
                예상 대기
              </p>
              <p className="text-[16px] font-bold text-[color:var(--color-text-primary)]">
                {briefing.expected_wait_min}분
              </p>
            </div>
            <div className="flex-1 rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-white-1000)] p-[16px] shadow-[0px_2px_8px_var(--color-black-alpha-8)]">
              <p className="text-[12px] text-[color:var(--color-gray-600)]">
                성사 확률
              </p>
              <p className="text-[16px] font-bold text-[color:var(--color-text-primary)]">
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
