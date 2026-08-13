// Figma 레이어: 840. 오늘 등록할 데일리 패키지를 최종 비교하고 확정하는 화면입니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import RecommendationCard from '../../components/negotiation/RecommendationCard';
import { ROUTES } from '../../router/routes';
import { getBriefingCompare } from '@/api/negotiation/briefing';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import {
  withOrdinalLabels,
  type RankedPackage,
} from '@/api/negotiation/packageOrdinal';

export default function NegotiationComparePage() {
  const navigate = useNavigate();
  const [ranked, setRanked] = useState<RankedPackage[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBriefingCompare()
      .then((res) => {
        if (cancelled) return;
        setRanked(withOrdinalLabels(res.packages));
        setReason(res.recommendation_reason ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('비교 데이터를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const recommended = ranked?.find((r) => r.evaluation.package.is_recommended);
  const thirdOption = ranked?.find((r) => r.ordinal === '3안');
  const excluded = ranked?.find((r) => r.evaluation.package.excluded_reason);

  return (
    <div className="flex h-dvh mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        title="등록하기"
        showRightAction={false}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col gap-[16px] pt-[8px]">
        <div className="flex flex-col gap-[8px] px-[var(--spacing-screen)]">
          <h1 className="text-[20px] font-bold leading-[1.35] text-[color:var(--color-text-primary)]">
            기사님의 공차 감소를 위해,
            <br />
            {recommended?.ordinal ?? '추천안'}이 가장 적절해요.
          </h1>
          <p className="text-[13px] text-[color:var(--color-text-secondary)]">
            기사님의 하루에 가장 적합한 데일리 패키지를 제안합니다.
          </p>
          {error && (
            <p className="text-[13px] text-[color:var(--color-point-red)]">
              {error}
            </p>
          )}
          {isLoading && (
            <p className="text-[13px] text-[color:var(--color-text-secondary)]">
              패키지를 비교하고 있어요...
            </p>
          )}
        </div>

        {recommended && thirdOption && (
          <>
            <div className="flex gap-[16px] overflow-x-auto px-[var(--spacing-screen)] pb-[4px]">
              <RecommendationCard
                rankLabel={recommended.ordinal}
                typeName={recommended.evaluation.package.label}
                recommended
                netIncome={`${recommended.evaluation.adjusted_profit.toLocaleString()}원`}
                nominalIncome={recommended.evaluation.package.nominal_profit.toLocaleString()}
                returnTime={recommended.evaluation.package.return_time}
                emptyDistance={`${recommended.evaluation.package.empty_km.toFixed(1)}km`}
              />
              <RecommendationCard
                rankLabel={thirdOption.ordinal}
                typeName={thirdOption.evaluation.package.label}
                netIncome={`${thirdOption.evaluation.adjusted_profit.toLocaleString()}원`}
                nominalIncome={thirdOption.evaluation.package.nominal_profit.toLocaleString()}
                returnTime={thirdOption.evaluation.package.return_time}
                emptyDistance={`${thirdOption.evaluation.package.empty_km.toFixed(1)}km`}
              />
            </div>

            <div className="flex flex-col gap-[8px] px-[var(--spacing-screen)]">
              {reason && (
                <div className="rounded-[12px] bg-[var(--color-gray-100)] p-[14px]">
                  <span className="mb-[6px] inline-block rounded-full bg-[var(--color-action-primary)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
                    AI 근거
                  </span>
                  <p className="mb-[4px] text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                    {recommended.ordinal}을 추천하는 이유
                  </p>
                  <p className="text-[13px] leading-[1.5] text-[color:var(--color-text-secondary)]">
                    {reason}
                  </p>
                </div>
              )}

              {excluded && (
                <div className="rounded-[12px] bg-[var(--color-gray-100)] p-[14px]">
                  <span className="mb-[6px] inline-block rounded-full bg-[var(--color-gray-400)] px-[8px] py-[2px] text-[11px] font-bold text-[color:var(--color-text-inverse)]">
                    AI 근거
                  </span>
                  <p className="mb-[4px] text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                    {excluded.ordinal} 자동 제외
                  </p>
                  <p className="text-[13px] leading-[1.5] text-[color:var(--color-text-secondary)]">
                    {excluded.evaluation.package.excluded_reason}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <BottomCTA
        type="Single"
        label="확정"
        onPrimaryClick={() => navigate(ROUTES.offer)}
      />
    </div>
  );
}
