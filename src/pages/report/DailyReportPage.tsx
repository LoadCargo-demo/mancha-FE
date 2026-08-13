// 데일리 리포트 — 저녁 복기 학습 루프 화면
// 오늘 공차 실적 + 성과 요약(실수익/복귀/대기) + AI 운행 코치의 원인 분석 +
// 내일 배차에 자동 반영되는 항목을 보여주고, "내일 하루 등록하기"로 마무리.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

import SystemStatusBar from '@/components/common/SystemStatusBar';
import { ROUTES } from '@/router/routes';
import {
  getRetrospectiveSummary,
  type RetrospectiveSummaryResponse,
} from '@/api/report/Retrospective';

/** "HH:MM" 두 개 사이 분(min) 차이. 양수면 actual이 predicted보다 늦은 것 */
function diffMinutes(predicted: string, actual: string): number {
  const [ph, pm] = predicted.split(':').map(Number);
  const [ah, am] = actual.split(':').map(Number);
  return ah * 60 + am - (ph * 60 + pm);
}

function formatManwon(won: number): string {
  return `${(won / 10000).toFixed(1)}만`;
}

export default function DailyReportPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<RetrospectiveSummaryResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRetrospectiveSummary()
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : '불러오기 실패');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white overflow-hidden">
      <SystemStatusBar />

      {/* 상단 네비게이션 */}
      <div className="h-[52px] px-[12px] flex items-center justify-between shrink-0 relative">
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-[18px] font-bold text-[color:var(--color-gray-900)]">
            데일리 리포트
          </h1>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            aria-label="닫기"
            className="p-[8px]"
          >
            <X
              className="size-[24px] text-[color:var(--color-gray-900)]"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {loading && (
        <p className="px-[20px] pt-[16px] text-[14px] text-[color:var(--color-text-secondary)]">
          불러오는 중...
        </p>
      )}
      {error && (
        <p className="px-[20px] pt-[16px] text-[14px] text-red-500">
          불러오지 못했습니다: {error}
        </p>
      )}

      {!loading && !error && summary && (
        <ReportBody
          summary={summary}
          onRegisterTomorrow={() => navigate(ROUTES.myCriteria)}
        />
      )}
    </div>
  );
}

