// Figma 레이어: 124 - color proposal. 오퍼 탭 기본 화면 — 오늘 확정된 하루 일정 요약입니다.
// MobileLayout 안에 있는 화면이라 SystemStatusBar/BottomTabBar는 MobileLayout이 자동으로 붙여줌
// (여기서 따로 렌더링하면 두 번씩 겹쳐서 나옴).

import { useEffect, useState } from 'react';
import EventAvailable from '@iconify-react/material-symbols-light/event-available';

import {
  getVoiceBriefing,
  postBriefingConfirm,
} from '@/api/negotiation/briefing';
import type { ConfirmResponse } from '../../api/negotiation/types';
import { useNegotiationStore } from '../../store/useNegotiationStore';

type RouteStopRowProps = {
  time: string;
  location: string;
  action: string;
  fixed: boolean;
};

function RouteStopRow({ time, location, action, fixed }: RouteStopRowProps) {
  return (
    <div className="flex items-center justify-between gap-[12px] rounded-[12px] border border-[var(--color-gray-100)] px-[14px] py-[12px]">
      <div className="flex items-center gap-[12px]">
        <span className="w-[44px] shrink-0 text-[13px] font-semibold text-[color:var(--color-text-secondary)]">
          {time}
        </span>
        <span className="text-[14px] text-[color:var(--color-text-primary)]">
          {location} {action}
        </span>
      </div>
      {fixed && (
        <span className="shrink-0 rounded-full bg-[var(--color-gray-100)] px-[8px] py-[2px] text-[11px] font-semibold text-[color:var(--color-text-secondary)]">
          고정
        </span>
      )}
    </div>
  );
}

export default function OfferSummaryPage() {
  const recommendedPackageId = useNegotiationStore(
    (s) => s.recommendedPackageId,
  );
  const setRecommendedPackageId = useNegotiationStore(
    (s) => s.setRecommendedPackageId,
  );
  const [confirmed, setConfirmed] = useState<ConfirmResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const confirmWith = (packageId: string) =>
      postBriefingConfirm(packageId).then((res) => {
        if (!cancelled) setConfirmed(res);
      });

    const run = recommendedPackageId
      ? confirmWith(recommendedPackageId)
      : getVoiceBriefing().then((briefing) => {
          if (cancelled) return;
          setRecommendedPackageId(briefing.recommended_package_id);
          return confirmWith(briefing.recommended_package_id);
        });

    run
      .catch(() => {
        if (!cancelled) setError('오늘 하루 예약 정보를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recommendedPackageId, setRecommendedPackageId]);

  return (
    <div className="flex min-h-full w-full flex-col gap-[16px] bg-[var(--color-white-1000)] px-[var(--spacing-screen)] py-[16px]">
      <div className="flex items-start justify-between gap-[12px] rounded-[12px] bg-[var(--color-blue-50)] p-[16px]">
        <div className="flex flex-col gap-[4px]">
          <p className="text-[17px] font-bold text-[color:var(--color-text-primary)]">
            오늘 하루가 예약되었습니다
          </p>
          <p className="text-[13px] text-[color:var(--color-text-secondary)]">
            {confirmed
              ? `오더 ${confirmed.package.order_ids.length}건 배차 확정 · 자동 통보 완료`
              : '오더 배차를 확정하고 있어요...'}
          </p>
        </div>
        <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[var(--color-white-1000)]">
          <EventAvailable
            width="20"
            height="20"
            className="text-[color:var(--color-action-primary)]"
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-[color:var(--color-point-red)]">
          {error}
        </p>
      )}

      {isLoading && !confirmed && (
        <p className="text-[13px] text-[color:var(--color-text-secondary)]">
          불러오는 중...
        </p>
      )}

      {confirmed && (
        <>
          <div className="flex items-center justify-between px-[4px]">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[13px] text-[color:var(--color-text-secondary)]">
                예상 실수익
              </span>
              <span className="text-[24px] font-bold text-[color:var(--color-text-primary)]">
                ₩{confirmed.adjusted_profit.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="text-[13px] text-[color:var(--color-text-secondary)]">
                복귀
              </span>
              <span className="text-[18px] font-semibold text-[color:var(--color-text-primary)]">
                {confirmed.package.return_time}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-[var(--color-gray-100)] p-[14px]">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] font-semibold text-[color:var(--color-text-primary)]">
                {confirmed.package.empty_km === 0 ? '공차 없음' : '공차 거리'}
              </span>
              <span className="text-[12px] text-[color:var(--color-text-secondary)]">
                {confirmed.package.label} 패키지 기준
              </span>
            </div>
            <span className="text-[15px] font-bold text-[color:var(--color-action-primary)]">
              {confirmed.package.empty_km.toFixed(1)} km
            </span>
          </div>

          <div className="flex flex-col gap-[8px]">
            <p className="text-[15px] font-bold text-[color:var(--color-text-primary)]">
              오늘의 하루
            </p>
            {confirmed.package.blocks.map((block, index) => (
              <RouteStopRow
                key={`${block.arrival_time}-${index}`}
                time={block.arrival_time}
                location={block.location}
                action={block.action}
                fixed={block.is_fixed}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
