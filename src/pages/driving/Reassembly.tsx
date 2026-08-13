//재조립 (node 776:8310) — 재조립 완료 결과 화면
// 주행중3에서 "바꿔줘" → 실제 /api/driving/rebuild/apply 결과를 받아 타임라인을 구성한다.
// originalPackage(재조립 전 패키지)와 applied.package(재조립 후 패키지)를 order_id로
// 비교해서 사라진 주문은 "취소됨", 새로 들어온 주문은 강조 표시로 보여준다.

import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  CalendarCheck2,
  Navigation as NavigationIcon,
} from 'lucide-react';

import SystemStatusBar from '../../components/common/SystemStatusBar';
import { ROUTES } from '../../router/routes';
import type { RebuildApplyResponse } from '@/api/driving/driving';
import type { Package, PackageBlock } from '@/api/negotiation/pipeline';

type LocationState = {
  applied: RebuildApplyResponse;
  originalPackage: Package | null;
};

type TimelineItemState = 'completed' | 'added' | 'cancelled' | 'future';

type TimelineItem = {
  time: string;
  title: string;
  state: TimelineItemState;
};

/**
 * 원본 패키지와 재조립된 패키지를 order_id 기준으로 비교해서 타임라인을 만든다.
 * - 재조립 후에도 남아있는 주문 → 그대로 (완료/예정)
 * - 재조립 후 새로 추가된 주문 → 강조(added)
 * - 원본엔 있었는데 재조립 후 사라진 주문 → 취소됨(cancelled)으로 원본 블록을 그대로 끼워넣음
 * 실시간 위치 추적이 없어 "성남 상차→부산 사상 하차"까지는 이미 완료된 것으로 간주(데모 단순화).
 */