function ReportBody({
  summary,
  onRegisterTomorrow,
}: {
  summary: RetrospectiveSummaryResponse;
  onRegisterTomorrow: () => void;
}) {
  const emptyKmDiff = summary.today_empty_km - summary.last_week_empty_km;

  const profitDiff = summary.actual_profit - summary.predicted_profit;
  const profitIsBad = profitDiff < 0;

  const waitIsBad = summary.wait_diff_min > 0;

  const returnDiff = diffMinutes(
    summary.predicted_return,
    summary.actual_return,
  );
  const returnOnTime = returnDiff === 0;

  const causeParts = (summary.structural_cause ?? '').split('구조적 특성');

  return (
    <>
      <div className="flex-1 overflow-y-auto py-[16px] flex flex-col gap-[19px] pb-[120px]">
        {/* 오늘 공차 원형 게이지 */}
        <div className="px-[20px]">
          <div className="bg-[var(--color-blue-50)] border border-[#bcd7ff] rounded-[12px] p-[20px] flex flex-col items-center">
            <div className="relative size-[128px] flex items-center justify-center mb-[20px]">
              <svg className="size-[128px] -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#bcd7ff"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="var(--color-action-primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={0}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[15px] text-[color:var(--color-text-secondary)] leading-[18px]">
                  오늘 공차
                </span>
                <span className="text-[20px] font-bold text-[color:var(--color-action-primary)] leading-[42px]">
                  {summary.today_empty_km.toFixed(1)} km
                </span>
              </div>
            </div>
            <div className="w-full border-t border-[#bcd7ff] pt-[13px] flex items-center justify-between">
              <span className="text-[14px] text-[color:var(--color-text-secondary)]">
                지난주 화요일 대비
              </span>
              <span className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
                {emptyKmDiff > 0 ? '+' : ''}
                {emptyKmDiff.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* 운행 성과 요약 */}
        <div className="px-[20px]">
          <div className="bg-white border border-[var(--color-gray-200)] rounded-[12px] p-[16px] flex flex-col gap-[16px]">
            <h2 className="text-[14px] font-medium text-[color:var(--color-text-secondary)]">
              운행 성과 요약
            </h2>
            <div className="flex gap-[8px]">
              <div className="flex-1 bg-[var(--color-gray-100)] rounded-[8px] p-[8px] flex flex-col items-center">
                <span className="text-[12px] text-[color:var(--color-gray-600)] pb-[4px]">
                  실수익
                </span>
                <span
                  className="text-[16px] font-bold"
                  style={{
                    color: profitIsBad
                      ? '#f34045'
                      : 'var(--color-action-primary)',
                  }}
                >
                  {formatManwon(summary.actual_profit)}
                </span>
                <span
                  className="text-[10px]"
                  style={{
                    color: profitIsBad
                      ? '#f34045'
                      : 'var(--color-action-primary)',
                  }}
                >
                  {profitIsBad ? '▼' : '▲'} {formatManwon(Math.abs(profitDiff))}
                </span>
              </div>
              <div className="flex-1 bg-[var(--color-gray-100)] rounded-[8px] p-[8px] flex flex-col items-center">
                <span className="text-[12px] text-[color:var(--color-gray-600)] pb-[4px]">
                  복귀
                </span>
                <span className="text-[16px] font-bold text-[color:var(--color-action-primary)]">
                  {summary.actual_return}
                </span>
                <span className="text-[10px] text-[color:var(--color-action-primary)]">
                  {returnOnTime
                    ? '정시'
                    : `${returnDiff > 0 ? '+' : ''}${returnDiff}분`}
                </span>
              </div>
              <div className="flex-1 bg-[var(--color-gray-100)] rounded-[8px] p-[8px] flex flex-col items-center">
                <span className="text-[12px] text-[color:var(--color-gray-600)] pb-[4px]">
                  대기
                </span>
                <span
                  className="text-[16px] font-bold"
                  style={{
                    color: waitIsBad
                      ? '#f34045'
                      : 'var(--color-action-primary)',
                  }}
                >
                  {summary.actual_wait_min}분
                </span>
                <span
                  className="text-[10px]"
                  style={{
                    color: waitIsBad
                      ? '#f34045'
                      : 'var(--color-action-primary)',
                  }}
                >
                  {waitIsBad ? '▲' : '▼'} {Math.abs(summary.wait_diff_min)}분
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI 운행 코치 */}
        <div className="px-[20px] flex flex-col gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="size-[24px] rounded-full bg-[#333] flex items-center justify-center shrink-0">
              <Sparkles className="size-[12px] text-white" strokeWidth={2} />
            </div>
            <h2 className="text-[14px] font-bold text-[color:var(--color-gray-900)]">
              AI 운행 코치
            </h2>
          </div>
          <div className="relative bg-[color:var(--color-gray-100)] border border-[var(--color-gray-200)] rounded-[12px] px-[17px] pt-[16px] pb-[17px]">
            <div className="absolute -top-[8px] left-[12px] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[var(--color-gray-200)]" />
            <p className="text-[14px] text-[color:var(--color-gray-900)] leading-[22.75px]">
              {causeParts.length === 2 ? (
                <>
                  {causeParts[0]}
                  <span className="font-bold">구조적 특성</span>
                  {causeParts[1]}
                </>
              ) : (
                summary.structural_cause
              )}
            </p>
          </div>
          {/* 백엔드가 명시한 투명성 고지 — 판정이 실제 ML이 아니라 규칙 기반임을 그대로 노출 */}
          <p className="text-[11px] text-[color:var(--color-gray-400)] leading-[16px] px-[4px]">
            {summary.note}
          </p>
        </div>

        {/* 내일 반영될 내용 — API가 원인 문장 하나만 주므로, 그걸로 항목 1개를 구성 */}
        <div className="px-[20px]">
          <div className="bg-white border border-[var(--color-gray-200)] rounded-[12px] p-[16px] flex flex-col gap-[12px]">
            <h2 className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
              내일 운행에 반영될 내용
            </h2>
            <div className="bg-[var(--color-blue-50)] rounded-[8px] p-[12px] flex gap-[8px] items-start">
              <CheckCircle2
                className="size-[17px] text-[color:var(--color-action-primary)] shrink-0 mt-[2px]"
                strokeWidth={2}
              />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[color:var(--color-gray-900)] leading-[21px]">
                  대기 시간 업데이트
                </span>
                <span className="text-[12px] text-[color:var(--color-text-secondary)] leading-[18px]">
                  예상 {summary.predicted_wait_min}분 → 실제{' '}
                  {summary.actual_wait_min}분 (구조적 원인 반영)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 CTA — 스크롤 영역 밖, 화면 하단에 고정 */}
      <div className="absolute bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-[var(--color-gray-200)] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.05)] px-[20px] pt-[16px] pb-[32px]">
        <button
          type="button"
          onClick={onRegisterTomorrow}
          className="w-full bg-[var(--color-action-primary)] rounded-[12px] p-[16px] shadow-[0px_6px_8px_rgba(0,0,0,0.12),0px_2px_3px_rgba(0,0,0,0.08)] flex items-center justify-center"
        >
          <span className="text-[16px] font-bold text-white">
            내일 하루 등록하기
          </span>
        </button>
      </div>
    </>
  );
}
