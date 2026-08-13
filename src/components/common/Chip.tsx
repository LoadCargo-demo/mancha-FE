//오퍼2 "고정 일정" 태그 ("수 19:00 병원(허리)" 등). onRemove가 있으면 x 버튼이 붙습니다.

import Close from '@iconify-react/material-symbols-light/close';

export type ChipProps = {
  label: string;
  onRemove?: () => void;
};

export default function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="flex h-[40px] items-center gap-[4px] rounded-full bg-[var(--color-gray-800)] py-[8px] pl-[16px] pr-[12px] text-[13px] font-medium text-[color:var(--color-text-inverse)]">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${label} 삭제`}
          className="flex items-center justify-center"
        >
          <Close
            width="14"
            height="14"
            className="text-[color:var(--color-text-inverse)] opacity-70"
          />
        </button>
      )}
    </span>
  );
}
