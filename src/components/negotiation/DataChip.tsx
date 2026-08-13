// 오퍼-근거조회 "이 판단에 쓰인 데이터", 839 "이 답변의 출처"에서 반복되는 데이터 칩.

import type { ComponentType } from 'react';

export type DataChipProps = {
  icon: ComponentType<{ width?: string; height?: string; className?: string }>;
  label: string;
};

export default function DataChip({ icon: Icon, label }: DataChipProps) {
  return (
    <div className="flex items-center gap-[6px] rounded-[8px] bg-[var(--color-gray-100)] px-[12px] py-[10px]">
      <Icon
        width="14"
        height="14"
        className="shrink-0 text-[color:var(--color-text-secondary)]"
      />
      <span className="text-[13px] text-[color:var(--color-text-primary)]">
        {label}
      </span>
    </div>
  );
}
