// 화면 상단의 뒤로가기 + 타이틀 + 더보기 구조의 공용 네비게이션 바입니다.

import type { ReactNode } from 'react';

import imgChevronLeft from '../../assets/icons/back.svg';
import imgMoreVerticalVector from '../../assets/icons/vertical.svg';

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <div
      className={className || 'overflow-clip relative size-[24px]'}
      data-name="more-vertical"
    >
      <div className="absolute inset-[45.83%]">
        <div className="absolute inset-[-50%]">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgMoreVerticalVector}
          />
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[45.83%] right-[45.83%] top-[16.67%]">
        <div className="absolute inset-[-50%]">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgMoreVerticalVector}
          />
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-[45.83%] right-[45.83%] top-3/4">
        <div className="absolute inset-[-50%]">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgMoreVerticalVector}
          />
        </div>
      </div>
    </div>
  );
}

export type NavigationProps = {
  className?: string;
  /** Default: 뒤로가기 + 가운데 타이틀 1줄 / Briefing: 날짜 + "오늘의 브리핑" 2단 타이틀 */
  type?: 'Default' | 'Briefing';
  title?: string;
  /** Briefing 타입일 때만 사용되는 날짜 라벨 (예: "7월 29일 수요일") */
  dateLabel?: string;
  showLeftAction?: boolean;
  showRightAction?: boolean;
  leftIcon?: ReactNode;
  onBack?: () => void;
  onMore?: () => void;
};

export default function Navigation({
  className,
  type = 'Default',
  title = '등록하기',
  dateLabel = '7월 29일 수요일',
  showLeftAction = true,
  showRightAction = true,
  leftIcon,
  onBack,
  onMore,
}: NavigationProps) {
  const isBriefing = type === 'Briefing';
  const isDefault = type === 'Default';

  return (
    <div
      className={
        className ||
        'bg-[var(--color-white-1000)] content-stretch flex h-[52px] items-center justify-between px-[12px] relative w-full max-w-[390px]'
      }
    >
      {(isDefault || isBriefing) && showLeftAction && (
        <button
          type="button"
          onClick={onBack}
          className="content-stretch flex flex-col items-start p-[8px] relative shrink-0"
          aria-label="뒤로가기"
        >
          {leftIcon || (
            <div className="overflow-clip relative shrink-0 size-[24px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    src={imgChevronLeft}
                  />
                </div>
              </div>
            </div>
          )}
        </button>
      )}

      {isDefault && (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[4px] h-[22px] items-center justify-center left-1/2 top-1/2 w-[286px]">
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0">
            <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-[color:var(--color-gray-900)] text-center whitespace-nowrap">
              <p className="leading-[1.4]">{title}</p>
            </div>
          </div>
        </div>
      )}

      {isBriefing && (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[4px] h-[24px] items-center justify-center leading-[0] left-1/2 not-italic top-1/2 w-[286px] whitespace-nowrap">
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[18px] text-[color:var(--color-text-primary)]">
            <p className="leading-[24px]">{dateLabel}</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[16px] text-[color:var(--color-gray-300)]">
            <p className="leading-[24px]">|</p>
          </div>
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[18px] text-[color:var(--color-text-primary)]">
            <p className="leading-[24px]">오늘의 브리핑</p>
          </div>
        </div>
      )}

      {(isDefault || isBriefing) && showRightAction && (
        <button
          type="button"
          onClick={onMore}
          className={
            isDefault
              ? 'absolute content-stretch flex flex-col items-start left-[338px] p-[8px] top-[6px]'
              : 'content-stretch flex flex-col items-start p-[8px] relative shrink-0'
          }
          aria-label="더보기"
        >
          <MoreVerticalIcon />
        </button>
      )}
    </div>
  );
}
