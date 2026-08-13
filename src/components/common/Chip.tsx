//오퍼2 "고정 일정" 태그 ("수 19:00 병원(허리)" 등). onRemove가 있으면 x 버튼이 붙습니다.

import Close from '@iconify-react/material-symbols-light/close';

export type ChipProps = {
  label: string;
  onRemove?: () => void;
};

export default function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="flex items-center gap-[4px] rounded-full bg-[var(--color-gray-100)] py-[8px] pl-[12px] pr-[8px] text-[13px] font-medium text-[color:var(--color-text-primary)]">
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
            className="text-[color:var(--color-gray-400)]"
          />
        </button>
      )}
    </span>
  );
}