function buildTimeline(
  original: Package | null,
  applied: Package,
): TimelineItem[] {
  const originalOrderIds = new Set(original?.order_ids ?? []);
  const appliedOrderIds = new Set(applied.order_ids);

  const cancelledOrderIds = [...originalOrderIds].filter(
    (id) => !appliedOrderIds.has(id),
  );
  const addedOrderIds = new Set(
    [...appliedOrderIds].filter((id) => !originalOrderIds.has(id)),
  );

  const items: TimelineItem[] = applied.blocks.map((block: PackageBlock) => {
    const state: TimelineItemState =
      block.order_id && addedOrderIds.has(block.order_id) ? 'added' : 'future';
    return {
      time: block.arrival_time,
      title:
        block.location + (block.action !== '귀가' ? ` ${block.action}` : ''),
      state,
    };
  });

  // 취소된 주문의 원본 블록들을 끼워넣기 (원본 패키지에만 있던 블록)
  if (original) {
    for (const cancelledId of cancelledOrderIds) {
      const cancelledBlocks = original.blocks.filter(
        (b) => b.order_id === cancelledId,
      );
      for (const block of cancelledBlocks) {
        items.push({
          time: block.arrival_time,
          title:
            block.location +
            (block.action !== '귀가' ? ` ${block.action}` : ''),
          state: 'cancelled',
        });
      }
    }
  }

  // 도착 시각 순으로 정렬
  items.sort((a, b) => a.time.localeCompare(b.time));

  // 앞의 고정 구간 2개(성남 상차, 부산 하차)는 이미 완료된 것으로 표시
  return items.map((item, i) =>
    i <= 1 && item.state === 'future' ? { ...item, state: 'completed' } : item,
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  if (item.state === 'cancelled') {
    return (
      <div className="flex items-center gap-[16px] w-full">
        <span className="w-[40px] shrink-0 text-[14px] text-right text-[color:var(--color-gray-400)]">
          {item.time}
        </span>
        <div className="flex-1 h-[50px] bg-white border border-[var(--color-gray-200)] rounded-[12px] px-[13px] flex items-center justify-between">
          <span className="text-[16px] text-[color:var(--color-gray-400)] line-through">
            {item.title}
          </span>
          <span className="bg-[#f3f4f6] text-[#777] text-[11px] font-medium rounded-full px-[8px] py-[3px] shrink-0">
            취소됨
          </span>
        </div>
      </div>
    );
  }

  if (item.state === 'added') {
    return (
      <div className="flex items-center gap-[16px] w-full">
        <span className="w-[40px] shrink-0 text-[14px] text-right text-[color:var(--color-action-primary)]">
          {item.time}
        </span>
        <div className="flex-1 h-[50px] bg-[var(--color-blue-50)] border-2 border-[var(--color-action-primary)] rounded-[12px] px-[13px] flex items-center gap-[4px]">
          <span className="text-[16px] font-bold text-[color:var(--color-gray-900)]">
            {item.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[16px] w-full">
      <span className="w-[40px] shrink-0 text-[14px] text-right text-[color:var(--color-gray-600)]">
        {item.time}
      </span>
      <div className="flex-1 h-[50px] bg-white border border-[var(--color-gray-200)] rounded-[12px] px-[13px] flex items-center justify-between">
        <span className="text-[16px] font-medium text-[#666]">
          {item.title}
        </span>
        {item.state === 'completed' && (
          <Check
            className="size-[14px] text-[color:var(--color-gray-600)]"
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );
}

export default function Reassembly() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.applied?.package) {
    return (
      <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white items-center justify-center gap-[12px] px-[20px]">
        <p className="text-[14px] text-[color:var(--color-text-secondary)] text-center">
          재조립 결과 정보가 없습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.drivingMode1)}
          className="text-[14px] font-bold text-[color:var(--color-action-primary)]"
        >
          주행 화면으로 돌아가기
        </button>
      </div>
    );
  }

  const { package: pkg, diff } = state.applied;
  const timeline = buildTimeline(state.originalPackage, pkg);
  const profitLossLabel =
    diff.profit_diff < 0
      ? `-${Math.abs(diff.profit_diff).toLocaleString()}`
      : `+${diff.profit_diff.toLocaleString()}`;

  return (
    <div className="flex flex-col h-dvh max-w-[390px] mx-auto bg-white overflow-hidden">
      <SystemStatusBar />

      <div className="flex-1 overflow-y-auto pt-[16px] pb-[120px] flex flex-col gap-[16px]">
        <div className="px-[20px]">
          <div className="relative bg-[#f7fbff] border border-[#c8dfff] rounded-[12px] p-[16px] flex flex-col gap-[4px]">
            <div className="w-[258px] flex flex-col gap-[4px]">
              <h1 className="text-[20px] font-bold text-[color:var(--color-text-primary)] tracking-[-0.2px] leading-[28px]">
                하루가 재조립되었습니다
              </h1>
              <p className="text-[14px] text-[color:var(--color-text-secondary)] leading-[20px]">
                복귀 예정 {pkg.return_time} · 공차 {pkg.empty_km.toFixed(1)}km
              </p>
            </div>
            <div className="absolute right-[16px] top-[19px] size-[44px] bg-white rounded-[12px] flex items-center justify-center">
              <CalendarCheck2
                className="size-[24px] text-[color:var(--color-action-primary)]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        <div className="px-[20px]">
          <div className="flex items-end justify-between pt-[8px]">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] font-medium text-[color:var(--color-text-secondary)] leading-[18px]">
                명목 수익
              </span>
              <div className="flex items-baseline gap-[8px]">
                <span className="text-[24px] font-bold text-[color:var(--color-text-primary)] tracking-[-0.24px]">
                  ₩{pkg.nominal_profit.toLocaleString()}
                </span>
                <span className="text-[14px] text-[#f34045]">
                  {profitLossLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-[4px]">
              <span className="text-[14px] font-medium text-[color:var(--color-text-secondary)] leading-[16px]">
                복귀
              </span>
              <span className="text-[16px] font-bold text-[color:var(--color-gray-900)] leading-[24px]">
                {pkg.return_time}
              </span>
            </div>
          </div>
        </div>

        <div className="px-[20px] flex flex-col gap-[12px]">
          <h2 className="text-[16px] font-bold text-[color:var(--color-text-primary)]">
            변경된 오늘
          </h2>
          <div className="flex flex-col gap-[12px]">
            {timeline.map((item, i) => (
              <TimelineRow key={`${item.time}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-[var(--color-gray-200)] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.05)] px-[20px] pt-[16px] pb-[32px]">
        <button
          type="button"
          onClick={() => navigate(ROUTES.drivingMode1)}
          className="w-full bg-[var(--color-action-primary)] rounded-[12px] p-[16px] shadow-[0px_6px_8px_rgba(0,0,0,0.12),0px_2px_3px_rgba(0,0,0,0.08)] flex items-center justify-center gap-[8px]"
        >
          <NavigationIcon
            className="size-[16px] text-white"
            strokeWidth={2.5}
          />
          <span className="text-[16px] font-bold text-white">
            주행 화면으로
          </span>
        </button>
      </div>
    </div>
  );
}
