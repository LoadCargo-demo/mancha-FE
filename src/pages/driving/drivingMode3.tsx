// Figma: 주행중3 — 실시간 재조립 제안
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, TriangleAlert } from 'lucide-react';
import BarChart from '@iconify-react/material-symbols-light/bar-chart';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import { ROUTES } from '../../router/routes';
import { applyRebuild, type DrivingEventResponse } from '@/api/driving/driving';
import type { Package } from '@/api/negotiation/pipeline';
import { GeminiTTS } from '@/hooks/GeminiTTS';

const KAKAO_NAVY = '#012155';
const KAKAO_YELLOW = '#fae100';

type LocationState = {
  eventResult: DrivingEventResponse;
  delayedOrderLabel: string;
  delayMin: number;
  originalPackage: Package | null;
  audioUrl?: string | null;
};

function formatWon(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}

export default function DrivingMode3Page() {
  const { playPreloadedTTS, isSpeaking, playTTS } = GeminiTTS();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [applying, setApplying] = useState(false);
  const tradeoff_text = state?.eventResult?.tradeoff_text;
  const hasPlayedRef = useRef(false);
  const audioUrl = state?.audioUrl;

  useEffect(() => {
    // 아직 한 번도 재생한 적이 없을 때만 실행
    if (!hasPlayedRef.current) {
      if (audioUrl) {
        // 케이스 A: 이전 화면에서 음성 파일 다운로드가 완료되어 URL이 잘 넘어온 경우 (0.1초 즉시 재생)
        hasPlayedRef.current = true;
        playPreloadedTTS(audioUrl);
      } else if (tradeoff_text) {
        // 케이스 B: 유저가 버튼을 너무 빨리 눌러서 미처 오디오 URL이 안 넘어온 경우 (여기서 직접 호출해서 재생)
        hasPlayedRef.current = true;
        playTTS(tradeoff_text); // 기본 목소리 재생
      }
    }
  }, [audioUrl, tradeoff_text, playPreloadedTTS, playTTS]);

  // 주행중2를 거치지 않고 직접 들어온 경우, 또는 백엔드가 new_package를 null로
  // 준 경우(대안 없음 등) 둘 다 방어 — state만 체크하면 안쪽 null까지는 못 잡음
  if (!state?.eventResult?.new_package) {
    return (
      <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-[#000d22] items-center justify-center gap-[12px] px-[20px]">
        <p className="text-[14px] text-[#8d9bb2] text-center">
          재조립 제안 정보가 없습니다. 주행중 화면에서 지연 알림을 통해
          들어와주세요.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.drivingMode2)}
          className="text-[14px] font-bold text-[#3581ff]"
        >
          주행 화면으로 돌아가기
        </button>
      </div>
    );
  }

  const { eventResult, delayedOrderLabel, delayMin, originalPackage } = state;
  const { new_package, diff } = eventResult;
  const handleConfirmSwap = async () => {
    setApplying(true);
    try {
      const applied = await applyRebuild();
      navigate(ROUTES.Reassembly, { state: { applied, originalPackage } });
    } catch (err) {
      console.error('재조립 적용 실패:', err);
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-[#000d22]">
      <div className="relative z-20">
        <SystemStatusBar variant="dark" />
      </div>

      <div className="h-[52px] px-[12px] bg-[#000d22] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="닫기"
          className="p-[8px]"
        >
          <X className="size-[24px] text-[#f7fbff]" strokeWidth={2} />
        </button>
        <p className="text-[18px] font-bold text-[#f7fbff]">
          실시간 재조립 제안
        </p>
        <div className="size-[40px]" />
      </div>

      <div className="flex-1 overflow-y-auto py-[20px] flex flex-col">
        {/* 지연 알림 */}
        <div className="px-[20px] pb-[16px]">
          <div className="bg-[#2a1722] rounded-[12px] p-[16px] flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px]">
              <TriangleAlert
                className="size-[19px] text-[#ff5b66] shrink-0"
                strokeWidth={2}
              />
              <span className="text-[18px] font-bold text-[#ff5b66] leading-[27px]">
                {delayedOrderLabel} 상차 {delayMin}분 지연
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[14px] text-[#8d9bb2] leading-[21px]">
                새로운 최적 경로를 계산했습니다
              </span>
              <span
                className="text-[12px] font-semibold text-[#8d9bb2] rounded-[8px] px-[8px] py-[4px]"
                style={{ backgroundColor: KAKAO_NAVY }}
              >
                AI 자동 감지
              </span>
            </div>
          </div>
        </div>

        {/* 에이전트 메시지 — 실제 tradeoff_text 그대로 사용 */}
        <div className="px-[20px] pb-[16px]">
          <div
            className="rounded-[12px] border shadow-sm flex flex-col items-center justify-center p-[25px]"
            style={{ backgroundColor: KAKAO_NAVY, borderColor: KAKAO_NAVY }}
          >
            <p className="text-[12px] font-semibold text-[#8d9bb2] leading-[21px]">
              리빌더 에이전트
            </p>
            <div className="w-[236px] py-[20px] flex flex-col items-center">
              <p className="text-[18px] font-bold text-center leading-[1.45] text-[#f7fbff]">
                {tradeoff_text}
              </p>
            </div>
            <div className="flex items-center justify-center py-[8px]">
              <BarChart
                width="28"
                height="28"
                className={`text-[color:var(--color-action-primary)] ${
                  isSpeaking ? 'animate-pulse' : 'opacity-40'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 변경 영향 카드 — 실제 diff 값 */}
        <div className="px-[20px] pb-[16px]">
          <div
            className="rounded-[12px] border p-[13px] flex flex-col gap-[7px]"
            style={{ backgroundColor: KAKAO_NAVY, borderColor: KAKAO_NAVY }}
          >
            <div className="flex items-center justify-between border-b border-[#ebebeb]/20 pb-[9px]">
              <div className="flex-1 flex flex-col gap-[4px] border-r border-[#ebebeb]/20 pr-[16px]">
                <span className="text-[14px] text-[#8d9bb2] leading-[21px]">
                  교체 시 복귀
                </span>
                <span
                  className="text-[18px] font-bold leading-[27px]"
                  style={{ color: KAKAO_YELLOW }}
                >
                  {new_package.return_time}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-[4px] pl-[16px]">
                <span className="text-[14px] text-[#8d9bb2] leading-[21px]">
                  수익 변화
                </span>
                <span className="text-[18px] font-bold text-[#8d9bb2] leading-[27px]">
                  {formatWon(diff.profit_diff)}
                </span>
              </div>
            </div>
            <p className="text-[14px] text-[#8d9bb2] leading-[22.75px]">
              복귀시간 변화 {diff.return_time_diff_min > 0 ? '+' : ''}
              {diff.return_time_diff_min}분 · 공차 변화{' '}
              {diff.empty_km_diff.toFixed(1)}km
            </p>
          </div>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="shrink-0 flex flex-col gap-[12px] px-[20px] pt-[20px] pb-[32px]">
        <button
          type="button"
          onClick={handleConfirmSwap}
          disabled={applying}
          className="h-[52px] rounded-[12px] shadow-[0px_3px_15px_-2px_rgba(250,225,0,0.35),0px_4px_6px_-4px_rgba(250,225,0,0.35)] flex items-center justify-center disabled:opacity-60"
          style={{ backgroundColor: KAKAO_YELLOW }}
        >
          <span className="text-[16px] font-bold" style={{ color: KAKAO_NAVY }}>
            {applying ? '적용 중...' : '바꿔줘'}
          </span>
        </button>
        <div className="flex gap-[12px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-[52px] rounded-[12px] border flex items-center justify-center"
            style={{ backgroundColor: KAKAO_NAVY, borderColor: KAKAO_NAVY }}
          >
            <span className="text-[14px] font-bold text-[#f7fbff]">
              그냥 갈게
            </span>
          </button>
          <button
            type="button"
            className="flex-1 h-[52px] rounded-[12px] border flex items-center justify-center"
            style={{ backgroundColor: KAKAO_NAVY, borderColor: KAKAO_NAVY }}
          >
            <span className="text-[16px] font-bold text-[#f7fbff]">자세히</span>
          </button>
        </div>
      </div>
    </div>
  );
}
