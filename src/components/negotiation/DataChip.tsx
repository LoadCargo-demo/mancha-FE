// 오퍼-근거조회 "이 판단에 쓰인 데이터", 839 "이 답변의 출처"에서 반복되는 데이터 칩.

import type { ComponentType } from 'react';

export type DataChipProps = {
  icon: ComponentType<{ width?: string; height?: string; className?: string }>;
  label: string;
  /**
   * 'pill': 흰 배경 알약형(rounded-[37px]) — 오퍼-근거조회에서 사용.
   * 'subtle': 회색 배경(rounded-[12px]) — 839 "이 답변의 출처"에서 사용.
   */
  variant?: 'pill' | 'subtle';
};

export default function DataChip({
  icon: Icon,
  label,
  variant = 'pill',
}: DataChipProps) {
  if (variant === 'subtle') {
    return (
      <div className="flex h-[30px] w-fit items-center gap-[4px] rounded-[12px] border border-[var(--color-gray-300)] bg-[var(--color-gray-100)] px-[13px] py-[7px]">
        <Icon
          width="12"
          height="12"
          className="shrink-0 text-[color:var(--color-text-secondary)]"
        />
        <span className="whitespace-nowrap text-[12px] font-semibold tracking-[0.48px] text-[color:var(--color-text-primary)]">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[30px] w-fit items-center gap-[6px] rounded-[37px] border border-[var(--color-gray-300)] bg-[var(--color-white-1000)] px-[13px] py-[5px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]">
      <Icon
        width="14"
        height="14"
        className="shrink-0 text-[color:var(--color-text-secondary)]"
      />
      <span className="whitespace-nowrap text-[14px] text-[color:var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}
