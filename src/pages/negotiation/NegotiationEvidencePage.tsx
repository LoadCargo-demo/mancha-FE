// Figma 레이어: 오퍼-근거조회. AI가 추천 패키지를 고른 근거(손익 비교, 참고 데이터)를 보여주는 화면입니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Close from '@iconify-react/material-symbols-light/close';
import Schedule from '@iconify-react/material-symbols-light/schedule';
import Calculate from '@iconify-react/material-symbols-light/calculate';
import type { ComponentType } from 'react';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import ComparisonBarCard from '../../components/negotiation/ComparisonBarCard';
import DataChip from '../../components/negotiation/DataChip';
import { ROUTES } from '../../router/routes';
import { getBriefingAdjustment } from '@/api/negotiation/briefing';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import {
  withOrdinalLabels,
  type RankedPackage,
} from '@/api/negotiation/packageOrdinal';

function iconForDeduction(
  label: string,
): ComponentType<{ width?: string; height?: string; className?: string }> {
  return label.includes('대기') ? Schedule : Calculate;
}

// 백엔드가 텍스트에 라운딩 안 된 float(예: 103.19999999999999km)를 그대로 박아 보내서
// 표시 직전에 소수점 1자리로 다듬는다.
function cleanFloatPrecision(text: string): string {
  return text.replace(/\d+\.\d{3,}/g, (match) => Number(match).toFixed(1));
}

