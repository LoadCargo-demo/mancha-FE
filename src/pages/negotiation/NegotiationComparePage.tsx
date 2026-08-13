// Figma 레이어: 840. 오늘 등록할 데일리 패키지를 최종 비교하고 확정하는 화면입니다.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navigation from '../../components/common/Navigation';
import BottomCTA from '../../components/common/BottomCTA';
import RecommendationCard from '../../components/negotiation/RecommendationCard';
import { ROUTES } from '../../router/routes';
import { getBriefingCompare } from '@/api/negotiation/briefing';
import SystemStatusBar from '../../components/common/SystemStatusBar';
import { useNegotiationStore } from '../../store/useNegotiationStore';
import {
  withOrdinalLabels,
  type RankedPackage,
} from '@/api/negotiation/packageOrdinal';

export default function NegotiationComparePage() {
  const navigate = useNavigate();
  const setRecommendedPackageId = useNegotiationStore(
    (s) => s.setRecommendedPackageId,
  );
  const [ranked, setRanked] = useState<RankedPackage[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrdinal, setSelectedOrdinal] = useState<string | null>(null);

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
  const excluded = ranked?.find((r) => r.evaluation.package.excluded_reason);
  // '3안'이라는 라벨로 찾으면 추천안 자체가 3안일 때 recommended랑 겹쳐서 카드가
  // 중복으로 뜬다. 추천도 아니고 제외도 아닌, 나란히 보여줄 '다른 옵션'을 찾는다.
  const otherOption = ranked?.find(
    (r) =>
      !r.evaluation.package.is_recommended && r.ordinal !== excluded?.ordinal,
  );

  const selected =
    ranked?.find((r) => r.ordinal === selectedOrdinal) ?? recommended;

  return (
    <div className="flex h-[100dvh] mx-auto w-full max-w-[390px] flex-col bg-[var(--color-white-1000)]">
      <SystemStatusBar />
      <Navigation
        title="등록하기"
        showRightAction={false}
        onBack={() => navigate(-1)}
      />

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto pt-[16px]">
        <div className="flex flex-col gap-[8px] px-[var(--spacing-screen)]">
          <h1 className="text-[24px] font-bold leading-[1.45] text-[color:var(--color-text-primary)]">
            기사님의 공차 감소를 위해,
            <br />
            {recommended?.ordinal ?? '추천안'}이 가장 적절해요.
          </h1>
          <p className="text-[14px] text-[color:var(--color-text-secondary)]">
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

        {recommended && otherOption && (
          <>
            <div
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              className="no-scrollbar flex shrink-0 gap-[16px] overflow-x-auto [overflow-y:visible] px-[var(--spacing-screen)] pb-[8px] pt-[6px]"
            >
              <button
                type="button"
                onClick={() => setSelectedOrdinal(recommended.ordinal)}
                className={`shrink-0 rounded-[12px] text-left ${
                  selected?.ordinal === recommended.ordinal
                    ? 'ring-2 ring-[var(--color-action-primary)] ring-offset-2'
                    : ''
                }`}
              >
                <RecommendationCard
                  rankLabel={recommended.ordinal}
                  typeName={recommended.evaluation.package.label}
                  recommended
                  netIncome={`${recommended.evaluation.adjusted_profit.toLocaleString()}원`}
                  nominalIncome={recommended.evaluation.package.nominal_profit.toLocaleString()}
                  returnTime={recommended.evaluation.package.return_time}
                  emptyDistance={`${recommended.evaluation.package.empty_km.toFixed(1)}km`}
                />
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrdinal(otherOption.ordinal)}
                className={`shrink-0 rounded-[12px] text-left ${
                  selected?.ordinal === otherOption.ordinal
                    ? 'ring-2 ring-[var(--color-action-primary)] ring-offset-2'
                    : ''
                }`}
              >
                <RecommendationCard
                  rankLabel={otherOption.ordinal}
                  typeName={otherOption.evaluation.package.label}
                  netIncome={`${otherOption.evaluation.adjusted_profit.toLocaleString()}원`}
                  nominalIncome={otherOption.evaluation.package.nominal_profit.toLocaleString()}
                  returnTime={otherOption.evaluation.package.return_time}
                  emptyDistance={`${otherOption.evaluation.package.empty_km.toFixed(1)}km`}
                />
              </button>
              {/* 제외된 패키지는 정책 위반으로 자동 제외된 거라 선택 대상이 아님 — 클릭 불가, 흐리게만 표시 */}
              {excluded && excluded.ordinal !== otherOption.ordinal && (
                <div className="shrink-0 opacity-60">
                  <RecommendationCard
                    rankLabel={excluded.ordinal}
                    typeName={excluded.evaluation.package.label}
                    excluded
                    netIncome={`${excluded.evaluation.adjusted_profit.toLocaleString()}원`}
                    nominalIncome={excluded.evaluation.package.nominal_profit.toLocaleString()}
                    returnTime={excluded.evaluation.package.return_time}
                    emptyDistance={`${excluded.evaluation.package.empty_km.toFixed(1)}km`}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-[8px] px-[var(--spacing-screen)]">
              {reason && (
                <div className="flex flex-col gap-[8px] rounded-[12px] bg-[var(--color-gray-100)] p-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 rounded-[13px] bg-[var(--color-gray-300)] px-[8px] py-[2px] text-[12px] font-semibold text-[color:var(--color-text-inverse)]">
                      AI 근거
                    </span>
                    <p className="text-[14px] font-bold text-[color:var(--color-text-primary)]">
                      {recommended.ordinal}을 추천하는 이유
                    </p>
                  </div>
                  <p className="text-[14px] leading-[1.4] text-[color:var(--color-text-secondary)]">
                    {reason}
                  </p>
                </div>
              )}

              {excluded && (
                <div className="flex flex-col gap-[8px] rounded-[12px] bg-[var(--color-gray-100)] p-[16px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="shrink-0 rounded-[13px] bg-[var(--color-gray-300)] px-[8px] py-[2px] text-[12px] font-semibold text-[color:var(--color-text-inverse)]">
                      AI 근거
                    </span>
                    <p className="text-[14px] font-bold text-[color:var(--color-text-primary)]">
                      {excluded.ordinal} 자동 제외
                    </p>
                  </div>
                  <p className="text-[14px] leading-[1.4] text-[color:var(--color-text-secondary)]">
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
        label={`${selected?.ordinal ?? ''}으로 확정`}
        onPrimaryClick={() => {
          // OfferSummaryPage는 이 스토어 값(recommendedPackageId)을 읽어서 확정 API를
          // 호출하므로, 사용자가 다른 패키지를 골랐으면 여기서 덮어써야 반영된다.
          if (selected) {
            setRecommendedPackageId(selected.evaluation.package.package_id);
          }
          navigate(ROUTES.offer);
        }}
      />
    </div>
  );
}