export default function NegotiationEvidencePage() {
  const navigate = useNavigate();
  const [ranked, setRanked] = useState<RankedPackage[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBriefingAdjustment()
      .then((res) => {
        if (!cancelled) setRanked(withOrdinalLabels(res.packages));
      })
      .catch(() => {
        if (!cancelled) setError('근거 데이터를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const recommended = ranked?.find((r) => r.evaluation.package.is_recommended);
  const alternatives =
    ranked?.filter((r) => !r.evaluation.package.is_recommended) ?? [];
  // 추천 결론 배너에 쓸 비교 대상 — ranked 배열이 이미 순위순으로 정렬돼 있다는
  // 전제하에, 대안 중 1순위(= 추천 다음으로 근접한 패키지)를 기준으로 문구를 만든다.
  const headlineAlternative = alternatives[0];
  const maxNominal = Math.max(
    recommended?.evaluation.package.nominal_profit ?? 0,
    ...alternatives.map((a) => a.evaluation.package.nominal_profit),
    1,
  );

  const profitGap =
    recommended && headlineAlternative
      ? recommended.evaluation.adjusted_profit -
        headlineAlternative.evaluation.adjusted_profit
      : 0;
  // 대안이 정책상 하드 위반으로 자동 제외된 경우("최대수익형인데 수작업 포함" 같은 케이스)엔
  // 실수익이 대안보다 낮아도(음수 gap) "더 남아요"라고 주장하면 말이 안 되므로 문구를 분기한다.
  const alternativeExcludedReason =
    headlineAlternative?.evaluation.package.excluded_reason ?? null;

  return (
    <div className="flex h-[100dvh] mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        title="보정 내역"
        showRightAction={false}
        leftIcon={<Close width="24" height="24" />}
        onBack={() => navigate(-1)}
      />

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[var(--spacing-screen)] pt-[16px]">
        {error && (
          <p className="text-[13px] text-[color:var(--color-point-red)]">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="text-[13px] text-[color:var(--color-text-secondary)]">
            근거를 계산하고 있어요...
          </p>
        )}

        {recommended && headlineAlternative && (
          <>
            <div className="flex flex-col gap-[8px] rounded-[12px] bg-[var(--color-navy)] p-[16px]">
              <span className="text-[13px] font-semibold text-[color:var(--color-light-blue)]">
                추천 결론
              </span>
              {alternativeExcludedReason ? (
                <>
                  <p className="text-[18px] font-bold text-[color:var(--color-text-inverse)]">
                    {headlineAlternative.ordinal}은 조건 위반으로 자동
                    제외됐어요
                  </p>
                  <p className="text-[13px] leading-[1.5] text-[color:rgba(255,255,255,0.7)]">
                    {alternativeExcludedReason}
                  </p>
                </>
              ) : profitGap > 0 ? (
                <>
                  <p className="text-[18px] font-bold text-[color:var(--color-text-inverse)]">
                    실제로는 {recommended.ordinal}이{' '}
                    {profitGap.toLocaleString()}원 더 남아요
                  </p>
                  <p className="text-[13px] leading-[1.5] text-[color:rgba(255,255,255,0.7)]">
                    받는 돈은 {headlineAlternative.ordinal}이 높지만, 대기시간과
                    공차 비용을 빼면 순위가 바뀝니다.
                  </p>
                </>
              ) : (
                <p className="text-[18px] font-bold text-[color:var(--color-text-inverse)]">
                  대기·공차 비용까지 고려해 {recommended.ordinal}을 추천해요
                </p>
              )}
            </div>

            <ComparisonBarCard
              rankLabel={recommended.ordinal}
              typeName={recommended.evaluation.package.label}
              starred
              nominalValue={recommended.evaluation.package.nominal_profit.toLocaleString()}
              nominalBarPercent={
                (recommended.evaluation.package.nominal_profit / maxNominal) *
                100
              }
              netValue={recommended.evaluation.adjusted_profit.toLocaleString()}
              netBarPercent={
                (recommended.evaluation.adjusted_profit / maxNominal) * 100
              }
              netValueTone="positive"
              note={
                recommended.evaluation.package.excluded_reason ??
                `공차 ${recommended.evaluation.package.empty_km.toFixed(1)}km · 제약 위반 없음`
              }
              noteTone={
                recommended.evaluation.package.excluded_reason
                  ? 'negative'
                  : 'positive'
              }
            />

            {alternatives.map((alternative) => (
              <ComparisonBarCard
                key={alternative.ordinal}
                rankLabel={alternative.ordinal}
                typeName={alternative.evaluation.package.label}
                nominalValue={alternative.evaluation.package.nominal_profit.toLocaleString()}
                nominalBarPercent={
                  (alternative.evaluation.package.nominal_profit / maxNominal) *
                  100
                }
                netValue={alternative.evaluation.adjusted_profit.toLocaleString()}
                netBarPercent={
                  (alternative.evaluation.adjusted_profit / maxNominal) * 100
                }
                netValueTone={
                  alternative.evaluation.package.excluded_reason
                    ? 'negative'
                    : 'positive'
                }
                note={
                  alternative.evaluation.package.excluded_reason ??
                  `공차 ${alternative.evaluation.package.empty_km.toFixed(1)}km · 제약 위반 없음`
                }
                noteTone={
                  alternative.evaluation.package.excluded_reason
                    ? 'negative'
                    : 'positive'
                }
              />
            ))}

            <div className="flex flex-col gap-[8px] rounded-[12px] border border-[var(--color-gray-200)] bg-[var(--color-gray-100)] p-[16px]">
              <div className="flex items-center gap-[4px]">
                <p className="text-[14px] font-medium text-[color:var(--color-text-secondary)]">
                  이 판단에 쓰인 데이터
                </p>
                <span className="rounded-[2px] bg-[var(--color-gray-400)] px-[8px] py-[2px] text-[12px] font-semibold text-[color:var(--color-text-inverse)]">
                  근거 추적
                </span>
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {recommended.evaluation.deductions.map((deduction) => (
                  <DataChip
                    key={deduction.label}
                    icon={iconForDeduction(deduction.label)}
                    label={cleanFloatPrecision(deduction.source)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomCTA
        type="Split"
        confirmLabel={`${recommended?.ordinal ?? ''}으로 확정`}
        onSecondaryClick={() => navigate(ROUTES.negotiationCompare)}
        onPrimaryClick={() => navigate(ROUTES.negotiationResult)}
      />
    </div>
  );
}
